const { getSupabase } = require("../config/supabaseClient");

const noDb = () => ({ data: null, error: { message: "Supabase is not configured" } });

const getAllConsultants = async () => {
    const supabase = getSupabase();
    if (!supabase) return noDb();
    return await supabase
    .from("CONSULTANTS")
    .select("*");
};

module.exports = {getAllConsultants};