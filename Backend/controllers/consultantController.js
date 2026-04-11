const { getAllConsultants } = require("../models/consultantModel");
const { getAllUsers, updateUserPlanById } = require("../models/userModel");

// Fetch all consultants (existing)
const fetchConsultants = async (req, res) => {
    try {
        const { data, error } = await getAllConsultants();
        if (error) return res.status(400).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Consultant & DBA: view all users
const fetchAllUsersForConsultant = async (req, res) => {
    try {
        const { data, error } = await getAllUsers();
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ✅ Consultant & DBA: update a user's diet and/or workout plan
const updateUserPlan = async (req, res) => {
    try {
        const { userId } = req.params;
        const { diet_plan_breakfast, diet_plan_lunch, diet_plan_dinner, workout_plan } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "userId is required in URL params" });
        }

        const updates = {};

        // Diet plan fields (match your existing DB column names)
        if (diet_plan_breakfast !== undefined) updates.diet_plan_breakfast = diet_plan_breakfast;
        if (diet_plan_lunch !== undefined)     updates.diet_plan_lunch     = diet_plan_lunch;
        if (diet_plan_dinner !== undefined)    updates.diet_plan_dinner    = diet_plan_dinner;

        // Workout plan (stored as JSONB array in USER_PROFILE)
        if (workout_plan !== undefined) updates.workout_plan = workout_plan;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No plan fields provided to update" });
        }

        const { data, error } = await updateUserPlanById(userId, updates);
        if (error) return res.status(400).json({ error: error.message });

        res.json({ message: "User plan updated successfully", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { fetchConsultants, fetchAllUsersForConsultant, updateUserPlan };
