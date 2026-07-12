const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const cron = require("node-cron");

dotenv.config();

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { flagOverdueIssues } = require("./controllers/governanceController");

const authRoutes = require("./routes/authRoutes");
const masterDataRoutes = require("./routes/masterDataRoutes");
const carbonRoutes = require("./routes/carbonRoutes");
const csrRoutes = require("./routes/csrRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const governanceRoutes = require("./routes/governanceRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const socialExtrasRoutes = require("./routes/socialExtrasRoutes");
const configRoutes = require("./routes/configRoutes");

connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ success: true, message: "EcoSphere API is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/master-data", masterDataRoutes);
app.use("/api/carbon-transactions", carbonRoutes);
app.use("/api/csr", csrRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/governance", governanceRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/social", socialExtrasRoutes);
app.use("/api/config", configRoutes);

app.use(notFound);
app.use(errorHandler);

// Daily at 1am: flag compliance issues that passed their due date while still open
cron.schedule("0 1 * * *", async () => {
  try {
    const result = await flagOverdueIssues();
    console.log("Overdue compliance issue scan:", result.modifiedCount, "flagged");
  } catch (err) {
    console.error("Overdue scan failed:", err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`EcoSphere backend running on port ${PORT}`));

module.exports = app;
