const { getSupabase } = require("../config/supabaseClient");

const noDb = () => ({ data: null, error: { message: "Supabase is not configured" } });

// Call PostgreSQL function
const generateWorkoutPlanDB = async(uid) => {
    const supabase = getSupabase();
    if (!supabase) return noDb();
    return await supabase.rpc("generate_full_workout_plan", {uid});
};

// Fetch generated workout plan
const getWorkoutPlan = async (uid) => {
    const supabase = getSupabase();
    if (!supabase) return noDb();
    return await supabase
    .from("USER_PROFILE")
    .select("workout_plan")
    .eq("user_id", uid)
    .single();
};

// Get user_id from email (reuse same logic)
const getUserIDByEmail = async(email) => {
    const supabase = getSupabase();
    if (!supabase) return noDb();
    return await supabase
    .from("USER_PROFILE")
    .select("user_id")
    .eq("email", email)
    .single();
};

module.exports = {
    generateWorkoutPlanDB,
    getWorkoutPlan,
    getUserIDByEmail
};