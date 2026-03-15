import "./ProductCard.css";
import { useCart } from "../context/CartContext.jsx";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const isNew = product.isNew ?? true;
  const tag = product.categoryLabel || product.category;

  const handleAdd = () => {
    addToCart(product);
  };

  return (
    <div className="product-card">
      <div className="product-media">
        {isNew && <span className="badge-new">New</span>}
        {tag && <span className="badge-category">{tag}</span>}

        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-info">
        <h5 className="product-title">{product.name}</h5>

        <div className="product-meta">
          <div className="price-group">
            <span className="price">₹{product.price}</span>
            {product.mrp && (
              <span className="price-mrp">₹{product.mrp}</span>
            )}
          </div>

          {product.rating && (
            <span className="rating">
              ★ {product.rating}
              {product.reviewCount && (
                <span className="rating-count"> ({product.reviewCount})</span>
              )}
            </span>
          )}
        </div>

        <button
          className="btn btn-dark w-100 mt-3"
          onClick={handleAdd}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;