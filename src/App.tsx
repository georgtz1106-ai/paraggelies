import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { ComingSoon } from "./components/ComingSoon";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Suppliers } from "./pages/Suppliers";
import { Products } from "./pages/Products";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/suppliers" replace />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders/new" element={<ComingSoon title="Νέα Παραγγελία" />} />
              <Route path="/orders" element={<ComingSoon title="Ιστορικό Παραγγελιών" />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
