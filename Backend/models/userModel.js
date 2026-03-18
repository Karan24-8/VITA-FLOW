// This file contains the functions of user, like user creation, fetching user, etc, more to be added.
const supabase = require("../config/supabaseClient");

const createUser = async (email, password_hash) => {
    return await supabase
    .from("USER_PROFILE")
    .insert([{email, password_hash}]);
};

const findUserByEmail = async(email) => {
    return await supabase
    .from("USER_PROFILE")
    .select("*")
    .eq("email", email)
    .single();
};

module.exports = {createUser, findUserByEmail};