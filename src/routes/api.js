const express = require("express");
const router = express.Router();
const ruleController = require("../controllers/ruleController");

router.post("/rules", ruleController.createRule);
router.post("/rules/combine", ruleController.combineRules);
router.post("/rules/evaluate", ruleController.evaluateRule);
router.get("/rules/:operatorId", ruleController.getRuleByBFS);


module.exports = router;
