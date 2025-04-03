const express = require("express");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// Get Restaurants Owned by Logged-In Restaurant Admin
router.get("/my-restaurants", authMiddleware, async (req, res) => {
  if (req.user.role !== "Restaurant Admin") return res.status(403).json({ message: "Unauthorized" });

  try {
    const restaurants = await Restaurant.find({ admin: req.user.id });
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurants" });
  }
});

// GET all restaurants
router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurants" });
  }
});

// Add a New Menu Item to a Restaurant
router.post("/add-menu", authMiddleware, upload.single('image'), async (req, res) => {
  if (req.user.role !== "Restaurant Admin") return res.status(403).json({ message: "Unauthorized" });

  try {
    const { name, description, price, restaurantId } = req.body;
    const menuItem = await MenuItem.create({ 
      name, 
      description, 
      price, 
      restaurant: restaurantId,
      image: req.file ? req.file.filename : null
    });
    res.json({ 
      message: "Menu Item Added Successfully", 
      menuItem: {
        ...menuItem._doc,
        image: req.file ? req.file.filename : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error Adding Menu Item" });
  }
});

// Get Menu Items for a Restaurant
router.get("/:restaurantId/menu", async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ restaurant: req.params.restaurantId });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: "Error fetching menu items" });
  }
});

// Add a New Restaurant
router.post("/add", authMiddleware, upload.single('image'), async (req, res) => {
  if (req.user.role !== "Restaurant Admin") return res.status(403).json({ message: "Unauthorized" });

  try {
    const { name, address, cuisine } = req.body;
    const restaurant = await Restaurant.create({ 
      name, 
      address, 
      cuisine, 
      admin: req.user.id,
      image: req.file ? req.file.filename : null
    });
    res.json({ 
      message: "Restaurant Added Successfully", 
      restaurant: {
        ...restaurant._doc,
        image: req.file ? req.file.filename : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error Adding Restaurant" });
  }
});


module.exports = router;