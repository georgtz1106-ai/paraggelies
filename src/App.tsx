import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { ComingSoon } from "./components/ComingSoon";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";

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
              <Route path="/suppliers" element={<ComingSoon title="Προμηθευτές" />} />
              <Route path="/products" element={<ComingSoon title="Προϊόντα" />} />
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
