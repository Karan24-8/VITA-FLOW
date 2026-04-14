// routes/chatRoutes.js
const express = require("express");
const { genAI, modelConfig } = require("../ai/model");
const { findConsultantsBySpecialty, getAvailability } = require("../ai/queries");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({ error: "message is required" });
        }

        console.log("[AI CHAT] User:", message);

        // ✅ Convert history into new format
        const contents = [
            ...history,
            {
                role: "user",
                parts: [{ text: message }],
            },
        ];

        let response = await genAI.models.generateContent({
            ...modelConfig,
            contents,
        });

        // ── Tool-call handling loop ───────────────────────────────
        while (response.candidates?.[0]?.content?.parts?.[0]?.functionCall) {
            const call = response.candidates[0].content.parts[0].functionCall;
            const { name, args } = call;

            console.log(`[AI TOOL CALL]: ${name}`, args);

            let toolResult;

            // ── find_consultant ───────────────────────────────────
            if (name === "find_consultant") {
                const consultants = await findConsultantsBySpecialty(args.specialty);

                if (!consultants.length) {
                    toolResult = {
                        found: false,
                        message:
                            "No consultants matched that specialty. Suggest browsing the Consultants page.",
                    };
                } else {
                    const enriched = await Promise.all(
                        consultants.map(async (c) => {
                            const slots = await getAvailability(c.cons_id, args.preferred_time);

                            return {
                                name: c.name,
                                specialization: c.specialization,
                                location: c.location,
                                contact_no: c.contact_no,
                                email: c.email,
                                charges: c.charges,
                                available_slots: slots.length
                                    ? slots.map((s) => ({
                                          from: s.available_from,
                                          to: s.available_to,
                                      }))
                                    : [],
                                available_days: c.available_days,
                                available_time: c.available_time,
                            };
                        })
                    );

                    toolResult = { found: true, consultants: enriched };
                }
            }

            // ── out_of_scope ──────────────────────────────────────
            else if (name === "out_of_scope") {
                toolResult = {
                    acknowledged: true,
                    message: `Topic '${args.topic}' is outside VITA-FLOW's scope.`,
                };
            }

            else {
                toolResult = { error: "Unknown tool" };
            }

            // ✅ Send tool response back to model
            response = await genAI.models.generateContent({
                ...modelConfig,
                contents: [
                    ...contents,
                    {
                        role: "model",
                        parts: [
                            {
                                functionResponse: {
                                    name,
                                    response: toolResult,
                                },
                            },
                        ],
                    },
                ],
            });
        }

        // ✅ Extract final text
        const reply =
            response.candidates?.[0]?.content?.parts
                ?.map((p) => p.text || "")
                .join("") || "No response";

        console.log("[AI REPLY]:", reply);

        res.json({ reply });

    } catch (err) {
        console.error("[AI CHAT ERROR]:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;