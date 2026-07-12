const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { createTransaction, listTransactions, departmentCarbonSummary } = require("../controllers/carbonController");

const router = express.Router();

router.get("/", protect, listTransactions);
router.get("/summary/by-department", protect, departmentCarbonSummary);
router.post("/", protect, authorize("Admin", "ESGManager"), createTransaction);

module.exports = router;
