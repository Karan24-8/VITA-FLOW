const {generateWorkoutPlanDB, getWorkoutPlan, getUserIDByEmail} = require("../models/exerciseModel");
const {updateUserProfile} = require("../models/userModel");

const generateWorkoutPlan = async(req, res) => {
    try{
        const email = req.user.email;
        const activityLevel = req.body?.activity_level;

        if (activityLevel) {
            const {error: updateError} = await updateUserProfile(email, {activity_level: activityLevel});
            if (updateError) return res.status(400).json({error: updateError.message});
        }

        //Get user ID
        const {data : user, error:userError} = await getUserIDByEmail(email);
        if(userError) return res.status(400).json({error: userError.message});
        if(!user?.user_id) return res.status(404).json({error: "User profile not found"});

        // Generate workout plan (RPC)
        const {error: rpcError} = await generateWorkoutPlanDB(user.user_id);
        if(rpcError) return res.status(400).json({error: rpcError.message});

        //Fetch generated plan
        const {data, error} = await getWorkoutPlan(user.user_id);
        if(error) return res.status(400).json({error: error.message});

        res.json({
            message:"Workout Plan Generated Successfully",
            plan: data
        });
    }
    catch (err) {
        res.status(500).json({error: err.message});
    }
};

module.exports = {generateWorkoutPlan};