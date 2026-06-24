import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import { unwrapList } from "../utils/unwrapList";
import { mediaUrl } from "../utils/mediaUrl";
import "./BestSellersSection.css";

export default function BestSellersSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch only best sellers
        const bestSellerRes = await API.get("products/", {
          params: { is_best_seller: "true" }
        });
        
        if (!isMounted) return;
        
        const bestSellers = unwrapList(bestSellerRes.data);
        
        if (bestSellers.length > 0) {
          setProducts(bestSellers);
          setIsFallback(false);
          setLoading(false);
        } else {
          // Fallback: fetch all featured products
          const allRes = await API.get("products/");
          if (!isMounted) return;
          const allProducts = unwrapList(allRes.data);
          
          setProducts(allProducts.slice(0, 8)); // Top 8 products fallback
          setIsFallback(true);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching best sellers:", err);
        if (!isMounted) return;
        
        // Error fallback
        try {
          const allRes = await API.get("products/");
          if (!isMounted) return;
          const allProducts = unwrapList(allRes.data);
          setProducts(allProducts.slice(0, 8));
          setIsFallback(true);
        } catch (subErr) {
          console.error("Error fetching fallback products:", subErr);
          if (isMounted) setProducts([]);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="sz-best-sellers">
      <div className="sz-best-sellers__container">
        
        {/* HEADER ROW */}
        <div className="sz-best-sellers__header-row">
          <h2 className="sz-best-sellers__title">
            Best Sellers <span className="sz-best-sellers__subtitle">| Most Loved By Athletes</span>
          </h2>
          <Link to="/shop?best_seller=true" className="sz-best-sellers__view-all">
            See more
          </Link>
        </div>

        {/* FALLBACK BADGE */}
        {isFallback && !loading && (
          <div className="text-start">
            <span className="sz-best-sellers__fallback-notice">
              ⚠️ Showing featured products from catalog
            </span>
          </div>
        )}

        {/* CAROUSEL SLIDER CONTAINER */}
        {loading ? (
          <div className="sz-best-sellers__grid">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div className="sz-best-sellers__item" key={idx}>
                <div className="sz-skeleton" style={{ width: "100%", aspectRatio: "1/1" }} />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-4 border rounded bg-light">
            <p className="text-muted mb-0">No Products Available</p>
          </div>
        ) : (
          <div className="sz-best-sellers__grid">
            {products.map((product) => {
              const imageSrc = mediaUrl(product.image) || "/no-image.png";
              const price = Number(product.price || 0);
              const mrp = product.original_price ? Number(product.original_price) : Math.round(price * 1.2);
              const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
              return (
                <div 
                  className="sz-best-sellers__item" 
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && navigate(`/product/${product.id}`)}
                >
                  <div className="sz-flat-card">
                    {discount > 0 && (
                      <div className="sz-flat-card__discount-badge">
                        {discount}% OFF
                      </div>
                    )}
                    <img 
                      src={imageSrc} 
                      alt={product.name || "Product"} 
                      className="sz-flat-card__img"
                      onError={(e) => {
                        e.target.src = "/no-image.png";
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
