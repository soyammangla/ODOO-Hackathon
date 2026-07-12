const CarbonTransaction = require("../models/CarbonTransaction");
const EmissionFactor = require("../models/EmissionFactor");
const OrgConfig = require("../models/OrgConfig");

/**
 * Calculates and stores a Carbon Transaction.
 * quantity is in the unit defined by the linked Emission Factor.
 */
async function calculateAndRecordEmission({
  department,
  sourceType,
  sourceRefId,
  emissionFactorId,
  quantity,
  transactionDate,
  createdBy,
  calculationMode = "Manual",
}) {
  const factor = await EmissionFactor.findById(emissionFactorId);
  if (!factor) throw new Error("Emission factor not found");
  if (factor.status !== "Active") throw new Error("Emission factor is inactive");

  const calculatedEmission = Number((quantity * factor.factorValue).toFixed(4));

  const transaction = await CarbonTransaction.create({
    department,
    sourceType,
    sourceRefId,
    emissionFactor: factor._id,
    quantity,
    unit: factor.unit,
    calculatedEmission,
    emissionUnit: factor.factorUnit,
    calculationMode,
    transactionDate: transactionDate || new Date(),
    createdBy,
  });

  return transaction;
}

/**
 * Entry point used by Purchase/Manufacturing/Expense/Fleet records when
 * Settings > Auto Emission Calculation is enabled.
 */
async function autoCalculateFromERPRecord(record) {
  const config = await OrgConfig.findOne({ key: "global" });
  if (!config || config.autoEmissionCalculation === false) return null;

  return calculateAndRecordEmission({
    department: record.department,
    sourceType: record.sourceType,
    sourceRefId: record.sourceRefId,
    emissionFactorId: record.emissionFactorId,
    quantity: record.quantity,
    transactionDate: record.transactionDate,
    createdBy: record.createdBy,
    calculationMode: "Auto",
  });
}

module.exports = { calculateAndRecordEmission, autoCalculateFromERPRecord };
