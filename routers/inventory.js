const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory");

router.get("/inventory", inventoryController.getInventory);
router.get("/:productId", inventoryController.getProductInventory);

module.exports = router;