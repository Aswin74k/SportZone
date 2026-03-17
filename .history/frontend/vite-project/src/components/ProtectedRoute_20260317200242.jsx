import ProtectedRoute from "./components/ProtectedRoute";
import Cart from "./pages/Cart";

// 👇 inside Routes

<Route
  path="/cart"
  element={
    <ProtectedRoute>
      <Cart />
    </ProtectedRoute>
  }
/>