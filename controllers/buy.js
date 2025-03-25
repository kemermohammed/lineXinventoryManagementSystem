const Buy = require("../models/buy");
const Product = require("../models/product");
const Inventory = require("../models/inventory");

exports.buyProduct = async (req, res) => {
  try {
    const { productId, amount, singlePrice } = req.body;

    if (!productId || amount <= 0 || singlePrice <= 0) {
      return res.status(400).json({ message: "Invalid input values" });
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Calculate total price
    const totalPrice = amount * singlePrice;

    // Create the purchase record
    const newPurchase = new Buy({
      product: productId,
      amount,
      singlePrice,
      totalPrice,
    });

    await newPurchase.save();

    // Update inventory stock
    let inventory = await Inventory.findOne({ product: productId });
    
    if (!inventory) {
      // Create new inventory record if it doesn't exist
      inventory = new Inventory({
        product: productId,
        stock: amount
      });
    } else {
      // Update existing inventory
      inventory.stock += amount;
    }
    
    inventory.lastUpdated = new Date();
    await inventory.save();

    res.status(201).json({
      message: "Product purchased successfully",
      purchase: newPurchase,
      inventory: {
        product: productId,
        stock: inventory.stock,
        lastUpdated: inventory.lastUpdated
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getPurchases = async (req, res) => {
    try {
        const purchases = await Buy.find().populate('product');
        res.status(200).json(purchases);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getPurchaseById = async (req, res) => {
    try {
        const purchase = await Buy.findById(req.params.id).populate('product');
        if (!purchase) {
            return res.status(404).json({ message: "Purchase not found" });
        }
        res.status(200).json(purchase);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.updatePurchase = async (req, res) => {
    try {
        const { amount, singlePrice } = req.body;
        const purchase = await Buy.findById(req.params.id);

        if (!purchase) {
            return res.status(404).json({ message: "Purchase not found" });
        }

        if (amount) purchase.amount = amount;
        if (singlePrice) purchase.singlePrice = singlePrice;
        purchase.totalPrice = purchase.amount * purchase.singlePrice;

        await purchase.save();

        res.status(200).json({
            message: "Purchase updated successfully",
            purchase,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deletePurchase = async (req, res) => {
    try {
        const purchase = await Buy.findById(req.params.id);

        if (!purchase) {
            return res.status(404).json({ message: "Purchase not found" });
        }

        await purchase.remove();

        res.status(200).json({ message: "Purchase deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
