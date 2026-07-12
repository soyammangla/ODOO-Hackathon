const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const createCrudController = require("../controllers/genericCrudController");

/**
 * Builds a standard CRUD router for a Mongoose model.
 * Reads are open to any authenticated user; writes require Admin/ESGManager.
 */
function buildCrudRouter(Model, options = {}) {
  const router = express.Router();
  const ctrl = createCrudController(Model, options);
  const writeRoles = options.writeRoles || ["Admin", "ESGManager"];

  router.get("/", protect, ctrl.getAll);
  router.get("/:id", protect, ctrl.getOne);
  router.post("/", protect, authorize(...writeRoles), ctrl.create);
  router.put("/:id", protect, authorize(...writeRoles), ctrl.update);
  router.delete("/:id", protect, authorize(...writeRoles), ctrl.remove);

  return router;
}

module.exports = buildCrudRouter;
