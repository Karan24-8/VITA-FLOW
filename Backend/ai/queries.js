// ai/queries.js
// Database query functions for the AI agent.
// Fully synced with VITA-FLOW's CONSULTANTS table schema:
//   cons_id (uuid), name (text), specialization (text — "Physician" | "Dietician"),
//   available_time (text), available_days (text), charges (numeric),
//   contact_no (text), email (text), location (text)

const { getSupabase } = require("../config/supabaseClient");

/**
 * Find consultants matching the user's need.
 *
 * Since specialization only has two values ("Physician" / "Dietician"),
 * we map the AI's free-text specialty keyword to the correct category,
 * then return all consultants of that type (up to 5).
 *
 * Mapping logic:
 *  - Anything nutrition / diet / food / weight / meal / vegan → Dietician
 *  - Anything injury / pain / rehab / medical / doctor / physio → Physician
 *  - If unclear → search both and return top 5 overall
 */
async function findConsultantsBySpecialty(keyword) {
    const supabase = getSupabase();
    if (!supabase) return [];

    const kw = (keyword || "").toLowerCase();

    // Keywords that map to Dietician
    const dietKeywords = [
        "diet", "nutrition", "food", "meal", "weight", "calorie",
        "vegan", "vegetarian", "fat", "protein", "carb", "eat",
        "eating", "metabolic", "supplement", "macro", "gut",
    ];

    // Keywords that map to Physician
    const physKeywords = [
        "injury", "pain", "rehab", "rehabilitation", "medical",
        "doctor", "physio", "physiotherapy", "muscle", "joint",
        "bone", "surgery", "recovery", "clinical", "diagnos",
        "disease", "condition", "chronic", "diabetes", "blood",
    ];

    const isDiet = dietKeywords.some(w => kw.includes(w));
    const isPhys = physKeywords.some(w => kw.includes(w));

    let query = supabase
        .from("CONSULTANTS")
        .select("cons_id, name, specialization, available_time, available_days, charges, contact_no, email, location")
        .limit(5);

    if (isDiet && !isPhys) {
        query = query.eq("specialization", "Dietician");
    } else if (isPhys && !isDiet) {
        query = query.eq("specialization", "Physician");
    }
    // If both or neither match → return mix of both (no filter)

    const { data, error } = await query;

    if (error) {
        console.error("[AI queries] findConsultantsBySpecialty error:", error.message);
        return [];
    }

    return data || [];
}

/**
 * Fetch available (unbooked) slots for a given consultant from
 * CONSULTANT_AVAILABILITY table.
 * Falls back to the consultant's available_days + available_time
 * text fields from CONSULTANTS if no structured slots exist.
 *
 * consultant_id is a UUID (matches cons_id in CONSULTANTS).
 * preferredTime: 'morning' | 'afternoon' | 'evening' | undefined
 */
async function getAvailability(consultantId, preferredTime) {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
        .from("CONSULTANT_AVAILABILITY")
        .select("available_from, available_to")
        .eq("consultant_id", consultantId)
        .eq("booked", false)
        .order("available_from", { ascending: true })
        .limit(3);

    if (error) {
        // Table not set up yet — return empty, AI will use
        // available_days + available_time text from CONSULTANTS instead
        console.warn("[AI queries] CONSULTANT_AVAILABILITY query failed:", error.message);
        return [];
    }

    if (!data || data.length === 0) return [];

    // Apply time-of-day filter in JS
    if (!preferredTime) return data;

    const timeRanges = {
        morning:   [6,  11],
        afternoon: [12, 16],
        evening:   [17, 20],
    };
    const range = timeRanges[preferredTime];
    if (!range) return data;

    return data.filter(slot => {
        const hour = new Date(slot.available_from).getHours();
        return hour >= range[0] && hour <= range[1];
    });
}

module.exports = { findConsultantsBySpecialty, getAvailability };
