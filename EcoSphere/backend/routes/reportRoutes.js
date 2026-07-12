const express = require("express");
const { protect } = require("../middleware/auth");
const ctrl = require("../controllers/reportController");

const router = express.Router();

router.get("/environmental", protect, ctrl.environmentalReport);
router.get("/social", protect, ctrl.socialReport);
router.get("/governance", protect, ctrl.governanceReport);
router.get("/esg-summary", protect, ctrl.esgSummaryReport);
router.get("/custom", protect, ctrl.customReport);

module.exports = router;
