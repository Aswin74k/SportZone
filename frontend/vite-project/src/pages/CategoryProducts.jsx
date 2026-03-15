import { useParams } from "react-router-dom"
import { useEffect,useState } from "react"
import axios from "axios"
import ProductCard from "../components/ProductCard"

function CategoryProducts(){

 const { category } = useParams()

 const [products,setProducts] = useState([])

 useEffect(()=>{

  axios.get(`http://127.0.0.1:8000/api/products/?category=${category}`)
  .then(res=>{
    setProducts(res.data)
  })

 },[category])

 return(

  <div className="container">

   <h2>{category} Products</h2>

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