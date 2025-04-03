const express = require("express");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const Subscription = require("../models/Subscription");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Middleware to check Super Admin role
const superAdminCheck = (req, res, next) => {
  if (req.user.role !== "Super Admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }
  next();
};

// Apply to all routes
router.use(authMiddleware);
router.use(superAdminCheck);

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
});

// Get user orders
router.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.params.userId })  // Changed from 'user' to 'customer'
      .populate('restaurant', 'name cuisine')
      .populate('items.menuItem', 'name price');
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});

// Get user subscriptions
router.get('/subscriptions/:userId', async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ customer: req.params.userId })
      .populate('menuItem', 'name price');
    res.json(subscriptions);
  } catch (err) {
    console.error("Error fetching subscriptions:", err);
    res.status(500).json({ message: "Error fetching subscriptions", error: err.message });
  }
});

// Get all restaurants
router.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    console.error("Error fetching restaurants:", err);
    res.status(500).json({ message: "Error fetching restaurants", error: err.message });
  }
});

// Get restaurant orders
router.get('/restaurants/:id/orders', async (req, res) => {
  try {
    const orders = await Order.find({ restaurant: req.params.id })
      .populate('customer', 'name email')  // Changed from 'user' to 'customer'
      .populate('items.menuItem', 'name price');
    res.json(orders);
  } catch (err) {
    console.error("Error fetching restaurant orders:", err);
    res.status(500).json({ message: "Error fetching restaurant orders", error: err.message });
  }
});

// Delete restaurant
router.delete('/restaurants/:id', async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: "Restaurant deleted successfully" });
  } catch (err) {
    console.error("Error deleting restaurant:", err);
    res.status(500).json({ message: "Error deleting restaurant", error: err.message });
  }
});

module.exports = router;