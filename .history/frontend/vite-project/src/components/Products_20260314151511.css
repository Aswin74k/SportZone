import "./Products.css";
import ProductCard from "./ProductCard";

function Products(){

  const products = [
    {
      id:1,
      name:"Adidas Football",
      price:1200,
      image:"https://images.unsplash.com/photo-1522778119026-d647f0596c20"
    },
    {
      id:2,
      name:"Cricket Bat",
      price:2500,
      image:"https://images.unsplash.com/photo-1593341646782-e0b495cff86d"
    },
    {
      id:3,
      name:"Basketball",
      price:1500,
      image:"https://images.unsplash.com/photo-1519861531473-9200262188bf"
    },
    {
      id:4,
      name:"Badminton Racket",
      price:1800,
      image:"https://images.unsplash.com/photo-1626224583764-f87db24ac4ea"
    }
  ];

  return(
    <section className="products-section">

      <div className="container">

        <h2 className="products-title">
          Featured Products
        </h2>

        <div className="row">

          {products.map((product)=>(
            
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