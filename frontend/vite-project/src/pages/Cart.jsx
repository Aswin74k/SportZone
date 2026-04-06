import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import "./Cart.css";

function Cart() {
  const {
    cartItems,
    fetchCart,
    removeFromCart,
    updateQuantity,
    cartTotal,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const checkout = async () => {
    setLoading(true);
    try {
      await API.post("orders/checkout/");
      toast.success("Order placed successfully 🎉");
      fetchCart();
      setTimeout(() => {
        navigate("/orders"); // Or a success page if you create one
      }, 1000);
    } catch {
      toast.error("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="fk-cart-empty bg-white d-flex flex-column align-items-center justify-content-center py-5 shadow-sm mt-4 mx-auto rounded" style={{ maxWidth: '800px', minHeight: '400px' }}>
        <img
          src="https://rukminim2.flixcart.com/www/800/800/promos/16/05/2019/d438a32e-765a-4d8b-b4a6-520b560971e8.png?q=90"
          alt="Empty Cart"
          height="160"
          className="mb-4"
        />
        <h4 className="fw-medium mb-2 text-dark">Missing Cart items?</h4>
        <p className="text-muted mb-4 small">Login to see the items you added previously</p>
        <Link to="/shop" className="btn btn-primary fw-bold px-5 py-2 rounded-1 shadow-sm" style={{ backgroundColor: '#fb641b', borderColor: '#fb641b' }}>
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="fk-cart-container w-100 min-vh-100 pb-5" style={{ backgroundColor: '#f1f3f6' }}>
      <div className="container-fluid container-xl pt-4">

        <div className="row g-4 justify-content-center">

          {/* LEFT: CART ITEMS */}
          <div className="col-lg-8">
            <div className="bg-white shadow-sm rounded-1 mb-3">

              <div className="p-3 border-bottom d-flex align-items-center">
                <h5 className="mb-0 fw-medium text-dark">Cart ({cartItems.length})</h5>
              </div>

              {cartItems.map((item, index) => {
                const rawImage = item.product?.image;
                const imageUrl = rawImage
                  ? rawImage.startsWith("http")
                    ? rawImage
                    : `http://127.0.0.1:8000${rawImage}`
                  : "/no-image.png";

                const isLast = index === cartItems.length - 1;

                return (
                  <div key={item.id} className={`fk-cart-item px-3 py-4 ${!isLast ? 'border-bottom' : ''}`}>
                    <div className="row">

                      {/* Image & Qty */}
                      <div className="col-4 col-sm-3 col-md-2 d-flex flex-column align-items-center gap-3">
                        <Link to={`/product/${item.product?.id}`} className="d-block w-100 text-center">
                          <img
                            src={imageUrl}
                            alt={item.product?.name}
                            className="img-fluid object-fit-contain"
                            style={{ height: "100px" }}
                            onError={(e) => { e.target.src = "/no-image.png"; }}
                          />
                        </Link>

                        <div className="d-flex align-items-center border rounded">
                          <button
                            className="btn btn-sm text-dark px-2 bg-light border-end rounded-0 rounded-start"
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              } else {
                                removeFromCart(item.id);
                              }
                            }}
                          >−</button>
                          <input
                            type="text"
                            className="form-control form-control-sm border-0 text-center px-1"
                            value={item.quantity}
                            readOnly
                            style={{ width: '35px' }}
                          />
                          <button
                            className="btn btn-sm text-dark px-2 bg-light border-start rounded-0 rounded-end"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >+</button>
                        </div>
                      </div>

                      {/* Info & Pricing */}
                      <div className="col-8 col-sm-9 col-md-10 position-relative ps-md-4">
                        <Link to={`/product/${item.product?.id}`} className="text-dark text-decoration-none">
                          <h6 className="fw-medium mb-1 text-truncate fk-cart-title hover-blue">{item.product?.name}</h6>
                        </Link>

                        <div className="text-muted small mb-3">
                          <span className="me-3">Category: {item.product?.category}</span>
                          {(item.size || item.product?.size) && (
                            <span>Size: <span className="fw-medium text-dark">{item.size || item.product.size}</span></span>
                          )}
                        </div>

                        <div className="d-flex align-items-end gap-2 mb-3">
                          <span className="text-muted text-decoration-line-through small">
                            ₹{Number((item.product?.price || 0) * 1.4).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          </span>
                          <span className="fw-bold fs-5 text-dark lh-1">
                            ₹{Number(item.product?.price || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-success fw-bold small lh-1">28% Off</span>

                          {/* Offers tag */}
                          <div className="ms-2 d-none d-md-block text-success small fw-medium">
                            2 offers applied
                          </div>
                        </div>

                        <div className="d-flex gap-4 mt-auto fw-bold text-uppercase" style={{ fontSize: '0.9rem' }}>
                          <button
                            className="btn btn-link text-dark text-decoration-none p-0 fw-bold hover-blue"
                            onClick={() => removeFromCart(item.id)}
                          >
                            Remove
                          </button>
                        </div>

                        <div className="position-absolute top-0 end-0 text-end small d-none d-md-block pe-3">
                          <div>Delivery by <span className="fw-bold">Tomorrow</span></div>
                          <span className="text-muted">₹40</span> <span className="text-success fw-bold">Free</span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}

              <div className="p-3 border-top d-flex justify-content-end bg-white rounded-bottom px-4 pb-4">
                <button
                  className="btn text-white fw-bold px-5 py-3 shadow-sm fk-place-order-btn"
                  onClick={checkout}
                  disabled={loading}
                >
                  {loading ? "PROCESSING..." : "PLACE ORDER"}
                </button>
              </div>

            </div>
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="col-lg-4">
            <div className="bg-white shadow-sm rounded-1 sticky-top fk-summary-card" style={{ top: '80px' }}>

              <div className="p-3 border-bottom border-light">
                <h6 className="text-muted text-uppercase fw-bold m-0" style={{ fontSize: '0.9rem' }}>Price Details</h6>
              </div>

              <div className="p-3 px-4">
                <div className="d-flex justify-content-between mb-3 text-dark">
                  <span>Price ({cartItems.length} items)</span>
                  <span>₹{Number(cartTotal || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                </div>

                <div className="d-flex justify-content-between mb-3 text-dark">
                  <span>Discount</span>
                  <span className="text-success">− ₹0</span>
                </div>

                <div className="d-flex justify-content-between mb-3 text-dark">
                  <span>Delivery Charges</span>
                  <span className="text-success">Free</span>
                </div>

                <div className="d-flex justify-content-between fw-bold fs-5 pt-3 border-top border-dashed text-dark">
                  <span>Total Amount</span>
                  <span>₹{Number(cartTotal || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                </div>

                <div className="text-success fw-bold mt-4 mb-1 small text-center" style={{ fontSize: '0.85rem' }}>
                  You will save ₹0 on this order
                </div>
              </div>

              <div className="bg-light p-3 d-flex align-items-center gap-2 border-top rounded-bottom justify-content-center text-muted small">
                <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/shield_b33c0c.svg" alt="Safe" height="28" />
                <span className="fw-medium">Safe and Secure Payments. Easy returns. 100% Authentic products.</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Cart;