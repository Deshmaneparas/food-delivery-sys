const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  subscriptionType: { type: String, enum: ["Monthly", "Weekly"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);
