const Inventory = require('../models/inventory');
const Product = require('../models/product');
const Buy = require('../models/buy');
const Sell = require('../models/sell');

// Utility function to update inventory
exports.updateInventory = async (productId, amount, operation) => {
  try {
    let inventory = await Inventory.findOne({ product: productId });
    
    if (!inventory) {
      inventory = new Inventory({
        product: productId,
        stock: operation === 'buy' ? amount : -amount
      });
    } else {
      if (operation === 'buy') {
        inventory.stock += amount;
      } else if (operation === 'sell') {
        inventory.stock -= amount;
      }
    }

    inventory.lastUpdated = new Date();
    return await inventory.save();
  } catch (error) {
    throw error;
  }
};

// Get complete inventory with product details
exports.getInventory = async (req, res) => {
  try {
    // Get all products with their inventory status (including zero stock)
    const products = await Product.find().lean();
    const inventoryRecords = await Inventory.find().populate({
      path: 'product',
      select: 'name description'
    });

    // Create response with all products
    const response = products.map(product => {
      const inventoryItem = inventoryRecords.find(item => 
        item.product && item.product._id.equals(product._id)
      );
      
      return {
        product: {
          _id: product._id,
          name: product.productName,
    
        },
        stock: inventoryItem ? inventoryItem.stock : 0,
        lastUpdated: inventoryItem ? inventoryItem.lastUpdated : null
      };
    });

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get inventory for specific product
exports.getProductInventory = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const inventory = await Inventory.findOne({ product: req.params.productId })
      .populate('product', 'name description');

    res.status(200).json({
      product: {
        _id: product._id,
        name: product.name,
        description: product.description
      },
      stock: inventory ? inventory.stock : 0,
      lastUpdated: inventory ? inventory.lastUpdated : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get transaction history for a product
exports.getInventoryHistory = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const [inventory, purchases, sales] = await Promise.all([
      Inventory.findOne({ product: req.params.productId }),
      Buy.find({ product: req.params.productId })
        .sort({ date: -1 })
        .select('amount singlePrice totalPrice date'),
      Sell.find({ product: req.params.productId })
        .sort({ date: -1 })
        .select('amount singlePrice totalPrice date')
    ]);

    res.status(200).json({
      product: {
        _id: product._id,
        name: product.name,
        description: product.description
      },
      currentStock: inventory ? inventory.stock : 0,
      purchases,
      sales
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get current stock level
exports.getCurrentStock = async (productId) => {
  const inventory = await Inventory.findOne({ product: productId });
  return inventory ? inventory.stock : 0;
};