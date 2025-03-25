const mongoose = require("mongoose");

const buySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  amount: { type: Number, required: true },
  singlePrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  buyingDate: { type: Date, default: Date.now },
});

const Buy = mongoose.model("Buy", buySchema);

module.exports = Buy;

