const express = require("express");
const { protect } = require("../middleware/auth");
const { organizationDashboard, departmentRankings } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/", protect, organizationDashboard);
router.get("/department-rankings", protect, departmentRankings);

module.exports = router;
