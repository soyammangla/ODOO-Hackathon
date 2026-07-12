const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const ctrl = require("../controllers/governanceController");

const router = express.Router();

router.post("/policies", protect, authorize("Admin", "ESGManager"), ctrl.publishPolicy);
router.put("/policies/:policyId/acknowledge", protect, ctrl.acknowledgePolicy);
router.get("/policies/acknowledgements/mine", protect, ctrl.myAcknowledgements);

router.get("/audits", protect, ctrl.listAudits);
router.post("/audits", protect, authorize("Admin", "ESGManager"), ctrl.createAudit);

router.get("/compliance-issues", protect, ctrl.listComplianceIssues);
router.post("/compliance-issues", protect, authorize("Admin", "ESGManager"), ctrl.raiseComplianceIssue);
router.put("/compliance-issues/:id", protect, authorize("Admin", "ESGManager"), ctrl.updateComplianceIssue);

module.exports = router;
