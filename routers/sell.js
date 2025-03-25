const express = require("express");
const Sell = require('../controllers/sell')

const router = express.Router();

router.post("/sell", Sell.sellProduct);
router.get("/sales", Sell.getSales);
router.get("/sales/:id", Sell.getSaleById);
router.delete("/sales/:id", Sell.deleteSale);


module.exports = router;
