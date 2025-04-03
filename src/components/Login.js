import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      console.log(res)
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("email", res.data.email);

      // Redirect based on role
      if (res.data.role === "Customer") navigate("/customer-dashboard");
      else if (res.data.role === "Restaurant Admin") navigate("/restaurant-dashboard");
      else if (res.data.role === "Super Admin") navigate("/super-admin-dashboard");
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white bg-opacity-20 backdrop-blur-md shadow-lg p-8 rounded-xl w-96 text-center">
        <h2 className="text-3xl font-bold text-black mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required 
            className="p-3 rounded-md bg-white bg-opacity-50 focus:bg-opacity-100 transition text-black outline-none"
          />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required 
            className="p-3 rounded-md bg-white bg-opacity-50 focus:bg-opacity-100 transition text-black outline-none"
          />
          <button type="submit" className="bg-indigo-600 text-white p-3 rounded-md hover:bg-indigo-800 transition">
            Login
          </button>
        </form>
        <p className="text-black mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-500 hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
