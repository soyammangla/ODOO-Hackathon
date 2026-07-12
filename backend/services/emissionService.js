function calculateCarbonEmission(quantity, emissionFactor) {
  const parsedQuantity = Number(quantity);
  const parsedFactor = Number(emissionFactor);

  if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
    const error = new Error("Quantity must be a non-negative number");
    error.statusCode = 400;
    throw error;
  }
  if (!Number.isFinite(parsedFactor) || parsedFactor < 0) {
    const error = new Error("Emission factor must be a non-negative number");
    error.statusCode = 400;
    throw error;
  }

  return Number((parsedQuantity * parsedFactor).toFixed(6));
}

module.exports = { calculateCarbonEmission };
