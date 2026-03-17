import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import "./CartIcon.css";
import { useCart } from "../context/CartContext.jsx";

function CartIcon() {

  const { cartItemCount } = useCart();

  return (
    <Link to="/cart" className="cart-icon-wrapper">
      <FiShoppingCart size={20} />

      {cartItemCount > 0 && (
        <span className="cart-count-badge">
          {cartItemCount}
        </span>
      )}

    </Link>
  );
}

export default CartIcon;