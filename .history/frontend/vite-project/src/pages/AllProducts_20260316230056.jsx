import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import "../components/Products.css";

const API_URL = "http://127.0.0.1:8000/api/products/";

function AllProducts() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    async function fetchProducts() {

      try {

        const res = await fetch(API_URL);

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        setProducts(data);

      } catch (err) {

        setError(err.message);

      } finally {

        setLoading(false);

      }

    }

    fetchProducts();

  }, []);

  return (
    <section className="products-section">
      <div className="container">

        <h2 className="products-title">Browse The Full Collection</h2>

        {loading && <p>Loading products...</p>}
        {error && <p className="text-danger">Error: {error}</p>}

        <div className="row">
          {products.map(product => (
            <div className="col-md-3" key={product.id}>
              <ProductCard product={product}/>
            </div>
          ))}
        </div>

      </div>
    </section>
  );

}

export default AllProducts;