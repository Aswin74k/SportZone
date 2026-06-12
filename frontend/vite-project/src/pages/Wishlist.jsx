import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ui/ProductCardSkeleton";
import { useWishlist } from "../context/WishlistContext.jsx";
import StoreShell from "../components/StoreShell";
import "./Wishlist.css";

function Wishlist() {
  const navigate = useNavigate();
  const { wishlistProducts, wishlistLoading } = useWishlist();

  return (
    <StoreShell>
      <div className="container-fluid container-xl sz-wishlist-page">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <p className="sz-kicker mb-1">Saved for later</p>
          <h1 className="h3 fw-bold mb-0">Your wishlist</h1>
        </motion.div>

        {wishlistLoading ? (
          <div className="row g-4">
            {[1, 2, 3, 4].map((i) => (
              <div className="col-xl-3 col-lg-4 col-md-6" key={i}>
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : wishlistProducts.length === 0 ? (
          <motion.div className="sz-wishlist-empty text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="sz-wishlist-empty-icon mb-3">♥</div>
            <h3 className="fw-bold">Nothing saved yet</h3>
            <p className="text-muted mb-4">Tap the heart on any product to build your collection.</p>
            <button type="button" className="btn sz-btn-sport px-4" onClick={() => navigate("/shop")}>
              Explore shop
            </button>
          </motion.div>
        ) : (
          <div className="row g-4">
            {wishlistProducts.map((product, index) => (
              <div className="col-xl-3 col-lg-4 col-md-6 d-flex" key={product.id}>
                <div className="w-100">
                  <ProductCard product={product} index={index} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StoreShell>
  );
}

export default Wishlist;
