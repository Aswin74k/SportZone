import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";

function AllProducts() {

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get("category");

  const [products, setProducts] = useState([]);

  useEffect(() => {

    let url = "http://127.0.0.1:8000/api/products/";

    if (category) {
      url += `?category=${category}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => setProducts(data));

  }, [category]);

  return (

    <div className="container py-5">

      <h2 className="fw-bold mb-4">
        {category ? category.toUpperCase() : "All Products"}
      </h2>

      <div className="row">

        {products.map(product => (

          <div className="col-lg-3 col-md-6 mb-4" key={product.id}>

            <ProductCard product={product} />

          </div>

        ))}

      </div>

    </div>

  )

}

export default AllProducts