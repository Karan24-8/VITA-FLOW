// Linking our backend to our database.
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

let client = null;

function getSupabase() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;

  client = createClient(url, key);
  return client;
}

module.exports = { getSupabase };