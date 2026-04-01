const { getSupabase } = require("../config/supabaseClient");

const noDb = () => ({ data: null, error: { message: "Supabase is not configured" } });

//Call PostgreSQL function
const generatePlanDB = async (uid) => {
    const supabase = getSupabase();
    if (!supabase) return noDb();
    return await supabase.rpc("generate_full_plan", {uid});
};

//Fetch generated diet plan
const getDietPlan = async (uid) => {
    const supabase = getSupabase();
    if (!supabase) return noDb();
    return await supabase
    .from("USER_PROFILE")
    .select("diet_plan_breakfast, diet_plan_lunch, diet_plan_dinner")
    .eq("user_id", uid)
    .single();
};

//Get user_id from email
const getUserIdByEmail = async (email) => {
    const supabase = getSupabase();
    if (!supabase) return noDb();
    return await supabase
    .from("USER_PROFILE")
    .select("user_id")
    .eq("email", email)
    .single();
};

module.exports = {
    generatePlanDB,
    getDietPlan,
    getUserIdByEmail
};