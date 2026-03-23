const express = require("express");
const router = express.Router();
const {fetchConsultants} = require("../controllers/consultantController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, fetchConsultants);

module.exports = router;