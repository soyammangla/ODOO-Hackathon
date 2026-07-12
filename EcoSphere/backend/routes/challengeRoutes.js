const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/challengeController");

const router = express.Router();

router.get("/", protect, ctrl.listChallenges);
router.post("/", protect, authorize("Admin", "ESGManager"), ctrl.createChallenge);
router.put("/:id/status", protect, authorize("Admin", "ESGManager"), ctrl.changeStatus);

router.post("/:challengeId/join", protect, ctrl.joinChallenge);
router.put("/participations/:id/progress", protect, ctrl.updateProgress);
router.put("/participations/:id/review", protect, authorize("Admin", "ESGManager"), ctrl.reviewParticipation);

router.get("/leaderboard/top", protect, ctrl.leaderboard);

module.exports = router;
