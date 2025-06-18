import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from "./pages/LandingPage";
import UserDashboard from "./pages/Dashboard";
import { SocketProvider } from "./context/SocketContext";

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          {/* Add more routes here, e.g., dashboard, game, etc. */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
