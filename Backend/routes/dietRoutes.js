const express = require("express");
const router = express.Router();

const { generateDietPlan } = require("../controllers/dietController");
const authMiddleware = require("../middlewares/authMiddleware");
const allowRoles = require("../middlewares/roleMiddleware");

// ✅ User only — consultants and DBAs cannot generate plans for themselves
router.post("/generate", authMiddleware, allowRoles("user"), generateDietPlan);

module.exports = router;
