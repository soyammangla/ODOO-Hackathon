/**
 * Generic CRUD controller factory used for simple master-data models
 * (Department, Category, EmissionFactor, ProductESGProfile, EnvironmentalGoal,
 * ESGPolicy, Badge, Reward) so each route file stays thin and consistent.
 */
function createCrudController(Model, options = {}) {
  const { populate = [] } = options;

  return {
    getAll: async (req, res, next) => {
      try {
        let query = Model.find(req.query.filter ? JSON.parse(req.query.filter) : {});
        populate.forEach((p) => (query = query.populate(p)));
        const docs = await query.sort({ createdAt: -1 });
        res.json({ success: true, count: docs.length, data: docs });
      } catch (err) {
        next(err);
      }
    },

    getOne: async (req, res, next) => {
      try {
        let query = Model.findById(req.params.id);
        populate.forEach((p) => (query = query.populate(p)));
        const doc = await query;
        if (!doc) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, data: doc });
      } catch (err) {
        next(err);
      }
    },

    create: async (req, res, next) => {
      try {
        const doc = await Model.create(req.body);
        res.status(201).json({ success: true, data: doc });
      } catch (err) {
        next(err);
      }
    },

    update: async (req, res, next) => {
      try {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!doc) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, data: doc });
      } catch (err) {
        next(err);
      }
    },

    remove: async (req, res, next) => {
      try {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, message: "Deleted" });
      } catch (err) {
        next(err);
      }
    },
  };
}

module.exports = createCrudController;
