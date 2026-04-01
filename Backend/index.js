const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const consultantsRoutes = require("./routes/consultantsRoutes");
const dietRoutes = require("./routes/dietRoutes");
const exerciseRoutes = require("./routes/exerciseRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const requiredEnv = ["JWT_SECRET", "SUPABASE_URL", "SUPABASE_SERVICE_KEY"];
const missingEnv = requiredEnv.filter((k) => !process.env[k]);

if (missingEnv.length) {
    console.warn(`Missing required env vars: ${missingEnv.join(", ")}`);
}

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API running");
})

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/consultants", consultantsRoutes);
app.use("/api/diet", dietRoutes);
app.use("/api/exercise", exerciseRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})