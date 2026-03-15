import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import "../components/Products.css";

const API_URL = "http://127.0.0.1:8000/products/";

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(API_URL);

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message || "Failed to load products.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <section className="products-section">
      <div className="container">
        <div className="products-header">
          <div>
            <p className="products-kicker">ALL PRODUCTS</p>
            <h2 className="products-title">Browse The Full Collection</h2>
          </div>
        </div>

        {loading && (
          <p>Loading products...</p>
        )}

        {error && !loading && (
          <p className="text-danger">Error: {error}</p>
        )}

        {!loading && !error && (
          <div className="row">
            {products.map((product) => (
              <div
                className="col-xl-3 col-lg-4 col-md-6 mb-4 d-flex"
                key={product.id}
              >
                <ProductCard product={product} />
              </div>
            ))}

            {products.length === 0 && (
              <p>No products available.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default AllProducts;

