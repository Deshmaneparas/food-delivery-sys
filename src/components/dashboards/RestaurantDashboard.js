import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import { FiX } from "react-icons/fi";

const RestaurantDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [restaurantData, setRestaurantData] = useState({ 
    name: "", 
    address: "", 
    cuisine: "", 
    image: null 
  });
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuData, setMenuData] = useState({ 
    name: "", 
    description: "", 
    price: "", 
    image: null 
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  

  // Fetch orders and restaurants on component mount
  useEffect(() => {
    fetchOrders();
    fetchRestaurants();
  }, []);

  const fetchOrders = () => {
    axios
      .get("http://localhost:5000/api/orders/restaurant-orders", { 
        headers: { Authorization: localStorage.getItem("token") } 
      })
      .then((res) => setOrders(res.data))
      .catch(() => alert("Error fetching orders"));

      
  };

  const fetchRestaurants = () => {
    axios
      .get("http://localhost:5000/api/restaurants/my-restaurants", { 
        headers: { Authorization: localStorage.getItem("token") } 
      })
      .then((res) => setRestaurants(res.data))
      .catch(() => alert("Error fetching your restaurants"));
  };

  const handleChange = (e) => {
    setRestaurantData({ ...restaurantData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setRestaurantData({ ...restaurantData, image: e.target.files[0] });
  };

  const handleMenuImageChange = (e) => {
    setMenuData({ ...menuData, image: e.target.files[0] });
  };

  const addRestaurant = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', restaurantData.name);
    formData.append('address', restaurantData.address);
    formData.append('cuisine', restaurantData.cuisine);
    if (restaurantData.image) {
      formData.append('image', restaurantData.image);
    }

    axios.post(
      "http://localhost:5000/api/restaurants/add",
      formData,
      { 
        headers: { 
          Authorization: localStorage.getItem("token"),
          'Content-Type': 'multipart/form-data'
        } 
      }
    ).then((res) => {
      alert(res.data.message);
      setRestaurants([...restaurants, res.data.restaurant]);
      setRestaurantData({ name: "", address: "", cuisine: "", image: null });
    }).catch(() => alert("Error adding restaurant"));
  };

  const viewMenu = (restaurantId) => {
    setSelectedRestaurant(restaurantId);
    axios.get(`http://localhost:5000/api/restaurants/${restaurantId}/menu`)
      .then((res) => setMenuItems(res.data))
      .catch(() => alert("Error fetching menu items"));
  };

  const handleMenuChange = (e) => {
    setMenuData({ ...menuData, [e.target.name]: e.target.value });
  };

  const addMenuItem = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', menuData.name);
    formData.append('description', menuData.description);
    formData.append('price', menuData.price);
    formData.append('restaurantId', selectedRestaurant);
    if (menuData.image) {
      formData.append('image', menuData.image);
    }

    axios.post(
      "http://localhost:5000/api/restaurants/add-menu",
      formData,
      { 
        headers: { 
          Authorization: localStorage.getItem("token"),
          'Content-Type': 'multipart/form-data'
        } 
      }
    ).then((res) => {
      alert(res.data.message);
      setMenuItems([...menuItems, res.data.menuItem]);
      setMenuData({ name: "", description: "", price: "", image: null });
    }).catch(() => alert("Error adding menu item"));
  };

  // Function to update order status
  const updateOrderStatus = (orderId, newStatus) => {
    axios.put(
      `http://localhost:5000/api/orders/update-status/${orderId}`,
      { status: newStatus },
      { headers: { Authorization: localStorage.getItem("token") } }
    ).then(() => {
      fetchOrders(); // Refresh orders after status update
    }).catch(() => alert("Error updating order status"));
  };

  useEffect(() => {
    const handleProfileModal = () => setShowProfileModal(true);
    const handleFAQModal = () => setShowFAQModal(true);
    const handleContactModal = () => setShowContactModal(true);
  
    window.addEventListener('open-profile-modal', handleProfileModal);
    window.addEventListener('open-faq-modal', handleFAQModal);
    window.addEventListener('open-contact-modal', handleContactModal);
  
    return () => {
      window.removeEventListener('open-profile-modal', handleProfileModal);
      window.removeEventListener('open-faq-modal', handleFAQModal);
      window.removeEventListener('open-contact-modal', handleContactModal);
    };
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Restaurant Admin Dashboard</h1>

        {/* Order Management Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Order Management</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500">No orders found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order._id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customer?.name || "Guest"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index}>
                              {item.menuItem?.name || "Item not available"} × {item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'Pending' ? "bg-yellow-100 text-yellow-800" :
                          order.status === 'Accepted' ? "bg-blue-100 text-blue-800" :
                          order.status === 'Out for Delivery' ? "bg-purple-100 text-purple-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {order.status === 'Pending' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'Accepted')}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Accept
                          </button>
                        )}
                        {order.status === 'Accepted' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'Out for Delivery')}
                            className="text-purple-600 hover:text-purple-900 mr-3"
                          >
                            Out for Delivery
                          </button>
                        )}
                        {order.status === 'Out for Delivery' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'Delivered')}
                            className="text-green-600 hover:text-green-900"
                          >
                            Mark as Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add New Restaurant Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add a New Restaurant</h2>
          <form onSubmit={addRestaurant} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Restaurant Name"
              value={restaurantData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={restaurantData.address}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="cuisine"
              placeholder="Cuisine Type"
              value={restaurantData.cuisine}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Image</label>
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Add Restaurant
            </button>
          </form>
        </div>

        {/* Show Restaurants */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Restaurants</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.map((r) => (
                  <div
                    key={r._id}
                    onClick={() => viewMenu(r._id)}
                    className="p-4 bg-white shadow rounded-lg cursor-pointer hover:shadow-md transition"
                  >
                    {r.image ? (
                      <img 
                        src={`http://localhost:5000/uploads/${r.image}`}
                        alt={r.name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-gray-500">No Image</span>
                      </div>
                    )}
                    <h3 className="text-xl font-semibold">{r.name}</h3>
                    <p className="text-gray-600">{r.cuisine}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm text-gray-500">{r.address}</span>
                      <span className="text-sm text-gray-500">🕒 {r.deliveryTime || '30'} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

        {showProfileModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">My Profile</h3>
                <button onClick={() => setShowProfileModal(false)} className="text-gray-500 hover:text-gray-700">
                  <FiX size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">Username:</p>
                  <p className="font-medium">{localStorage.getItem("name") || "User"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email:</p>
                  <p className="font-medium">{localStorage.getItem("email") || "No email available"}</p>
                </div>
                <div>
                  <p className="text-gray-600">Account Type:</p>
                  <p className="font-medium capitalize">{localStorage.getItem("role") || "Customer"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* FAQ Modal */}
        {showFAQModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Help & FAQs</h3>
                <button onClick={() => setShowFAQModal(false)} className="text-gray-500 hover:text-gray-700">
                  <FiX size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">How do I place an order?</h4>
                  <p className="text-gray-600">Select items from the menu and click "Add to Cart", then proceed to checkout.</p>
                </div>
                <div>
                  <h4 className="font-semibold">Can I cancel my order?</h4>
                  <p className="text-gray-600">Orders can be cancelled within 5 minutes of placement.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Contact Us</h3>
                <button onClick={() => setShowContactModal(false)} className="text-gray-500 hover:text-gray-700">
                  <FiX size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">Email: support@fooddelivery.com</p>
                <p className="text-gray-600">Phone: +1 (123) 456-7890</p>
                <p className="text-gray-600">Address: 123 Food Street, City, Country</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Menu & Show Menu Items */}
        {selectedRestaurant && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add Menu Item</h2>
            <form onSubmit={addMenuItem} className="space-y-4 mb-6">
              <input
                type="text"
                name="name"
                placeholder="Menu Item Name"
                value={menuData.name}
                onChange={handleMenuChange}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={menuData.description}
                onChange={handleMenuChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={menuData.price}
                onChange={handleMenuChange}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu Item Image</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleMenuImageChange}
                  accept="image/*"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                Add Menu Item
              </button>
            </form>

            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Menu Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <div key={item._id} className="p-4 bg-gray-50 rounded-lg">
                  {item.image && (
                    <img 
                      src={`http://localhost:5000/uploads/${item.image}`} 
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-gray-600">{item.description}</p>
                  <p className="text-gray-800 font-bold">₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;