const express = require("express");
const router = express.Router();

const { fetchConsultants, fetchAllUsersForConsultant, updateUserPlan } = require("../controllers/consultantController");
const authMiddleware = require("../middlewares/authMiddleware");
const allowRoles = require("../middlewares/roleMiddleware");

// Any logged-in user can view consultants
router.get("/", authMiddleware, fetchConsultants);

// ✅ Consultant & DBA: view all users
router.get("/users", authMiddleware, allowRoles("consultant", "dba"), fetchAllUsersForConsultant);

// ✅ Consultant & DBA: update a specific user's diet/workout plan
// PUT /api/consultants/update-plan/:userId
router.put("/update-plan/:userId", authMiddleware, allowRoles("consultant", "dba"), updateUserPlan);

module.exports = router;
