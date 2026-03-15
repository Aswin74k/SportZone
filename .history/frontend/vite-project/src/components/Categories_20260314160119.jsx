import { useNavigate } from "react-router-dom"

function Categories(){

 const navigate = useNavigate()

 const goCategory = (category)=>{
   navigate(`/category/${category}`)
 }

 return(

  <button
   className="btn btn-warning"
   onClick={()=>goCategory("football")}
  >
   Explore
  </button>

 )

}
