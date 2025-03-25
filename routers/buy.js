const express = require("express");
const Buy = require('../controllers/buy')

const router = express.Router();

router.post("/buy", Buy.buyProduct);
router.get("/purchases", Buy.getPurchases);
router.get("/purchase/:id", Buy.getPurchaseById);
router.delete("/purchase/:id", Buy.deletePurchase);


module.exports = router;
