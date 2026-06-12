import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { FaShieldAlt, FaTruck } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { mediaUrl } from "../utils/mediaUrl";
import StoreShell from "../components/StoreShell";
import "./Cart.css";

function Cart() {
  const { cartItems, fetchCart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (!cartItems || cartItems.length === 0) {
    return (
      <StoreShell>
        <motion.div className="sz-cart-empty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="sz-cart-empty-icon" aria-hidden="true">
            🛒
          </div>
          <h3 className="fw-bold mb-2">Your cart is empty</h3>
          <p className="text-muted mb-4">Discover premium sports gear built for performance.</p>
          <Link to="/shop" className="btn sz-cart-checkout-btn">
            Start shopping
          </Link>
        </motion.div>
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <div className="sz-cart-page">
        <div className="container-fluid container-xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="sz-kicker mb-1">Your bag</p>
            <h1 className="h3 fw-bold mb-4">Cart ({cartItems.length})</h1>
          </motion.div>

          <div className="row g-4">
            <div className="col-lg-8">
              <div className="sz-cart-card">
                {cartItems.map((item, index) => {
                  const imageUrl = mediaUrl(item.product?.image) || "/no-image.png";
                  const isLast = index === cartItems.length - 1;
                  const price = Number(item.product?.price || 0);

                  return (
                    <motion.div
                      key={item.id}
                      className={`sz-cart-item ${!isLast ? "border-bottom" : ""}`}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="row align-items-center g-3">
                        <div className="col-4 col-sm-3 col-md-2 text-center">
                          <Link to={`/product/${item.product?.id}`}>
                            <img
                              src={imageUrl}
                              alt={item.product?.name}
                              className="img-fluid rounded-3 bg-light p-2"
                              style={{ maxHeight: 100, objectFit: "contain" }}
                              onError={(e) => {
                                e.target.src = "/no-image.png";
                              }}
                            />
                          </Link>
                        </div>
                        <div className="col-8 col-sm-9 col-md-6">
                          <Link to={`/product/${item.product?.id}`} className="sz-cart-item-title text-truncate">
                            {item.product?.name}
                          </Link>
                          <p className="small text-muted mb-2">
                            {item.product?.category}
                            {(item.size || item.product?.size) && ` · Size ${item.size || item.product.size}`}
                          </p>
                          <div className="sz-qty-control">
                            <button
                              type="button"
                              onClick={() => {
                                if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
                                else removeFromCart(item.id);
                              }}
                            >
                              −
                            </button>
                            <input type="text" value={item.quantity} readOnly aria-label="Quantity" />
                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                              +
                            </button>
                          </div>
                        </div>
                        <div className="col-12 col-md-4 text-md-end">
                          <div className="fw-bold fs-5" style={{ color: "var(--sz-navy)" }}>
                            ₹{(price * item.quantity).toLocaleString("en-IN")}
                          </div>
                          <button type="button" className="btn btn-link btn-sm text-danger p-0 mt-1" onClick={() => removeFromCart(item.id)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="col-lg-4">
              <div className="sz-cart-card sz-cart-summary p-4">
                <h2 className="h6 fw-bold mb-3">Order summary</h2>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-semibold">₹{Number(cartTotal).toLocaleString("en-IN")}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Delivery</span>
                  <span className="fw-semibold">FREE</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fs-5 fw-bold mb-4">
                  <span>Total</span>
                  <span style={{ color: "var(--sz-navy)" }}>₹{Number(cartTotal).toLocaleString("en-IN")}</span>
                </div>
                <button type="button" className="btn sz-cart-checkout-btn w-100 mb-3" disabled>
                  Checkout unavailable
                </button>
                <p className="small text-muted mb-2 d-flex align-items-center gap-2">
                  <FaTruck className="text-primary" /> Free delivery on this order
                </p>
                <p className="small text-muted mb-0 d-flex align-items-center gap-2">
                  <FaShieldAlt className="text-primary" /> Secure SportZone checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StoreShell>
  );
}

export default Cart;
