const {generatePlanDB, getDietPlan, getUserIdByEmail} = require("../models/dietModel");
const {updateUserProfile} = require("../models/userModel");

const generateDietPlan = async(req, res) => {
    try {
        const email = req.user.email;
        const mealPreference = req.body?.meal_preferences || req.body?.meal_preference;
        const allergies = req.body?.allergies;

        // Keep DB profile in sync with frontend payload before generation.
        const profileUpdates = {};
        if (mealPreference) profileUpdates.meal_preferences = mealPreference;
        if (Array.isArray(allergies)) profileUpdates.allergies = allergies;
        else if (typeof allergies === "string") {
            profileUpdates.allergies = allergies.trim()
                ? allergies.split(",").map((a) => a.trim()).filter(Boolean)
                : [];
        }
        if (Object.keys(profileUpdates).length) {
            const {error: updateError} = await updateUserProfile(email, profileUpdates);
            if (updateError) return res.status(400).json({error: updateError.message});
        }

        // Get user id
        const {data:user, error:userError} = await getUserIdByEmail(email);
        if(userError) return res.status(400).json({error: userError.message});
        if(!user?.user_id) return res.status(404).json({error: "User profile not found"});

        // Generate Plan
        const {error: rpcError} = await generatePlanDB(user.user_id);
        if(rpcError) return res.status(400).json({error: rpcError.message});

        // Fetch generated Plan
        const {data, error} = await getDietPlan(user.user_id);
        if(error) return res.status(400).json({error: error.message});

        res.json({
            message: "Diet Plan Generated Successfully",
            plan: data
        });
    }
    catch(err){
        res.status(500).json({error: err.message});
    }
};

module.exports = {generateDietPlan};