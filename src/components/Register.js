import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "Customer", adminCode: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      alert("Registration Successful! Redirecting to Login...");
      navigate("/login");
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white bg-opacity-20 backdrop-blur-md shadow-lg p-8 rounded-xl w-96 text-center">
        <h2 className="text-3xl font-bold text-black mb-6">Register</h2>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input type="text" name="name" placeholder="Name" onChange={handleChange} required 
            className="p-3 rounded-md bg-white bg-opacity-50 focus:bg-opacity-100 transition text-black outline-none"
          />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required 
            className="p-3 rounded-md bg-white bg-opacity-50 focus:bg-opacity-100 transition text-black outline-none"
          />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required 
            className="p-3 rounded-md bg-white bg-opacity-50 focus:bg-opacity-100 transition text-black outline-none"
          />
          
          <select name="role" onChange={handleChange} 
            className="p-3 rounded-md bg-white bg-opacity-50 focus:bg-opacity-100 transition text-black outline-none">
            <option>Customer</option>
            <option>Restaurant Admin</option>
            <option>Super Admin</option>
          </select>

          {["Restaurant Admin", "Super Admin"].includes(formData.role) && (
            <input type="text" name="adminCode" placeholder="Admin Code" onChange={handleChange} 
              className="p-3 rounded-md bg-white bg-opacity-50 focus:bg-opacity-100 transition text-black outline-none"
            />
          )}

          <button type="submit" className="bg-green-600 text-white p-3 rounded-md hover:bg-green-800 transition">
            Register
          </button>
        </form>
        
        <p className="text-black mt-4">
          Already registered?{" "}
          <a href="/login" className="text-blue-500 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
