// ai/tools.js
// Gemini function declarations — tells the model which tools it can call
// and what arguments each one accepts.
//
// Note: This backend uses `@google/genai` (new SDK). Its tool schema is
// standard JSON Schema (no `SchemaType` enum), so we define schemas as
// plain JSON objects for compatibility.

// ── Tool 1: find_consultant ───────────────────────────────────────────
// Triggered when the user's query needs a specialised human expert.
// Maps to the CONSULTANTS table in Supabase via getSupabase().
const findConsultantDeclaration = {
  name: "find_consultant",
  description:
    "Search the database for a human fitness or medical consultant " +
    "matching the user's required specialty. Call this whenever the " +
    "user's query requires personalised medical, injury, or " +
    "highly specialised nutritional advice.",
  parameters: {
    type: "object",
    properties: {
      specialty: {
        type: "string",
        description:
          "The specific specialty needed, e.g. 'vegan nutrition', " +
          "'injury rehabilitation', 'medical nutrition'.",
      },
      preferred_time: {
        type: "string",
        description:
          "User's preferred time of day for a session: " +
          "'morning', 'afternoon', or 'evening'. " +
          "Ask the user for this before calling the tool.",
      },
    },
    required: ["specialty"],
  },
};

// ── Tool 2: out_of_scope ──────────────────────────────────────────────
// Triggered when the user asks something completely outside fitness /
// nutrition — e.g. legal, financial, unrelated tech support.
const outOfScopeDeclaration = {
  name: "out_of_scope",
  description:
    "Call this when the user's question is completely outside the " +
    "domain of fitness and general nutrition — e.g. legal advice, " +
    "financial questions, unrelated technical support, etc.",
  parameters: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        description: "Brief label of the out-of-scope topic.",
      },
    },
    required: ["topic"],
  },
};

module.exports = { findConsultantDeclaration, outOfScopeDeclaration };
