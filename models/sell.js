const mongoose = require("mongoose");

const sellSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  amount: { type: Number, required: true },
  singlePrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  sellingDate: { type: Date, default: Date.now },
});

const Buy = mongoose.model("Sell", sellSchema);

module.exports = Buy;

