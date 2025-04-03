import React from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
      <h1 className="text-6xl font-bold mb-4 animate-pulse">Welcome to Food Delivery</h1>
      <p className="text-xl mb-6">Order your favorite meals anytime, anywhere!</p>
      
      <button
        onClick={() => navigate("/login")}
        className="px-6 py-3 text-lg font-semibold bg-white text-indigo-600 rounded-lg shadow-md hover:bg-gray-200 transition duration-300"
      >
        Get Started
      </button>
    </div>
  );
};

export default Home;
