//This file contains only the DB queries.
const { getSupabase } = require("../config/supabaseClient");

const noDb = () => ({ data: null, error: { message: "Supabase is not configured" } });

const createUser = async (email, password_hash, name = null) => {
    const supabase = getSupabase();
    if (!supabase) return noDb();
    return await supabase
    .from("USER_PROFILE")
    .insert([{email, password_hash, name}]);
};

const findUserByEmail = async(email) => {
    const supabase = getSupabase();
    if (!supabase) return noDb();
    return await supabase
    .from("USER_PROFILE")
    .select("*")
    .eq("email", email)
    .single();
};

const updateUserProfile = async(email, updates) => {
    const supabase = getSupabase();
    if (!supabase) return noDb();
    return await supabase
    .from("USER_PROFILE")
    .update(updates)
    .eq("email", email)
    .select()
    .single();
};

const getAllUsers = async() => {
    const supabase = getSupabase();
    if (!supabase) return noDb();
    return await supabase
    .from("USER_PROFILE")
    .select("user_id, email, name, phone, age, gender, height_cm, weight_kg, activity_level, allergies, meal_preferences, deadline, aim_kg, created_at");
};

module.exports = {createUser, findUserByEmail, updateUserProfile, getAllUsers};