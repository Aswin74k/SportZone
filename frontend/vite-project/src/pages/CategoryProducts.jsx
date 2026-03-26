import { useParams } from "react-router-dom"
import { useEffect,useState } from "react"
import axios from "axios"
import ProductCard from "../components/ProductCard"

const normalizeCategory = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const v = raw.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (v === "sports shoes") return "sports shoe";
  if (v === "sports cycles") return "sports cycle";
  return v;
};

function CategoryProducts(){

 const { category } = useParams()
 const normalizedCategory = normalizeCategory(category)

 const [products,setProducts] = useState([])

 useEffect(()=>{

  axios.get(`http://127.0.0.1:8000/api/products/?category=${encodeURIComponent(normalizedCategory)}`)
  .then(res=>{
    setProducts(res.data)
  })

 },[normalizedCategory])

 return(

  <div className="container">

   <h2>{normalizedCategory} Products</h2>

   <div className="row">

   {products.map(product=>(
     <div className="col-md-3" key={product.id}>
       <ProductCard product={product}/>
     </div>
   ))}

   </div>

  </div>

 )

}

export default CategoryProducts