// It contains the functions related to any user(s).

const { updateUserProfile, getAllUsers, getOwnProfile } = require("../models/userModel");

// ✅ Fix #2 — any logged-in user can fetch their own profile
const getProfile = async (req, res) => {
    try {
        const email = req.user.email; // from JWT
        const { data, error } = await getOwnProfile(email);
        if (error) return res.status(400).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const email = req.user.email; // from JWT
        const {
            name,
            phone,
            age,
            gender,
            height_cm,
            weight_kg,
            activity_level,
            allergies,
            meal_preferences,
            meal_preference,
            deadline,
            aim_kg
        } = req.body;

        // role and password_hash are stripped inside updateUserProfile in the model
        // so even if someone sends them here, they won't reach the DB

        const normalizedMealPreference = meal_preferences || meal_preference;
        const normalizedAllergies = Array.isArray(allergies)
            ? allergies
            : (typeof allergies === "string" && allergies.trim()
                ? allergies.split(",").map((a) => a.trim()).filter(Boolean)
                : []);

        const { data, error } = await updateUserProfile(email, {
            name,
            phone,
            age,
            gender,
            height_cm,
            weight_kg,
            activity_level,
            allergies: normalizedAllergies,
            meal_preferences: normalizedMealPreference,
            deadline,
            aim_kg
        });

        if (error) return res.status(400).json({ error: error.message });
        res.json({ message: "Profile Updated", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DBA only
const fetchAllUsers = async (req, res) => {
    try {
        const { data, error } = await getAllUsers();
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getProfile, updateProfile, fetchAllUsers };
