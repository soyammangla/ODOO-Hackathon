const OrgConfig = require("../models/OrgConfig");

async function getConfig(req, res, next) {
  try {
    let config = await OrgConfig.findOne({ key: "global" });
    if (!config) config = await OrgConfig.create({ key: "global" });
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
}

async function updateConfig(req, res, next) {
  try {
    const config = await OrgConfig.findOneAndUpdate({ key: "global" }, req.body, {
      new: true,
      upsert: true,
      runValidators: true,
    });
    res.json({ success: true, data: config });
  } catch (err) {
    next(err);
  }
}

module.exports = { getConfig, updateConfig };
