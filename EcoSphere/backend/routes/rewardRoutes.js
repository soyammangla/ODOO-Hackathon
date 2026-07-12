const express = require("express");
const { protect } = require("../middleware/auth");
const { redeemReward, myRedemptions } = require("../controllers/rewardController");

const router = express.Router();

router.post("/:rewardId/redeem", protect, redeemReward);
router.get("/redemptions/mine", protect, myRedemptions);

module.exports = router;
