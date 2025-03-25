const express = require('express');
const upload = require("../middleware/upload");

const router = express.Router();
// const createProduct = require('../controllers/product');
const productController = require('../controllers/product');

// Create a new product
router.post('/newProduct', productController.createProduct);

// Get all products
router.get('/products', productController.getAllProducts);

// Get a product by ID
router.get('/product/:id', productController.getProductById);

// Update a product by ID

// router.put('/product/:id',upload.single('productImage'), productController.updateProductById);
router.put('/product/:id', upload, productController.updateProductById);
// Delete a product by ID
router.delete('/product/:id', productController.deleteProductById);

// Export the router
module.exports = router;