import React from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useWishlist } from "../context/WishlistContext.jsx";
import "./Wishlist.css";

function Wishlist() {
  const navigate = useNavigate();
  const { wishlistProducts, wishlistLoading } = useWishlist();

  if (wishlistLoading) {
    return (
      <div className="container py-5 text-center">
        Loading wishlist...
      </div>
    );
  }

  return (
    <section className="products-section">
      <div className="container">
        <div className="products-header">
          <div>
            <p className="products-kicker">WISHLIST</p>
            <h2 className="products-title">Your saved items</h2>
          </div>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="empty-wishlist text-center py-5">
            <div className="mb-3 text-muted" style={{ fontSize: 18 }}>
              💗 Your wishlist is empty
            </div>
            <button
              type="button"
              className="btn btn-primary rounded-pill px-4"
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="row">
            {wishlistProducts.map((product) => (
              <div
                className="col-xl-3 col-lg-4 col-md-6 mb-4 d-flex"
                key={product.id}
              >
                <div className="w-100">
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Wishlist;

