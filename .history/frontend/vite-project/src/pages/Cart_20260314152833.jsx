import "./Cart.css";

function Cart(){

  const cartItems = [
    {
      id:1,
      name:"Adidas Football",
      price:1200,
      quantity:1,
      image:"https://images.unsplash.com/photo-1522778119026-d647f0596c20"
    },
    {
      id:2,
      name:"Cricket Bat",
      price:2500,
      quantity:1,
      image:"https://images.unsplash.com/photo-1593341646782-e0b495cff86d"
    }
  ];

  return(

    <div className="cart-page container">

      <h2 className="cart-title">Shopping Cart</h2>

      {cartItems.map(item => (

        <div className="cart-item row" key={item.id}>

          <div className="col-md-2">
            <img src={item.image} alt={item.name}/>
          </div>

          <div className="col-md-4">
            <h5>{item.name}</h5>
          </div>

          <div className="col-md-2">
            ₹{item.price}
          </div>

          <div className="col-md-2">
            Qty: {item.quantity}
          </div>

          <div className="col-md-2">
            <button className="btn btn-danger">
              Remove
            </button>
          </div>

        </div>

      ))}

      <div className="cart-total">

        <h4>Total: ₹3700</h4>

        <button className="btn btn-warning">
          Proceed to Checkout
        </button>

      </div>

    </div>

  )

}

export default Cart