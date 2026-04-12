// This file contains only the DB queries.
const { getSupabase } = require("../config/supabaseClient");

const noDb = () => ({ data: null, error: { message: "Supabase is not configured" } });

const createUser = async (email, password_hash, name = null, role = "user") => {
    const supabase = getSupabase();
    if (!supabase) return noDb();
    return await supabase
        .from("USER_PROFILE")
        .insert([{ email, password_hash, name, role }]);
};

const findUserByEmail = async (email) => {
    const supabase = getSupabase();
    if (!supabase) return noDb();
    return await supabase
        .from("USER_PROFILE")
        .select("*")
        .eq("email", email)
        .single();
};

const updateUserProfile = async (email, updates) => {
    const supabase = getSupabase();
    if (!supabase) return noDb();

    // ✅ Fix #3 — strip role and password_hash so they can never be
    // escalated via a profile update, no matter what the request body contains
    const { role, password_hash, ...safeUpdates } = updates;

    return await supabase
        .from("USER_PROFILE")
        .update(safeUpdates)
        .eq("email", email)
        .select()
        .single();
};

// ✅ Fix #2 — fetch only the logged-in user's own profile
const getOwnProfile = async (email) => {
    const supabase = getSupabase();
    if (!supabase) return noDb();
    return await supabase
        .from("USER_PROFILE")
        .select("user_id, email, name, phone, age, gender, height_cm, weight_kg, activity_level, allergies, meal_preferences, deadline, aim_kg, role, calories_req_per_day, diet_plan_breakfast, diet_plan_lunch, diet_plan_dinner, workout_plan")
        .eq("email", email)
        .single();
};

// Used by consultant & dba to update any user's plan
const updateUserPlanById = async (userId, updates) => {
    const supabase = getSupabase();
    if (!supabase) return noDb();
    return await supabase
        .from("USER_PROFILE")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();
};

const getAllUsers = async () => {
    const supabase = getSupabase();
    if (!supabase) return noDb();
    return await supabase
        .from("USER_PROFILE")
        .select("user_id, email, name, phone, age, gender, height_cm, weight_kg, activity_level, allergies, meal_preferences, deadline, aim_kg, role");
};

module.exports = {
    createUser,
    findUserByEmail,
    updateUserProfile,
    getOwnProfile,
    updateUserPlanById,
    getAllUsers
};
