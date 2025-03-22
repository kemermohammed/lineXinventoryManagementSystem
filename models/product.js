const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productImage: {
        type: String
    },
    productType: {
        type: String
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;