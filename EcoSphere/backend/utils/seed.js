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

  await User.create({
    name: "Priya Sharma",
    email: "priya@ecosphere.com",
    password: "password123",
    role: "Employee",
    department: manufacturing._id,
    gender: "Female",
    xp: 1240,
    points: 320,
  });

  await User.create({
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
