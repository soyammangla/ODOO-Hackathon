const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { getConfig, updateConfig } = require("../controllers/configController");

const router = express.Router();

router.get("/", protect, getConfig);
router.put("/", protect, authorize("Admin"), updateConfig);

module.exports = router;
