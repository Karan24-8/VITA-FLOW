const supabase = require("../config/supabaseClient");

const getAllConsultants = async () => {
    return await supabase
    .from("CONSULTANTS")
    .select("*");
};

module.exports = {getAllConsultants};