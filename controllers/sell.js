const Sell = require("../models/sell");
const Product = require("../models/product");
const Inventory = require("../models/inventory");

exports.sellProduct = async (req, res) => {
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

    // Check available stock
    const inventory = await Inventory.findOne({ product: productId });
    const currentStock = inventory ? inventory.stock : 0;

    if (currentStock < amount) {
      return res.status(400).json({ 
        message: "Insufficient stock",
        availableStock: currentStock,
        requestedAmount: amount
      });
    }

    // Calculate total price
    const totalPrice = amount * singlePrice;

    // Create the sale record
    const newSale = new Sell({
      product: productId,
      amount,
      singlePrice,
      totalPrice,
    });

    await newSale.save();

    // Update inventory stock
    inventory.stock -= amount;
    inventory.lastUpdated = new Date();
    await inventory.save();

    res.status(201).json({
      message: "Product sold successfully",
      sale: newSale,
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

exports.getSales = async (req, res) => {
  try {
    const sales = await Sell.find().populate("product");
    res.status(200).json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sell.findById(req.params.id).populate("product");
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.status(200).json(sale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateSale = async (req, res) => {
  try {
    const { amount, singlePrice } = req.body;
    const sale = await Sell.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Get current inventory
    const inventory = await Inventory.findOne({ product: sale.product });
    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found for this product" });
    }

    // Calculate stock difference
    const originalAmount = sale.amount;
    const newAmount = amount || originalAmount;
    const stockDifference = newAmount - originalAmount;

    // Check if update would result in negative stock
    if (inventory.stock - stockDifference < 0) {
      return res.status(400).json({ 
        message: "Update would result in negative stock",
        availableStock: inventory.stock,
        attemptedAdjustment: stockDifference
      });
    }

    // Update sale
    if (amount) sale.amount = amount;
    if (singlePrice) sale.singlePrice = singlePrice;
    sale.totalPrice = sale.amount * sale.singlePrice;

    await sale.save();

    // Update inventory
    inventory.stock -= stockDifference;
    inventory.lastUpdated = new Date();
    await inventory.save();

    res.status(200).json({
      message: "Sale updated successfully",
      sale,
      inventory: {
        product: sale.product,
        stock: inventory.stock,
        lastUpdated: inventory.lastUpdated
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sell.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Get current inventory
    const inventory = await Inventory.findOne({ product: sale.product });
    if (inventory) {
      // Restore the stock when deleting a sale
      inventory.stock += sale.amount;
      inventory.lastUpdated = new Date();
      await inventory.save();
    }

    await sale.remove();

    res.status(200).json({ 
      message: "Sale deleted successfully",
      inventory: inventory ? {
        product: sale.product,
        stock: inventory.stock,
        lastUpdated: inventory.lastUpdated
      } : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};