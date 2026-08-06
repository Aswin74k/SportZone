export function calcItemMrp(product) {
  const price = Number(product?.price || 0);
  if (product?.original_price) return Number(product.original_price);
  return Math.round(price * 1.25);
}

export function calculatePricing({ items, subtotal, discount }) {
  let mrpTotal = 0;
  items.forEach((item) => {
    mrpTotal += calcItemMrp(item.product) * item.quantity;
  });
  const productSavings = Math.max(0, mrpTotal - subtotal);
  const deliverySavings = 99;
  return {
    mrpTotal,
    productSavings,
    deliverySavings,
    totalSavings: productSavings + deliverySavings + discount,
  };
}
