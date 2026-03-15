import "./ProductCard.css";

function ProductCard({ product }) {
  return (
    <div className="product-card">

      <img
        src={product.image}
        alt={product.name}
      />

      <div className="product-info">

        <h5>{product.name}</h5>

        <p className="price">
          ₹{product.price}
        </p>

        <button className="btn btn-warning w-100">
          Add to Cart
        </button>

      </div>

    </div>
  );
}

export default ProductCard;