from django.db import transaction
from products.models import Product, ProductSize


class StockValidationError(Exception):
    pass


def validate_and_decrement_stock(items_data):
    """
    Validates and decrements stock for a list of items inside a transaction.
    Must be called inside transaction.atomic().
    
    items_data format:
    [
        {
            "product_id": int,
            "product_name": str,
            "selected_size": str,
            "quantity": int
        }, ...
    ]
    """
    if not items_data:
        return

    # Group quantities by (product_id, normalized_size) to handle duplicate cart lines correctly
    # and sort by key to prevent database deadlocks.
    aggregated = {}
    for item in items_data:
        qty = int(item.get("quantity") or 0)
        if qty <= 0:
            raise StockValidationError("Quantity must be greater than 0.")

        pid = item.get("product_id")
        raw_size = str(item.get("selected_size") or "N/A").strip()
        norm_size = raw_size if raw_size.upper() != "N/A" else "N/A"
        key = (pid, norm_size)

        if key not in aggregated:
            aggregated[key] = {
                "product_id": pid,
                "selected_size": raw_size,
                "norm_size": norm_size,
                "quantity": 0,
                "product_name": item.get("product_name", f"Product #{pid}"),
            }
        aggregated[key]["quantity"] += qty

    # Sort keys for deterministic locking order (avoids deadlocks)
    sorted_keys = sorted(aggregated.keys(), key=lambda x: (x[0], x[1]))

    targets_to_decrement = []

    for key in sorted_keys:
        group = aggregated[key]
        pid = group["product_id"]
        norm_size = group["norm_size"]
        req_qty = group["quantity"]
        pname = group["product_name"]

        target = None
        available_stock = 0

        if norm_size == "N/A":
            # Use Product.stock
            try:
                target = Product.objects.select_for_update().get(id=pid)
                available_stock = target.stock
            except Product.DoesNotExist:
                raise StockValidationError(f"Product '{pname}' was not found.")
        else:
            # Real size selected: check if ProductSize records exist for this product
            size_exists_for_product = ProductSize.objects.filter(product_id=pid).exists()
            if size_exists_for_product:
                try:
                    target = ProductSize.objects.select_for_update().get(
                        product_id=pid,
                        size__iexact=norm_size
                    )
                    available_stock = target.stock
                except ProductSize.DoesNotExist:
                    available_stock = 0
            else:
                # Product has no size variants in DB; fall back to Product.stock
                try:
                    target = Product.objects.select_for_update().get(id=pid)
                    available_stock = target.stock
                except Product.DoesNotExist:
                    raise StockValidationError(f"Product '{pname}' was not found.")

        if req_qty > available_stock:
            raise StockValidationError(f"Only {available_stock} items are available for this product/size.")

        targets_to_decrement.append((target, req_qty))

    # All stock checks passed; decrement stock
    for target, qty in targets_to_decrement:
        if target:
            target.stock -= qty
            target.save(update_fields=["stock"])


def check_stock_availability(items_data):
    """
    Checks stock availability without decrementing (used before creating Razorpay payment order).
    """
    if not items_data:
        return

    for item in items_data:
        qty = int(item.get("quantity") or 0)
        if qty <= 0:
            raise StockValidationError("Quantity must be greater than 0.")

        pid = item.get("product_id")
        raw_size = str(item.get("selected_size") or "N/A").strip()
        norm_size = raw_size if raw_size.upper() != "N/A" else "N/A"

        available_stock = 0
        if norm_size == "N/A":
            product = Product.objects.filter(id=pid).first()
            if not product:
                raise StockValidationError("Product not found.")
            available_stock = product.stock
        else:
            size_exists_for_product = ProductSize.objects.filter(product_id=pid).exists()
            if size_exists_for_product:
                ps = ProductSize.objects.filter(product_id=pid, size__iexact=norm_size).first()
                available_stock = ps.stock if ps else 0
            else:
                product = Product.objects.filter(id=pid).first()
                if not product:
                    raise StockValidationError("Product not found.")
                available_stock = product.stock

        if qty > available_stock:
            raise StockValidationError(f"Only {available_stock} items are available for this product/size.")


def restore_order_stock(order):
    """
    Restores stock for items in a cancelled order inside transaction.atomic().
    Guarantees stock is restored at most once.
    """
    from .models import Order

    with transaction.atomic():
        locked_order = Order.objects.select_for_update().get(pk=order.pk)
        if locked_order.is_stock_restored:
            return

        order_items = list(locked_order.orderitem_set.all())
        # Sort items by product_id and selected_size for deterministic locking
        order_items.sort(key=lambda x: (x.product_id, str(x.selected_size or "")))

        for item in order_items:
            pid = item.product_id
            raw_size = str(item.selected_size or "N/A").strip()
            norm_size = raw_size if raw_size.upper() != "N/A" else "N/A"
            qty = item.quantity

            if norm_size == "N/A":
                product = Product.objects.select_for_update().filter(id=pid).first()
                if product:
                    product.stock += qty
                    product.save(update_fields=["stock"])
            else:
                size_exists = ProductSize.objects.filter(product_id=pid).exists()
                if size_exists:
                    ps = ProductSize.objects.select_for_update().filter(product_id=pid, size__iexact=norm_size).first()
                    if ps:
                        ps.stock += qty
                        ps.save(update_fields=["stock"])
                else:
                    product = Product.objects.select_for_update().filter(id=pid).first()
                    if product:
                        product.stock += qty
                        product.save(update_fields=["stock"])

        locked_order.is_stock_restored = True
        locked_order.save(update_fields=["is_stock_restored"])
