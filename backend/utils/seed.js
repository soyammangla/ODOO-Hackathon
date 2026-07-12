const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("../config/db");

const User = require("../models/User");
const Department = require("../models/Department");
const Category = require("../models/Category");
const EmissionFactor = require("../models/EmissionFactor");
const Badge = require("../models/Badge");
const Reward = require("../models/Reward");
const EnvironmentalGoal = require("../models/EnvironmentalGoal");
const OrgConfig = require("../models/OrgConfig");
const CSRActivity = require("../models/CSRActivity");
const Challenge = require("../models/Challenge");
const ESGPolicy = require("../models/ESGPolicy");
const PolicyAcknowledgement = require("../models/PolicyAcknowledgement");
const Audit = require("../models/Audit");
const ComplianceIssue = require("../models/ComplianceIssue");
const TrainingCompletion = require("../models/TrainingCompletion");
const EmployeeParticipation = require("../models/EmployeeParticipation");

async function seed() {
  await connectDB();
  console.log("Seeding EcoSphere sample data...");

  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Category.deleteMany({}),
    EmissionFactor.deleteMany({}),
    Badge.deleteMany({}),
    Reward.deleteMany({}),
    EnvironmentalGoal.deleteMany({}),
    OrgConfig.deleteMany({}),
    CSRActivity.deleteMany({}),
    Challenge.deleteMany({}),
    ESGPolicy.deleteMany({}),
    PolicyAcknowledgement.deleteMany({}),
    Audit.deleteMany({}),
    ComplianceIssue.deleteMany({}),
    TrainingCompletion.deleteMany({}),
  ]);

  const manufacturing = await Department.create({ name: "Manufacturing", code: "MFG", employeeCount: 120 });
  const logistics = await Department.create({ name: "Logistics", code: "LOG", employeeCount: 60 });
  const admin = await Department.create({ name: "Admin", code: "ADM", employeeCount: 25 });

  const admin1 = await User.create({
    name: "Admin User",
    email: "admin@ecosphere.com",
    password: "password123",
    role: "Admin",
    department: admin._id,
  });

  const manager1 = await User.create({
    name: "ESG Manager",
    email: "manager@ecosphere.com",
    password: "password123",
    role: "ESGManager",
    department: admin._id,
  });

  const priya = await User.create({
    name: "Priya Sharma",
    email: "priya@ecosphere.com",
    password: "password123",
    role: "Employee",
    department: manufacturing._id,
    gender: "Female",
    xp: 1240,
    points: 320,
  });

  const arjun = await User.create({
    name: "Arjun Mehta",
    email: "arjun@ecosphere.com",
    password: "password123",
    role: "Employee",
    department: logistics._id,
    gender: "Male",
    xp: 1105,
    points: 260,
  });

  const csrCategory = await Category.create({ name: "Community Service", type: "CSR Activity" });
  const challengeCategory = await Category.create({ name: "Sustainability", type: "Challenge" });

  await EmissionFactor.create({
    name: "Diesel fuel combustion",
    sourceType: "Fleet",
    scope: "Scope1",
    unit: "litre",
    factorValue: 2.68,
    factorUnit: "kgCO2e",
  });

  await EmissionFactor.create({
    name: "Grid electricity (India average)",
    sourceType: "Manufacturing",
    scope: "Scope2",
    unit: "kWh",
    factorValue: 0.82,
    factorUnit: "kgCO2e",
  });

  await Badge.create({
    name: "Green starter",
    description: "Earn your first 100 XP",
    icon: "ti-seedling",
    unlockRule: { metric: "XP", threshold: 100 },
  });

  await Badge.create({
    name: "Challenge champion",
    description: "Complete 5 challenges",
    icon: "ti-trophy",
    unlockRule: { metric: "CompletedChallenges", threshold: 5 },
  });

  await Reward.create({
    name: "Reusable water bottle",
    description: "Insulated steel bottle",
    pointsRequired: 150,
    stock: 50,
  });

  await Reward.create({
    name: "Extra day off",
    description: "One additional paid day off",
    pointsRequired: 500,
    stock: 10,
  });

  await EnvironmentalGoal.create({
    title: "Reduce manufacturing emissions 15%",
    department: manufacturing._id,
    metric: "CarbonEmission",
    targetValue: 100,
    currentValue: 65,
    unit: "tCO2e",
    startDate: new Date("2026-01-01"),
    targetDate: new Date("2026-12-31"),
    status: "OnTrack",
  });

  // ---- Social module sample data ----
  const treePlantation = await CSRActivity.create({
    title: "Tree plantation drive",
    category: csrCategory._id,
    description: "Plant saplings around the manufacturing campus",
    department: manufacturing._id,
    location: "Manufacturing campus, Gate 2",
    scheduledDate: new Date("2026-07-20"),
    pointsPerParticipation: 25,
    evidenceRequired: true,
    status: "Planned",
    createdBy: manager1._id,
  });

  await CSRActivity.create({
    title: "Blood donation camp",
    category: csrCategory._id,
    description: "Partnered with local hospital for a donation drive",
    department: admin._id,
    location: "Admin block, ground floor",
    scheduledDate: new Date("2026-06-15"),
    pointsPerParticipation: 20,
    evidenceRequired: false,
    status: "Completed",
    createdBy: manager1._id,
  });

  await EmployeeParticipation.create({
    employee: priya._id,
    activity: treePlantation._id,
    approvalStatus: "Pending",
  });

  await Challenge.create({
    title: "Zero-waste week",
    category: challengeCategory._id,
    description: "Reduce office waste to zero for 5 working days",
    xp: 80,
    difficulty: "Medium",
    evidenceRequired: true,
    deadline: new Date("2026-08-01"),
    status: "Active",
    createdBy: manager1._id,
  });

  await Challenge.create({
    title: "Cycle to work",
    category: challengeCategory._id,
    description: "Log 20 commutes by bike or on foot this quarter",
    xp: 60,
    difficulty: "Easy",
    evidenceRequired: false,
    deadline: new Date("2026-09-30"),
    status: "Active",
    createdBy: manager1._id,
  });

  await TrainingCompletion.create({
    employee: priya._id,
    trainingName: "Workplace safety fundamentals",
    status: "Completed",
    completedDate: new Date("2026-05-10"),
  });

  await TrainingCompletion.create({
    employee: arjun._id,
    trainingName: "Anti-harassment policy training",
    status: "Assigned",
  });

  // ---- Governance module sample data ----
  const dataPolicy = await ESGPolicy.create({
    title: "Data privacy and confidentiality policy",
    category: "Governance",
    description: "Guidelines on handling employee and customer data",
    version: "2.0",
    effectiveDate: new Date("2026-01-01"),
    mandatory: true,
    status: "Active",
  });

  await PolicyAcknowledgement.create({ policy: dataPolicy._id, employee: priya._id, status: "Pending" });
  await PolicyAcknowledgement.create({ policy: dataPolicy._id, employee: arjun._id, status: "Acknowledged", acknowledgedAt: new Date() });

  const wasteAudit = await Audit.create({
    title: "Waste disposal audit",
    department: manufacturing._id,
    auditor: "GreenCheck Auditors",
    scope: "Hazardous and non-hazardous waste handling",
    scheduledDate: new Date("2026-06-01"),
    completedDate: new Date("2026-06-10"),
    status: "Completed",
    findingsSummary: "Two minor non-conformities found in segregation labeling",
  });

  await Audit.create({
    title: "Vendor ESG compliance audit",
    department: logistics._id,
    auditor: "Internal ESG Team",
    scope: "Fleet vendor sustainability documentation",
    scheduledDate: new Date("2026-08-15"),
    status: "Scheduled",
  });

  await ComplianceIssue.create({
    audit: wasteAudit._id,
    severity: "High",
    description: "Hazardous waste storage exceeded permitted duration",
    owner: manager1._id,
    dueDate: new Date("2026-07-05"),
    status: "Open",
  });

  await ComplianceIssue.create({
    audit: wasteAudit._id,
    severity: "Medium",
    description: "Segregation labels missing on 3 waste bins",
    owner: admin1._id,
    dueDate: new Date("2026-08-01"),
    status: "InProgress",
  });

  await OrgConfig.create({ key: "global" });

  console.log("Seed complete.");
  console.log("Login as admin: admin@ecosphere.com / password123");
  console.log("Login as manager: manager@ecosphere.com / password123");
  console.log("Login as employee: priya@ecosphere.com / password123");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});