// It contains the functions related to any user(s).

const {updateUserProfile} = require("../models/userModel");
const {getAllUsers} = require("../models/userModel");

const updateProfile = async (req, res) => {
    try{
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

        const normalizedMealPreference = meal_preferences || meal_preference;
        const normalizedAllergies = Array.isArray(allergies)
            ? allergies
            : (typeof allergies === "string" && allergies.trim()
                ? allergies.split(",").map((a) => a.trim()).filter(Boolean)
                : []);

        const {data, error} = await updateUserProfile(email, {
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

        if(error) return res.status(400).json({error: error.message});

        res.json({message: "Profile Updated", data});
    } catch(err){
        res.status(500).json({error: err.message});
    }
};

const fetchAllUsers = async(req, res) => {
    try{
        const {data, error} = await getAllUsers();
        if(error) return res.status(500).json({error: error.message});
        res.json(data);
    }
    catch(err){
        res.status(500).json({error: err.message});
    }
};

module.exports = { updateProfile, fetchAllUsers };