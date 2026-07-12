const express = require("express");
const { protect } = require("../middleware/auth");
const { myNotifications, markRead } = require("../controllers/notificationController");

const router = express.Router();

router.get("/", protect, myNotifications);
router.put("/:id/read", protect, markRead);

module.exports = router;
