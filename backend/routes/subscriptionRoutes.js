const express = require("express");
const Subscription = require("../models/Subscription");
const MenuItem = require("../models/MenuItem");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Place a Subscription Order
router.post("/subscribe", authMiddleware, async (req, res) => {
  try {
    const { menuItem, subscriptionType, startDate, endDate } = req.body;

    if (!menuItem || !subscriptionType || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Verify if the menu item exists
    const menuItemData = await MenuItem.findById(menuItem);
    if (!menuItemData) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Create a new subscription
    const newSubscription = new Subscription({
      customer: req.user.id,
      menuItem,
      subscriptionType,
      startDate,
      endDate
    });

    await newSubscription.save();
    res.status(201).json({ message: "Subscription added successfully", subscription: newSubscription });
  } catch (error) {
    console.error("Error adding subscription:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get Subscriptions for the Logged-in Customer
router.get("/my-subscriptions", authMiddleware, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ customer: req.user.id })
      .populate("menuItem", "name price description"); // Fetch menu item details

    if (!subscriptions.length) {
      return res.status(404).json({ message: "No subscriptions found" });
    }

    res.json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
