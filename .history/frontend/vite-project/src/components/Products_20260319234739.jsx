import { useEffect, useState } from "react";
import "./Products.css";
import ProductCard from "./ProductCard";
import API from "../api"

function Products() {

  const [products, setProducts] = useState([]);


useEffect(() => {
  API.get("products/")
    .then(res => setProducts(res.data));
}, []);

  return(
    <section className="products-section">

      <div className="container">

        <h2 className="products-title">
          Featured Products
        </h2>

        <div className="row">

          {products.slice(0,4).map((product)=>(
            
            <div className="col-lg-3 col-md-6 mb-4" key={product.id}>

              <ProductCard product={product}/>

            </div>

          ))}

        </div>

      </div>

    </section>
  )
}

export default Products;