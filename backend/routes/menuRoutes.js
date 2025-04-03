const express = require("express");
const MenuItem = require("../models/MenuItem");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ Add a menu item for a restaurant (Only for Restaurant Admin)
router.post("/add", authMiddleware, async (req, res) => {
  if (req.user.role !== "Restaurant Admin") return res.status(403).json({ message: "Unauthorized" });

  try {
    const { name, description, price, restaurant } = req.body;
    const menuItem = await MenuItem.create({ name, description, price, restaurant });
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: "Error adding menu item" });
  }
});

// ✅ Get menu items for a specific restaurant
router.get("/:restaurantId", async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ restaurant: req.params.restaurantId });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu items" });
  }
});


module.exports = router;
