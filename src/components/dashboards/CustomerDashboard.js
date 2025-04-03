import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import { format } from 'date-fns';
import { FiSearch, FiCoffee, FiDroplet, FiPieChart, FiDollarSign, FiMeh, FiHeart } from "react-icons/fi";
import { FiX } from "react-icons/fi";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // Predefined food categories
  const foodCategories = [
    { name: "Snacks", icon: <FiCoffee className="text-2xl" /> },
    { name: "Drinks", icon: <FiDroplet className="text-2xl" /> },
    { name: "Desserts", icon: <FiPieChart className="text-2xl" /> },
    { name: "Meals", icon: <FiMeh className="text-2xl" /> },
    { name: "Vegan", icon: <FiHeart className="text-2xl" /> },
    { name: "Pocket Friendly", icon: <FiDollarSign className="text-2xl" /> }
  ];

  // Fetch all restaurants
  useEffect(() => {
    setLoading(prev => ({...prev, restaurants: true}));
    axios.get("http://localhost:5000/api/restaurants")
      .then((res) => {
        setRestaurants(res.data);
        setLoading(prev => ({...prev, restaurants: false}));
      })
      .catch(() => {
        alert("Error fetching restaurants");
        setLoading(prev => ({...prev, restaurants: false}));
      });
  }, []);

// Filter restaurants based on search term and filters
const filteredRestaurants = restaurants.filter(restaurant => {
  const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase());
  
  // Apply category filter to cuisine type
  const matchesCategory = categoryFilter === "" || 
                         restaurant.cuisine.toLowerCase().includes(categoryFilter.toLowerCase());
  
  return matchesSearch && matchesCategory;
});

// Filter menu items based on search term and filters
const filteredMenu = menu.filter(item => {
  const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       item.description.toLowerCase().includes(searchTerm.toLowerCase());
  
  const matchesPrice = priceFilter === "" || 
                      (priceFilter === "under100" && item.price < 100) ||
                      (priceFilter === "100to300" && item.price >= 100 && item.price <= 300) ||
                      (priceFilter === "over300" && item.price > 300);
  
  // Apply category filter to item description or category field
  const matchesCategory = categoryFilter === "" || 
                         item.description.toLowerCase().includes(categoryFilter.toLowerCase()) ||
                         (item.category && item.category.toLowerCase().includes(categoryFilter.toLowerCase()));
  
  return matchesSearch && matchesPrice && matchesCategory;
});

  // Fetch the menu when a restaurant is selected
  const viewMenu = (restaurantId) => {
    setLoading(prev => ({...prev, menu: true}));
    axios.get(`http://localhost:5000/api/restaurants/${restaurantId}/menu`)
      .then((res) => {
        setSelectedRestaurant(restaurantId);
        setMenu(res.data);
        setLoading(prev => ({...prev, menu: false}));
      })
      .catch(() => {
        alert("Error fetching menu");
        setLoading(prev => ({...prev, menu: false}));
      });
  };

  // Cart operations (same as before)
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

  // Subscription modal handlers (same as before)
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
      const restaurant = restaurants.find(r => r._id === selectedRestaurant);
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

  // Polling for order updates
  useEffect(() => {
    const interval = setInterval(() => {
      axios.get("http://localhost:5000/api/orders/my-orders", { 
        headers: { Authorization: localStorage.getItem("token") } 
      })
      .then((res) => setOrders(res.data))
      .catch(() => console.log("Error polling orders"));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Welcome screen
  if (showWelcome) {
    return (
      <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome to Food Delivery!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover delicious food from your favorite restaurants. Order now and get it delivered to your doorstep.
          </p>
          <button
            onClick={() => setShowWelcome(false)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full text-lg transition"
          >
            Explore Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Customer Dashboard</h1>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for restaurants or dishes..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filters */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Categories</h2>
            <div className="flex flex-wrap gap-3">
              {foodCategories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => setCategoryFilter(categoryFilter === category.name ? "" : category.name)}
                  className={`flex flex-col items-center justify-center p-4 rounded-lg shadow-sm w-24 h-24 transition ${
                    categoryFilter === category.name 
                      ? "bg-yellow-500 text-white" 
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="mb-2">{category.icon}</div>
                  <span className="text-sm">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Price Range</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPriceFilter(priceFilter === "under100" ? "" : "under100")}
                className={`px-4 py-2 rounded-md shadow-sm text-sm ${
                  priceFilter === "under100" 
                    ? "bg-yellow-500 text-white" 
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                Under ₹100
              </button>
              <button
                onClick={() => setPriceFilter(priceFilter === "100to300" ? "" : "100to300")}
                className={`px-4 py-2 rounded-md shadow-sm text-sm ${
                  priceFilter === "100to300" 
                    ? "bg-yellow-500 text-white" 
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                ₹100 - ₹300
              </button>
              <button
                onClick={() => setPriceFilter(priceFilter === "over300" ? "" : "over300")}
                className={`px-4 py-2 rounded-md shadow-sm text-sm ${
                  priceFilter === "over300" 
                    ? "bg-yellow-500 text-white" 
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                Over ₹300
              </button>
              {priceFilter && (
                <button
                  onClick={() => setPriceFilter("")}
                  className="px-4 py-2 rounded-md shadow-sm text-sm bg-gray-100 hover:bg-gray-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {!selectedRestaurant ? (
          <>
             {/* Your Restaurants Section */}
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
          </>

        ) : (
          <>
            <button onClick={() => setSelectedRestaurant(null)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition mb-4">
              Back to Restaurants
            </button>

            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Menu</h2>
              {loading.menu ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredMenu.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <p className="text-gray-500">No menu items found matching your search</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMenu.map((m) => (
                    <div key={m._id} className="p-4 bg-white shadow rounded-lg hover:shadow-md transition">
                      {/* Image at the top */}
                      {m.image ? (
                        <img 
                          src={`http://localhost:5000/uploads/${m.image}`} 
                          alt={m.name}
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
        
        {/* Menu details */}
        <div className="flex flex-col">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{m.name}</h3>
              <p className="text-gray-600 text-sm">{m.description}</p>
            </div>
            <p className="text-yellow-600 font-medium">₹{m.price}</p>
          </div>
          
          {/* Action buttons */}
          <div className="mt-3 flex space-x-2">
            <button 
              onClick={() => addToCart(m)} 
              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition text-sm flex-1"
            >
              Add to Cart
            </button>
            {m.isSubscribable && (
              <button 
                onClick={() => openSubscriptionModal(m)} 
                className="bg-purple-500 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition text-sm flex-1"
              >
                Subscribe
              </button>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
)}
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
            <section id="subscriptions-section" className="mb-8">
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
         <section id="orders-section" className="mb-8">
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