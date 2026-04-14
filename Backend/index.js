// index.js — VITA-FLOW backend entry point
// ✅ Added: /api/chat route for AI agent

const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const authRoutes        = require("./routes/authRoutes");
const userRoutes        = require("./routes/userRoutes");
const consultantsRoutes = require("./routes/consultantsRoutes");
const dietRoutes        = require("./routes/dietRoutes");
const exerciseRoutes    = require("./routes/exerciseRoutes");
const chatRoutes        = require("./routes/chatRoutes"); // ✅ NEW

const app = express();
const PORT = process.env.PORT || 5000;

process.on("uncaughtException", (err) => {
    console.error("[FATAL] uncaughtException:", err);
});
process.on("unhandledRejection", (reason) => {
    console.error("[FATAL] unhandledRejection:", reason);
});
process.on("beforeExit", (code) => {
    console.warn("[NODE] beforeExit with code:", code);
});
process.on("exit", (code) => {
    console.warn("[NODE] exit with code:", code);
});

const requiredEnv = ["JWT_SECRET", "SUPABASE_URL", "SUPABASE_SERVICE_KEY", "GEMINI_API_KEY"];
const missingEnv  = requiredEnv.filter((k) => !process.env[k]);
if (missingEnv.length) {
    console.warn(`Missing required env vars: ${missingEnv.join(", ")}`);
}

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("VITA-FLOW API running"));

app.use("/api/auth",        authRoutes);
app.use("/api/user",        userRoutes);
app.use("/api/consultants", consultantsRoutes);
app.use("/api/diet",        dietRoutes);
app.use("/api/exercise",    exerciseRoutes);
app.use("/api/chat",        chatRoutes); // ✅ NEW — AI agent endpoint

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
    console.error("[HTTP] server error:", err);
});
server.on("close", () => {
    console.warn("[HTTP] server closed");
});
