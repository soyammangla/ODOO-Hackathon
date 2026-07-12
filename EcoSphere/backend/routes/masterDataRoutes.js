const express = require("express");
const buildCrudRouter = require("./_crudRoute");

const Department = require("../models/Department");
const Category = require("../models/Category");
const EmissionFactor = require("../models/EmissionFactor");
const ProductESGProfile = require("../models/ProductESGProfile");
const EnvironmentalGoal = require("../models/EnvironmentalGoal");
const Badge = require("../models/Badge");
const Reward = require("../models/Reward");

const router = express.Router();

router.use("/departments", buildCrudRouter(Department, { populate: ["head", "parentDepartment"] }));
router.use("/categories", buildCrudRouter(Category));
router.use("/emission-factors", buildCrudRouter(EmissionFactor));
router.use("/product-esg-profiles", buildCrudRouter(ProductESGProfile));
router.use("/environmental-goals", buildCrudRouter(EnvironmentalGoal, { populate: ["department"] }));
router.use("/badges", buildCrudRouter(Badge));
router.use("/rewards", buildCrudRouter(Reward));

module.exports = router;
