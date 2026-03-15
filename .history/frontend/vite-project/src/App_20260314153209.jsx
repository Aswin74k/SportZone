import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Cart from "./pages/Cart"

function App() {
  return (
    <>
      <Navbar/>

      {/* temporary routing */}
      <Home/>
      <Cart/>

    </>
  )
}

export default App