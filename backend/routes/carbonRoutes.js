const express = require("express");
const { protect } = require("../middleware/auth");
const carbonController = require("../controllers/carbonController");

const router = express.Router();

router.use(protect);
router.get("/emission-factors", carbonController.getEmissionFactors);
router.post("/transactions", carbonController.createCarbonTransaction);
router.get("/transactions", carbonController.getCarbonTransactions);
router.get("/trend", carbonController.getCarbonTrend);
router.post("/goals", carbonController.createEnvironmentalGoal);
router.get("/goals", carbonController.getEnvironmentalGoals);
router.patch("/goals/:id", carbonController.updateEnvironmentalGoal);
router.post("/product-esg-profiles", carbonController.createProductESGProfile);
router.get("/product-esg-profiles", carbonController.getProductESGProfiles);
router.get("/product-esg-profiles/:id", carbonController.getProductESGProfile);
router.put("/product-esg-profiles/:id", carbonController.updateProductESGProfile);
router.delete("/product-esg-profiles/:id", carbonController.deleteProductESGProfile);

module.exports = router;
