const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/csrController");

const router = express.Router();

router.get("/activities", protect, ctrl.listActivities);
router.post("/activities", protect, authorize("Admin", "ESGManager"), ctrl.createActivity);
router.put("/activities/:id", protect, authorize("Admin", "ESGManager"), ctrl.updateActivity);

router.post("/activities/:activityId/join", protect, ctrl.joinActivity);
router.put("/participations/:id/proof", protect, ctrl.submitProof);
router.put("/participations/:id/review", protect, authorize("Admin", "ESGManager"), ctrl.reviewParticipation);
router.get("/participations/mine", protect, ctrl.myParticipations);

module.exports = router;
