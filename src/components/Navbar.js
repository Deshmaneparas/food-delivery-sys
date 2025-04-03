import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUser,
  FiSettings,
  FiBell,
  FiMenu,
  FiLogOut,
  FiShoppingBag,
  FiClock,
  FiHelpCircle,
  FiMail,
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiList
} from "react-icons/fi";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getSidebarItems = () => {
    const commonItems = [
      { 
        icon: <FiUser size={20} />, 
        text: "My Profile", 
        action: () => {
          setSidebarOpen(false);
          window.dispatchEvent(new Event('open-profile-modal'));
        } 
      },
      { 
        icon: <FiHelpCircle size={20} />, 
        text: "Help & FAQs", 
        action: () => {
          setSidebarOpen(false);
          window.dispatchEvent(new Event('open-faq-modal'));
        } 
      },
      { 
        icon: <FiMail size={20} />, 
        text: "Contact Us", 
        action: () => {
          setSidebarOpen(false);
          window.dispatchEvent(new Event('open-contact-modal'));
        } 
      },
    ];
  
    if (role === "Customer") {
      return [
        { 
          icon: <FiShoppingBag size={20} />, 
          text: "My Orders", 
          action: () => {
            const ordersSection = document.getElementById('orders-section');
            if (ordersSection) ordersSection.scrollIntoView({ behavior: 'smooth' });
            setSidebarOpen(false);
          } 
        },
        { 
          icon: <FiList size={20} />, 
          text: "My Subscriptions", 
          action: () => {
            const subsSection = document.getElementById('subscriptions-section');
            if (subsSection) subsSection.scrollIntoView({ behavior: 'smooth' });
            setSidebarOpen(false);
          } 
        },
        ...commonItems,
        { icon: <FiLogOut size={20} />, text: "Logout", action: handleLogout },
      ];
    } else if (role === "Restaurant Admin") {
      return [
        { icon: <FiShoppingCart size={20} />, text: "Orders", path: "/restaurant/orders" },
        { icon: <FiPackage size={20} />, text: "Menu Management", path: "/restaurant/menu" },
        ...commonItems,
        { icon: <FiLogOut size={20} />, text: "Logout", action: handleLogout },
      ];
    } else if (role === "Super Admin") {
      return [
        { icon: <FiUsers size={20} />, text: "User Management", path: "/admin/users" },
        { icon: <FiShoppingBag size={20} />, text: "Restaurant Management", path: "/admin/restaurants" },
        ...commonItems,
        { icon: <FiLogOut size={20} />, text: "Logout", action: handleLogout },
      ];
    }
  
    // Default return for no role or unknown role
    return [
      ...commonItems,
      { icon: <FiLogOut size={20} />, text: "Logout", action: handleLogout },
    ];
  };

  const sidebarItems = getSidebarItems();

  return (
    <>
      {/* Navigation Bar */}
      <nav className="bg-gray-900 text-white py-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="text-white hover:text-yellow-400 transition p-1 rounded-md"
            >
              <FiMenu size={24} />
            </button>
            <Link to="/" className="text-2xl font-bold text-yellow-400">
              Food Delivery
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {role === "Customer" && (
              <>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:text-yellow-400 transition"
                >
                  <FiBell size={20} />
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    3
                  </span>
                </button>

                {showNotifications && (
                  <div className="absolute right-4 mt-40 w-64 bg-white text-gray-800 rounded-md shadow-xl z-50">
                    <div className="p-3 border-b">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <div className="p-3 hover:bg-gray-100 cursor-pointer">
                        Your order #1234 has been delivered
                      </div>
                      <div className="p-3 hover:bg-gray-100 cursor-pointer">
                        New subscription available
                      </div>
                      <div className="p-3 hover:bg-gray-100 cursor-pointer">
                        Special discount on your next order
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 hover:text-yellow-400 transition"
            >
              <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 font-semibold">
                {username.charAt(0).toUpperCase()}
              </div>
              <span>{username}</span>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-4 mt-40 w-48 bg-white text-gray-800 rounded-md shadow-xl z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <div className="flex items-center space-x-2">
                    <FiUser size={16} />
                    <span>Profile</span>
                  </div>
                </Link>
                <Link
                  to="/settings"
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <div className="flex items-center space-x-2">
                    <FiSettings size={16} />
                    <span>Settings</span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <FiLogOut size={16} />
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Menu</h2>
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-yellow-400 transition"
          >
            <FiMenu size={24} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6 p-2 bg-gray-700 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center text-gray-900 font-semibold">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{username}</p>
              <p className="text-sm text-gray-400 capitalize">{role}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item, index) => (
              <React.Fragment key={index}>
                {item.path ? (
                  <Link
                    to={item.path}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition"
                    onClick={toggleSidebar}
                  >
                    {item.icon}
                    <span>{item.text}</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      item.action();
                      toggleSidebar();
                    }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition text-left"
                  >
                    {item.icon}
                    <span>{item.text}</span>
                  </button>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Navbar;