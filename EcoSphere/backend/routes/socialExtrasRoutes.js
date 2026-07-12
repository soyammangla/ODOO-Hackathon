const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/socialExtrasController");

const router = express.Router();

router.get("/diversity-metrics", protect, ctrl.diversityMetrics);
router.get("/trainings", protect, ctrl.listTrainings);
router.post("/trainings", protect, authorize("Admin", "ESGManager"), ctrl.assignTraining);
router.put("/trainings/:id", protect, ctrl.updateTraining);

module.exports = router;
