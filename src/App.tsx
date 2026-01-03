import { Routes, Route } from "react-router";
import Login from "./pages/login";
import Register from "./pages/register";
import ProtectedRoute from "./guards/ProtectedRoute";
import PublicRoute from "./guards/PublicRoute";
import Home from "./pages/home";
import TripDetails from "./components/TripDetails";

export function App() {
  return (
    <Routes>
      {/* PROTECTED */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      {/* PUBLIC */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route path="/trips/:tripId" element={<TripDetails />} />
    </Routes>
  );
}

export default App;
