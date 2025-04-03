import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import { format } from 'date-fns';

const CustomerDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [subscriptionType, setSubscriptionType] = useState("");
  const [subscriptionDates, setSubscriptionDates] = useState({ 
    startDate: format(new Date(), 'yyyy-MM-dd'), 
    endDate: "" 
  });
  const [loading, setLoading] = useState({
    restaurants: false,
    menu: false,
    orders: false,
    subscriptions: false
  });

  // Fetch all restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(prev => ({...prev, restaurants: true}));
      try {
        const res = await axios.get("http://localhost:5000/api/restaurants");
        setRestaurants(res.data);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        alert("Error fetching restaurants");
      } finally {
        setLoading(prev => ({...prev, restaurants: false}));
      }
    };
    fetchRestaurants();
  }, []);

  // Fetch the menu when a restaurant is selected
  const viewMenu = async (restaurantId) => {
    setLoading(prev => ({...prev, menu: true}));
    try {
      const res = await axios.get(`http://localhost:5000/api/restaurants/${restaurantId}/menu`);
      setSelectedRestaurant(restaurantId);
      setMenu(res.data);
    } catch (error) {
      console.error("Error fetching menu:", error);
      alert("Error fetching menu");
    } finally {
      setLoading(prev => ({...prev, menu: false}));
    }
  };

  // Cart operations
  const addToCart = (menuItem) => {
    const existingItem = cart.find(item => item._id === menuItem._id);
    if (existingItem) {
      setCart(cart.map(item => 
        item._id === menuItem._id 
          ? {...item, quantity: item.quantity + 1} 
          : item
      ));
    } else {
      setCart([...cart, {...menuItem, quantity: 1}]);
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item => 
      item._id === id ? {...item, quantity: newQuantity} : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  // Subscription modal handlers
  const openSubscriptionModal = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setShowSubscriptionModal(true);
  };

  const closeSubscriptionModal = () => {
    setShowSubscriptionModal(false);
    setSubscriptionType("");
    setSubscriptionDates({ 
      startDate: format(new Date(), 'yyyy-MM-dd'), 
      endDate: "" 
    });
  };

  const calculateEndDate = (startDate, type) => {
    const date = new Date(startDate);
    if (type === "Weekly") {
      date.setDate(date.getDate() + 7);
    } else if (type === "Monthly") {
      date.setMonth(date.getMonth() + 1);
    }
    return format(date, 'yyyy-MM-dd');
  };

  const handleSubscriptionType = (type) => {
    setSubscriptionType(type);
    setSubscriptionDates(prev => ({
      ...prev,
      endDate: calculateEndDate(prev.startDate, type)
    }));
  };

  // Place a subscription order
  const placeSubscription = async () => {
    if (!subscriptionType || !subscriptionDates.startDate || !subscriptionDates.endDate) {
      alert("Please fill all subscription details");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/subscriptions/subscribe", 
        {
          menuItem: selectedMenuItem._id,
          subscriptionType,
          startDate: subscriptionDates.startDate,
          endDate: subscriptionDates.endDate
        },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      alert("Subscription added successfully!");
      setSubscriptions([res.data.subscription, ...subscriptions]);
      closeSubscriptionModal();
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Failed to add subscription");
    }
  };

  // Place an order
  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const formattedCart = cart.map(item => ({
      menuItem: item._id,
      quantity: item.quantity
    }));

    try {
      const res = await axios.post(
        "http://localhost:5000/api/orders/place",
        { restaurant: selectedRestaurant, items: formattedCart },
        { headers: { Authorization: localStorage.getItem("token") } }
      );
      alert("Order placed successfully!");
      setCart([]);
      setOrders([res.data.order, ...orders]);
    } catch (error) {
      console.error("Order error:", error);
      alert("Failed to place order");
    }
  };

  // Fetch past orders & subscriptions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(prev => ({...prev, orders: true, subscriptions: true}));
      try {
        const [ordersRes, subsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/orders/my-orders", { 
            headers: { Authorization: localStorage.getItem("token") } 
          }),
          axios.get("http://localhost:5000/api/subscriptions/my-subscriptions", { 
            headers: { Authorization: localStorage.getItem("token") } 
          })
        ]);
        setOrders(ordersRes.data);
        setSubscriptions(subsRes.data);
      } catch (error) {
        console.error("Data fetch error:", error);
        alert("Error fetching your data");
      } finally {
        setLoading(prev => ({...prev, orders: false, subscriptions: false}));
      }
    };
    fetchData();
  }, []);

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Customer Dashboard</h1>

        {/* Restaurants List */}
        {!selectedRestaurant ? (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Browse Restaurants</h2>
            {loading.restaurants ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.map((restaurant) => (
                  <div 
                    key={restaurant._id} 
                    className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => viewMenu(restaurant._id)}
                  >
                    <h3 className="text-xl font-semibold text-gray-800">{restaurant.name}</h3>
                    <p className="text-gray-600">{restaurant.cuisine}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {restaurant.address}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <button 
              onClick={() => setSelectedRestaurant(null)} 
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Restaurants
            </button>

            {/* Menu Items */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Menu</h2>
              {loading.menu ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menu.map((item) => (
                    <div key={item._id} className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                          ₹{item.price}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{item.description}</p>
                      <div className="flex mt-3 space-x-2">
                        <button
                          onClick={() => addToCart(item)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => openSubscriptionModal(item)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm font-medium transition"
                        >
                          Subscribe
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Subscription Modal */}
        {showSubscriptionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Subscribe to {selectedMenuItem?.name}
                  </h3>
                  <button 
                    onClick={closeSubscriptionModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subscription Type
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSubscriptionType("Weekly")}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          subscriptionType === "Weekly"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Weekly
                      </button>
                      <button
                        onClick={() => handleSubscriptionType("Monthly")}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          subscriptionType === "Monthly"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>

                  {subscriptionType && (
                    <>
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          value={subscriptionDates.startDate}
                          min={format(new Date(), 'yyyy-MM-dd')}
                          onChange={(e) => {
                            const newStartDate = e.target.value;
                            setSubscriptionDates({
                              startDate: newStartDate,
                              endDate: calculateEndDate(newStartDate, subscriptionType)
                            });
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          value={subscriptionDates.endDate}
                          min={subscriptionDates.startDate}
                          readOnly
                          className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={closeSubscriptionModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={placeSubscription}
                      disabled={!subscriptionType}
                      className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                        subscriptionType 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "bg-blue-300 cursor-not-allowed"
                      }`}
                    >
                      Confirm Subscription
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shopping Cart */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Cart</h2>
          {cart.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <div key={item._id} className="p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-medium w-20 text-right">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="p-4">
                <button
                  onClick={placeOrder}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition"
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Subscriptions Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Subscriptions</h2>
          {loading.subscriptions ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <p className="text-gray-500">You don't have any subscriptions yet</p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.map((sub) => {
                      const today = new Date();
                      const endDate = new Date(sub.endDate);
                      const isActive = today <= endDate;
                      
                      return (
                        <tr key={sub._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{sub.menuItem?.name || "Item not available"}</div>
                                <div className="text-sm text-gray-500">₹{sub.menuItem?.price || "0"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 capitalize">{sub.subscriptionType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {format(new Date(sub.startDate), 'MMM dd, yyyy')} - {format(new Date(sub.endDate), 'MMM dd, yyyy')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              isActive 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {isActive ? "Active" : "Expired"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Orders Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Orders</h2>
          {loading.orders ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <p className="text-gray-500">You haven't placed any orders yet</p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => {
                      const orderTotal = order.items.reduce(
                        (total, item) => total + (item.menuItem?.price || 0) * item.quantity, 0
                      );
                      
                      return (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.restaurant?.name || "Restaurant not available"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 space-y-1">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                  <span>
                                    {item.menuItem?.name || "Item not available"} × {item.quantity}
                                  </span>
                                  <span className="text-gray-600 ml-4">
                                    ₹{(item.menuItem?.price || 0) * item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            ₹{orderTotal.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(order.timestamp), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status.toLowerCase().includes('cancel') 
                                ? "bg-red-100 text-red-800" :
                              order.status.toLowerCase().includes('deliver') 
                                ? "bg-green-100 text-green-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CustomerDashboard;





// now i want a code for superadmin dashboard in that i want to show list of users and list of all restaurants are added and when i click on user i want to see all his details and their all order history and other info and also same for restaurants when i click on it i want to see all details of restaurant admin and all order history and other details 





import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar";

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [restaurantOrders, setRestaurantOrders] = useState([]);
  const [loading, setLoading] = useState({
    users: false,
    restaurants: false,
    orders: false,
    subscriptions: false,
    restaurantOrders: false
  });

  useEffect(() => {
    fetchUsers();
    fetchRestaurants();
  }, []);

  const fetchUsers = async () => {
    setLoading(prev => ({...prev, users: true}));
    try {
      const response = await axios.get("/api/superadmin/users", {
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
      const response = await axios.get("/api/superadmin/restaurants", {
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
        axios.get(`/api/superadmin/orders/${userId}`, {
          headers: { Authorization: localStorage.getItem("token") }
        }),
        axios.get(`/api/superadmin/subscriptions/${userId}`, {
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
      const response = await axios.get(`/api/superadmin/restaurants/${restaurantId}/orders`, {
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

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await axios.delete(`/api/superadmin/users/${id}`, {
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
      await axios.delete(`/api/superadmin/restaurants/${id}`, {
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

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Super Admin Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Users</h2>
            {loading.users ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Role</th>
                      <th className="p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr 
                        key={user._id} 
                        className={`cursor-pointer hover:bg-gray-50 ${selectedUser?._id === user._id ? 'bg-blue-50' : ''}`}
                        onClick={() => handleUserClick(user)}
                      >
                        <td className="p-3">{user.name}</td>
                        <td className="p-3">{user.role}</td>
                        <td className="p-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteUser(user._id);
                            }} 
                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm"
                            disabled={loading.users}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h2 className="text-2xl font-semibold text-gray-700 mt-8 mb-4">Restaurants</h2>
            {loading.restaurants ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Cuisine</th>
                      <th className="p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.map((restaurant) => (
                      <tr 
                        key={restaurant._id} 
                        className={`cursor-pointer hover:bg-gray-50 ${selectedRestaurant?._id === restaurant._id ? 'bg-blue-50' : ''}`}
                        onClick={() => handleRestaurantClick(restaurant)}
                      >
                        <td className="p-3">{restaurant.name}</td>
                        <td className="p-3">{restaurant.cuisine}</td>
                        <td className="p-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRestaurant(restaurant._id);
                            }} 
                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-700 transition text-sm"
                            disabled={loading.restaurants}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Details */}
            {selectedUser && (
              <>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-2">{selectedUser.name}'s Details</h2>
                  <p>Email: {selectedUser.email}</p>
                  <p>Role: {selectedUser.role}</p>
                  <p>Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Order History</h2>
                  {loading.orders ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : userOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="p-2 text-left">Order ID</th>
                            <th className="p-2 text-left">Restaurant</th>
                            <th className="p-2 text-left">Total</th>
                            <th className="p-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userOrders.map((order) => (
                            <tr key={order._id} className="border-b">
                              <td className="p-2">{order._id.substring(0, 8)}...</td>
                              <td className="p-2">{order.restaurant?.name || 'N/A'}</td>
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
                    <p>No orders found</p>
                  )}
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Subscriptions</h2>
                  {loading.subscriptions ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : userSubscriptions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-200">
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
                              <tr key={sub._id} className="border-b">
                                <td className="p-2">{sub.menuItem?.name || 'N/A'}</td>
                                <td className="p-2 capitalize">{sub.subscriptionType}</td>
                                <td className="p-2">
                                  {new Date(sub.startDate).toLocaleDateString()} - {new Date(sub.endDate).toLocaleDateString()}
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
                    <p>No subscriptions found</p>
                  )}
                </div>
              </>
            )}

            {/* Restaurant Details */}
            {selectedRestaurant && (
              <>
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-2">{selectedRestaurant.name}'s Details</h2>
                  <p>Cuisine: {selectedRestaurant.cuisine}</p>
                  <p>Address: {selectedRestaurant.address}</p>
                  <p>Created: {new Date(selectedRestaurant.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                  {loading.restaurantOrders ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : restaurantOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="p-2 text-left">Order ID</th>
                            <th className="p-2 text-left">Customer</th>
                            <th className="p-2 text-left">Total</th>
                            <th className="p-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {restaurantOrders.map((order) => (
                            <tr key={order._id} className="border-b">
                              <td className="p-2">{order._id.substring(0, 8)}...</td>
                              <td className="p-2">{order.user?.name || 'N/A'}</td>
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
                    <p>No orders found</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;





-----------------------------------------------------------------------



import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import { format } from 'date-fns';

const CustomerDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [subscriptionType, setSubscriptionType] = useState("");
  const [subscriptionDates, setSubscriptionDates] = useState({ 
    startDate: format(new Date(), 'yyyy-MM-dd'), 
    endDate: format(new Date(), 'yyyy-MM-dd') 
  });
  const [loading, setLoading] = useState({
    restaurants: false,
    menu: false,
    orders: false,
    subscriptions: false
  });

  // ✅ Fetch all restaurants
  useEffect(() => {
    axios.get("http://localhost:5000/api/restaurants")
      .then((res) => setRestaurants(res.data))
      .catch(() => alert("Error fetching restaurants"));
  }, []);

  // ✅ Fetch the menu when a restaurant is selected
  const viewMenu = (restaurantId) => {
    axios.get(`http://localhost:5000/api/restaurants/${restaurantId}/menu`)
      .then((res) => {
        setSelectedRestaurant(restaurantId);
        setMenu(res.data);
      })
      .catch(() => alert("Error fetching menu"));
  };

// Cart operations
const addToCart = (menuItem) => {
  const existingItem = cart.find(item => item._id === menuItem._id);
  if (existingItem) {
    setCart(cart.map(item => 
      item._id === menuItem._id 
        ? {...item, quantity: item.quantity + 1} 
        : item
    ));
  } else {
    setCart([...cart, {...menuItem, quantity: 1}]);
  }
};

const updateQuantity = (id, newQuantity) => {
  if (newQuantity < 1) return;
  setCart(cart.map(item => 
    item._id === id ? {...item, quantity: newQuantity} : item
  ));
};

const removeFromCart = (id) => {
  setCart(cart.filter(item => item._id !== id));
};

 // Subscription modal handlers
  const openSubscriptionModal = (menuItem) => {
    setSelectedMenuItem(menuItem);
    setShowSubscriptionModal(true);
  };

  const closeSubscriptionModal = () => {
    setShowSubscriptionModal(false);
    setSubscriptionType("");
    setSubscriptionDates({ 
      startDate: format(new Date(), 'yyyy-MM-dd'), 
      endDate: "" 
    });
  };

  const calculateEndDate = (startDate, type) => {
    const date = new Date(startDate);
    if (type === "Weekly") {
      date.setDate(date.getDate() + 7);
    } else if (type === "Monthly") {
      date.setMonth(date.getMonth() + 1);
    }
    return format(date, 'yyyy-MM-dd');
  };

  const handleSubscriptionType = (type) => {
    setSubscriptionType(type);
    setSubscriptionDates(prev => ({
      ...prev,
      endDate: calculateEndDate(prev.startDate, type)
    }));
  };

  const placeSubscription = () => {
    if (!subscriptionDates.startDate || !subscriptionDates.endDate) {
      alert("Please select a start and end date.");
      return;
    }
  
    axios.post("http://localhost:5000/api/subscriptions/subscribe", 
      {
        menuItem: selectedMenuItem._id,
        subscriptionType,
        startDate: subscriptionDates.startDate,
        endDate: subscriptionDates.endDate
      },
      { headers: { Authorization: localStorage.getItem("token") } }
    ).then((res) => {
      alert("Subscription added!");
      
      // Create a new subscription object with the menuItem data
      const newSubscription = {
        ...res.data.subscription,
        menuItem: selectedMenuItem
      };
      
      setSubscriptions([newSubscription, ...subscriptions]);
      setShowSubscriptionModal(false);
    }).catch(() => alert("Subscription failed"));
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
  
    const formattedCart = cart.map(item => ({
      menuItem: item._id,
      quantity: item.quantity
    }));
  
    axios.post(
      "http://localhost:5000/api/orders/place",
      { restaurant: selectedRestaurant, items: formattedCart },
      { headers: { Authorization: localStorage.getItem("token") } }
    ).then((res) => {
      alert("Order placed successfully!");
      setCart([]);
      
      // Get the restaurant name from the current context
      const restaurant = restaurants.find(r => r._id === selectedRestaurant);
      
      // Create a new order object with all needed data
      const newOrder = {
        ...res.data.order,
        restaurant: restaurant ? { name: restaurant.name } : null,
        items: res.data.order.items.map(item => ({
          ...item,
          menuItem: cart.find(cartItem => cartItem._id === item.menuItem)
        }))
      };
      
      setOrders([newOrder, ...orders]);
    }).catch(() => alert("Order failed"));
  };

  // Fetch past orders & subscriptions
useEffect(() => {
  const fetchData = async () => {
    setLoading(prev => ({...prev, orders: true, subscriptions: true}));
    try {
      const [ordersRes, subsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/orders/my-orders", { 
          headers: { Authorization: localStorage.getItem("token") } 
        }),
        axios.get("http://localhost:5000/api/subscriptions/my-subscriptions", { 
          headers: { Authorization: localStorage.getItem("token") } 
        })
      ]);
      setOrders(ordersRes.data);
      setSubscriptions(subsRes.data);
    } catch (error) {
      console.error("Data fetch error:", error);
      alert("Error fetching your data");
    } finally {
      setLoading(prev => ({...prev, orders: false, subscriptions: false}));
    }
  };
  fetchData();
}, []);

// Add this right after the above useEffect - for polling order updates
useEffect(() => {
  const interval = setInterval(() => {
    axios.get("http://localhost:5000/api/orders/my-orders", { 
      headers: { Authorization: localStorage.getItem("token") } 
    })
    .then((res) => setOrders(res.data))
    .catch(() => console.log("Error polling orders"));
  }, 30000); // Check every 30 seconds

  return () => clearInterval(interval);
}, []);

// Calculate cart total
const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Customer Dashboard</h1>

        {!selectedRestaurant ? (
          <>
            <h2 className="text-2xl font-semibold text-gray-700">Browse Restaurants</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurants.map((r) => (
                <div key={r._id} className="p-4 bg-white shadow rounded-lg cursor-pointer hover:shadow-md" onClick={() => viewMenu(r._id)}>
                  <h3 className="text-xl font-semibold">{r.name}</h3>
                  <p className="text-gray-600">{r.cuisine}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setSelectedRestaurant(null)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition mb-4">
              Back to Restaurants
            </button>

            <h2 className="text-2xl font-semibold text-gray-700">Menu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menu.map((m) => (
                <div key={m._id} className="p-4 bg-white shadow rounded-lg">
                  <h3 className="text-lg font-semibold">{m.name} - ₹{m.price}</h3>
                  <p className="text-gray-600">{m.description}</p>
                  <button onClick={() => addToCart(m)} className="bg-blue-500 text-white px-4 py-2 mt-2 rounded-md hover:bg-blue-700 transition">
                    Add to Cart
                  </button>
                  <button onClick={() => openSubscriptionModal(m)} className="bg-purple-500 text-white px-4 py-2 mt-2 ml-2 rounded-md hover:bg-purple-700 transition">
                    Subscription
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Subscription Modal */}
                {showSubscriptionModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-semibold text-gray-800">
                            Subscribe to {selectedMenuItem?.name}
                          </h3>
                          <button 
                            onClick={closeSubscriptionModal}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Subscription Type
                            </label>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleSubscriptionType("Weekly")}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${
                                  subscriptionType === "Weekly"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                Weekly
                              </button>
                              <button
                                onClick={() => handleSubscriptionType("Monthly")}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${
                                  subscriptionType === "Monthly"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                              >
                                Monthly
                              </button>
                            </div>
                          </div>
        
                          {subscriptionType && (
                            <>
                              <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  id="startDate"
                                  value={subscriptionDates.startDate}
                                  min={format(new Date(), 'yyyy-MM-dd')}
                                  onChange={(e) => {
                                    const newStartDate = e.target.value;
                                    setSubscriptionDates({
                                      startDate: newStartDate,
                                      endDate: calculateEndDate(newStartDate, subscriptionType)
                                    });
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
        
                              <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                  End Date
                                </label>
                                <input
                                  type="date"
                                  id="endDate"
                                  value={subscriptionDates.endDate}
                                  min={subscriptionDates.startDate}
                                  readOnly
                                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                                />
                              </div>
                            </>
                          )}
        
                          <div className="flex justify-end space-x-3 pt-4">
                            <button
                              onClick={closeSubscriptionModal}
                              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={placeSubscription}
                              disabled={!subscriptionType}
                              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                                subscriptionType 
                                  ? "bg-blue-600 hover:bg-blue-700" 
                                  : "bg-blue-300 cursor-not-allowed"
                              }`}
                            >
                              Confirm Subscription
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
        {/* 🛒 Cart */}
        {/* Shopping Cart */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Cart</h2>
          {cart.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <div key={item._id} className="p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-medium w-20 text-right">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="p-4">
                <button
                  onClick={placeOrder}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition"
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </section>


    {/* Subscriptions Section */}
    <section className="mb-8">
                  <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Subscriptions</h2>
                  {loading.subscriptions ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : subscriptions.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                      <p className="text-gray-500">You don't have any subscriptions yet</p>
                    </div>
                  ) : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {subscriptions.map((sub) => {
                              const today = new Date();
                              const endDate = new Date(sub.endDate);
                              const isActive = today <= endDate;
                              
                              return (
                                <tr key={sub._id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{sub.menuItem?.name || "Item not available"}</div>
                                        <div className="text-sm text-gray-500">₹{sub.menuItem?.price || "0"}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 capitalize">{sub.subscriptionType}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                      {format(new Date(sub.startDate), 'MMM dd, yyyy')} - {format(new Date(sub.endDate), 'MMM dd, yyyy')}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      isActive 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-gray-100 text-gray-800"
                                    }`}>
                                      {isActive ? "Active" : "Expired"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </section>

 {/* Orders Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Orders</h2>
          {loading.orders ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <p className="text-gray-500">You haven't placed any orders yet</p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => {
                      const orderTotal = order.items.reduce(
                        (total, item) => total + (item.menuItem?.price || 0) * item.quantity, 0
                      );
                      
                      return (
                        <tr key={order._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.restaurant?.name || "Restaurant not available"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 space-y-1">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                  <span>
                                    {item.menuItem?.name || "Item not available"} × {item.quantity}
                                  </span>
                                  <span className="text-gray-600 ml-4">
                                    ₹{(item.menuItem?.price || 0) * item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            ₹{orderTotal.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(order.timestamp), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status.toLowerCase().includes('cancel') 
                                ? "bg-red-100 text-red-800" :
                              order.status.toLowerCase().includes('deliver') 
                                ? "bg-green-100 text-green-800" :
                              "bg-yellow-100 text-yellow-800"
                            }`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CustomerDashboard;
