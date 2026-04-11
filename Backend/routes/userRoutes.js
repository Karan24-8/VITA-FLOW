const express = require("express");
const router = express.Router();

const { getProfile, updateProfile, fetchAllUsers } = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const allowRoles = require("../middlewares/roleMiddleware");

// ✅ Fix #2 — any logged-in user can fetch their own profile
router.get("/profile", authMiddleware, getProfile);

// any logged-in user can update their own profile
router.put("/profile", authMiddleware, updateProfile);

// ✅ DBA only
router.get("/users", authMiddleware, allowRoles("dba"), fetchAllUsers);

module.exports = router;
