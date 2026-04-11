// This file contains the User signin and login functions

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../models/userModel");

const ALLOWED_ROLES = ["user", "consultant", "dba"];

const signUp = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Email and password are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Validate role — default to "user" if not provided
        const assignedRole = role && ALLOWED_ROLES.includes(role) ? role : "user";

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedName = typeof name === "string" ? name.trim() : null;
        const hashedPassword = await bcrypt.hash(password, 10);

        const { data, error } = await createUser(normalizedEmail, hashedPassword, normalizedName, assignedRole);
        if (error) {
            if (error.code === "23505") {
                return res.status(409).json({ message: "Account already exists for this email" });
            }
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: "User created", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const { data, error } = await findUserByEmail(normalizedEmail);
        if (error || !data) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, data.password_hash);
        if (!isMatch) return res.status(400).json({ message: "Wrong password" });

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "Server auth is not configured" });
        }

        // ✅ Role is now included in the JWT payload
        const token = jwt.sign(
            { email: data.email, role: data.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            token,
            user: { email: data.email, id: data.user_id, role: data.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { signUp, login };
