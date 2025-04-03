import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import CustomerDashboard from "./components/dashboards/CustomerDashboard";
import RestaurantDashboard from "./components/dashboards/RestaurantDashboard";
import SuperAdminDashboard from "./components/dashboards/SuperAdminDashboard";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/customer-dashboard" element={<PrivateRoute role="Customer"><CustomerDashboard /></PrivateRoute>} />
        <Route path="/restaurant-dashboard" element={<PrivateRoute role="Restaurant Admin"><RestaurantDashboard /></PrivateRoute>} />
        <Route path="/super-admin-dashboard" element={<PrivateRoute role="Super Admin"><SuperAdminDashboard /></PrivateRoute>} />

        {/* Default Redirect */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
};

export default App;
