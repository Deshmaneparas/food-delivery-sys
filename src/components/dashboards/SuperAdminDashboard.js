import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import { format } from 'date-fns';
import { FiX } from "react-icons/fi";

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [restaurantOrders, setRestaurantOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState({
    users: false,
    restaurants: false,
    orders: false,
    subscriptions: false,
    restaurantOrders: false
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRestaurants();
  }, []);

  const fetchUsers = async () => {
    setLoading(prev => ({...prev, users: true}));
    try {
      const response = await axios.get("http://localhost:5000/api/superadmin/users", {
        headers: { Authorization: localStorage.getItem("token") }
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(prev => ({...prev, users: false}));
    }
  };

  const fetchRestaurants = async () => {
    setLoading(prev => ({...prev, restaurants: true}));
    try {
      const response = await axios.get("http://localhost:5000/api/superadmin/restaurants", {
        headers: { Authorization: localStorage.getItem("token") }
      });
      setRestaurants(response.data);
    } catch (error) {
      console.error("Error fetching restaurants:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to load restaurants");
    } finally {
      setLoading(prev => ({...prev, restaurants: false}));
    }
  };

  const fetchUserDetails = async (userId) => {
    setLoading(prev => ({...prev, orders: true, subscriptions: true}));
    try {
      const [ordersRes, subsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/superadmin/orders/${userId}`, {
          headers: { Authorization: localStorage.getItem("token") }
        }),
        axios.get(`http://localhost:5000/api/superadmin/subscriptions/${userId}`, {
          headers: { Authorization: localStorage.getItem("token") }
        })
      ]);
      setUserOrders(ordersRes.data);
      setUserSubscriptions(subsRes.data);
    } catch (error) {
      console.error("Error fetching user details:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to load user details");
    } finally {
      setLoading(prev => ({...prev, orders: false, subscriptions: false}));
    }
  };

  const fetchRestaurantDetails = async (restaurantId) => {
    setLoading(prev => ({...prev, restaurantOrders: true}));
    try {
      const response = await axios.get(`http://localhost:5000/api/superadmin/restaurants/${restaurantId}/orders`, {
        headers: { Authorization: localStorage.getItem("token") }
      });
      setRestaurantOrders(response.data);
    } catch (error) {
      console.error("Error fetching restaurant orders:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to load restaurant orders");
    } finally {
      setLoading(prev => ({...prev, restaurantOrders: false}));
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setSelectedRestaurant(null);
    fetchUserDetails(user._id);
  };

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setSelectedUser(null);
    fetchRestaurantDetails(restaurant._id);
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

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/superadmin/users/${id}`, {
        headers: { Authorization: localStorage.getItem("token") }
      });
      setUsers(users.filter(user => user._id !== id));
      if (selectedUser?._id === id) {
        setSelectedUser(null);
        setUserOrders([]);
        setUserSubscriptions([]);
      }
      alert("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  const deleteRestaurant = async (id) => {
    if (!window.confirm("Are you sure you want to delete this restaurant?")) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/superadmin/restaurants/${id}`, {
        headers: { Authorization: localStorage.getItem("token") }
      });
      setRestaurants(restaurants.filter(restaurant => restaurant._id !== id));
      if (selectedRestaurant?._id === id) {
        setSelectedRestaurant(null);
        setRestaurantOrders([]);
      }
      alert("Restaurant deleted successfully");
    } catch (error) {
      console.error("Error deleting restaurant:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to delete restaurant");
    }
  };

  // Filter users by role
  const customers = users.filter(user => user.role === 'Customer');
  const restaurantAdmins = users.filter(user => user.role === 'Restaurant Admin');
  const superAdmins = users.filter(user => user.role === 'Super Admin');

  // Filter by search term
  const filteredCustomers = customers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredRestaurantAdmins = restaurantAdmins.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredSuperAdmins = superAdmins.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredRestaurants = restaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date properly
  const formatDate = (dateString) => {
    try {
      return dateString ? format(new Date(dateString), 'MMM dd, yyyy hh:mm a') : 'N/A';
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Quick Stats</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-600">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600">Total Restaurants</p>
                  <p className="text-2xl font-bold">{restaurants.length}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-600">Active Orders</p>
                  <p className="text-2xl font-bold">
                    {[...userOrders, ...restaurantOrders].filter(order => order.status === 'Pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Navigation</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'customers' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Customers
                </button>
                <button
                  onClick={() => setActiveTab('restaurantAdmins')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'restaurantAdmins' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Restaurant Admins
                </button>
                <button
                  onClick={() => setActiveTab('superAdmins')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'superAdmins' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Super Admins
                </button>
                <button
                  onClick={() => setActiveTab('restaurants')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'restaurants' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                >
                  Restaurants
                </button>
              </div>
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
                        {/* Add more FAQs as needed */}
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

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Users/Restaurants List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {loading.users || loading.restaurants ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  {activeTab === 'customers' && (
                    <div>
                      <div className="p-4 border-b">
                        <h2 className="text-xl font-semibold text-gray-700">Customers</h2>
                        <p className="text-sm text-gray-500">{filteredCustomers.length} customers found</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="p-3 text-left">Name</th>
                              <th className="p-3 text-left">Email</th>
                              <th className="p-3 text-left">Joined</th>
                              <th className="p-3 text-left">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCustomers.map((user) => (
                              <tr 
                                key={user._id} 
                                className={`border-t hover:bg-gray-50 ${selectedUser?._id === user._id ? 'bg-blue-50' : ''}`}
                                onClick={() => handleUserClick(user)}
                              >
                                <td className="p-3">{user.name}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3">{formatDate(user.createdAt)}</td>
                                <td className="p-3">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteUser(user._id);
                                    }} 
                                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'restaurantAdmins' && (
                    <div>
                      <div className="p-4 border-b">
                        <h2 className="text-xl font-semibold text-gray-700">Restaurant Admins</h2>
                        <p className="text-sm text-gray-500">{filteredRestaurantAdmins.length} admins found</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="p-3 text-left">Name</th>
                              <th className="p-3 text-left">Email</th>
                              <th className="p-3 text-left">Joined</th>
                              <th className="p-3 text-left">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRestaurantAdmins.map((user) => (
                              <tr 
                                key={user._id} 
                                className={`border-t hover:bg-gray-50 ${selectedUser?._id === user._id ? 'bg-blue-50' : ''}`}
                                onClick={() => handleUserClick(user)}
                              >
                                <td className="p-3">{user.name}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3">{formatDate(user.createdAt)}</td>
                                <td className="p-3">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteUser(user._id);
                                    }} 
                                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'superAdmins' && (
                    <div>
                      <div className="p-4 border-b">
                        <h2 className="text-xl font-semibold text-gray-700">Super Admins</h2>
                        <p className="text-sm text-gray-500">{filteredSuperAdmins.length} super admins found</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="p-3 text-left">Name</th>
                              <th className="p-3 text-left">Email</th>
                              <th className="p-3 text-left">Joined</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSuperAdmins.map((user) => (
                              <tr 
                                key={user._id} 
                                className="border-t hover:bg-gray-50"
                              >
                                <td className="p-3">{user.name}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3">{formatDate(user.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'restaurants' && (
                    <div>
                      <div className="p-4 border-b">
                        <h2 className="text-xl font-semibold text-gray-700">Restaurants</h2>
                        <p className="text-sm text-gray-500">{filteredRestaurants.length} restaurants found</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="p-3 text-left">Name</th>
                              <th className="p-3 text-left">Cuisine</th>
                              <th className="p-3 text-left">Created</th>
                              <th className="p-3 text-left">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredRestaurants.map((restaurant) => (
                              <tr 
                                key={restaurant._id} 
                                className={`border-t hover:bg-gray-50 ${selectedRestaurant?._id === restaurant._id ? 'bg-blue-50' : ''}`}
                                onClick={() => handleRestaurantClick(restaurant)}
                              >
                                <td className="p-3">{restaurant.name}</td>
                                <td className="p-3 capitalize">{restaurant.cuisine}</td>
                                <td className="p-3">{formatDate(restaurant.createdAt)}</td>
                                <td className="p-3">
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteRestaurant(restaurant._id);
                                    }} 
                                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Details Panel */}
            {(selectedUser || selectedRestaurant) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                {selectedUser && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">{selectedUser.name}'s Profile</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{selectedUser.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Role</p>
                          <p className="font-medium capitalize">{selectedUser.role}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Account Created</p>
                          <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Updated</p>
                          <p className="font-medium">{formatDate(selectedUser.updatedAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Order History</h2>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {userOrders.length} orders
                        </span>
                      </div>
                      {loading.orders ? (
                        <div className="flex justify-center items-center h-40">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : userOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="p-2 text-left">Order ID</th>
                                <th className="p-2 text-left">Restaurant</th>
                                <th className="p-2 text-left">Items</th>
                                <th className="p-2 text-left">Total</th>
                                <th className="p-2 text-left">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userOrders.map((order) => (
                                <tr key={order._id} className="border-t">
                                  <td className="p-2">{order._id.substring(0, 8)}...</td>
                                  <td className="p-2">{order.restaurant?.name || 'N/A'}</td>
                                  <td className="p-2">
                                    {order.items.map(item => item.menuItem?.name).filter(Boolean).join(', ')}
                                  </td>
                                  <td className="p-2">
                                    ₹{order.items.reduce((total, item) => total + (item.menuItem?.price || 0) * item.quantity, 0).toFixed(2)}
                                  </td>
                                  <td className="p-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {order.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No orders found for this user
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Subscriptions</h2>
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          {userSubscriptions.length} subscriptions
                        </span>
                      </div>
                      {loading.subscriptions ? (
                        <div className="flex justify-center items-center h-40">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : userSubscriptions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="p-2 text-left">Item</th>
                                <th className="p-2 text-left">Type</th>
                                <th className="p-2 text-left">Period</th>
                                <th className="p-2 text-left">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userSubscriptions.map((sub) => {
                                const isActive = new Date(sub.endDate) > new Date();
                                return (
                                  <tr key={sub._id} className="border-t">
                                    <td className="p-2">{sub.menuItem?.name || 'N/A'}</td>
                                    <td className="p-2 capitalize">{sub.subscriptionType}</td>
                                    <td className="p-2">
                                      {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                                    </td>
                                    <td className="p-2">
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {isActive ? 'Active' : 'Expired'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No subscriptions found for this user
                        </div>
                      )}
                    </div>
                  </>
                )}

                {selectedRestaurant && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">{selectedRestaurant.name}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Cuisine</p>
                          <p className="font-medium capitalize">{selectedRestaurant.cuisine}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium">{selectedRestaurant.address || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Created</p>
                          <p className="font-medium">{formatDate(selectedRestaurant.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Updated</p>
                          <p className="font-medium">{formatDate(selectedRestaurant.updatedAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Recent Orders</h2>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {restaurantOrders.length} orders
                        </span>
                      </div>
                      {loading.restaurantOrders ? (
                        <div className="flex justify-center items-center h-40">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : restaurantOrders.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="p-2 text-left">Order ID</th>
                                <th className="p-2 text-left">Customer</th>
                                <th className="p-2 text-left">Items</th>
                                <th className="p-2 text-left">Total</th>
                                <th className="p-2 text-left">Status</th>
                                <th className="p-2 text-left">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {restaurantOrders.map((order) => (
                                <tr key={order._id} className="border-t">
                                  <td className="p-2">{order._id.substring(0, 8)}...</td>
                                  <td className="p-2">{order.customer?.name || 'N/A'}</td>
                                  <td className="p-2">
                                    {order.items.map(item => item.menuItem?.name).filter(Boolean).join(', ')}
                                  </td>
                                  <td className="p-2">
                                    ₹{order.items.reduce((total, item) => total + (item.menuItem?.price || 0) * item.quantity, 0).toFixed(2)}
                                  </td>
                                  <td className="p-2">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="p-2">{formatDate(order.timestamp)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No orders found for this restaurant
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;