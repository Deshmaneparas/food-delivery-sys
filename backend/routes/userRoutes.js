const express = require("express");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order"); // Changed from 'orders' to 'Order'
const Subscription = require("../models/Subscription"); // Changed from 'subscriptions' to 'Subscription'
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all users
router.get("/", authMiddleware, async (req, res) => { // Changed from "/users" to "/"
  if (req.user.role !== "Super Admin") return res.status(403).json({ message: "Unauthorized" });

  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Delete a user
router.delete("/:id", authMiddleware, async (req, res) => { // Changed from "/users/:id" to "/:id"
  if (req.user.role !== "Super Admin") return res.status(403).json({ message: "Unauthorized" });

  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

// Delete a restaurant
router.delete("/restaurants/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== "Super Admin") return res.status(403).json({ message: "Unauthorized" });

  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: "Restaurant deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting restaurant" });
  }
});

// Get orders by user ID
router.get('/orders/:userId', authMiddleware, async (req, res) => { // Changed route to avoid conflict
  if (req.user.role !== "Super Admin") return res.status(403).json({ message: "Unauthorized" });

  try {
    const userOrders = await Order.find({ user: req.params.userId })
      .populate('restaurant')
      .populate('items.menuItem');
    res.json(userOrders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user orders' });
  }
});

// Get subscriptions by user ID
router.get('/subscriptions/:userId', authMiddleware, async (req, res) => { // Changed route to avoid conflict
  if (req.user.role !== "Super Admin") return res.status(403).json({ message: "Unauthorized" });

  try {
    const userSubscriptions = await Subscription.find({ user: req.params.userId })
      .populate('menuItem');
    res.json(userSubscriptions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user subscriptions' });
  }
});

module.exports = router;