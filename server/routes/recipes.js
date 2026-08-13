const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");

router.post("/generate", async (req, res) => {
  const { ingredients, dietary } = req.body;
  console.log("Received request with ingredients:", ingredients);

  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ error: "No ingredients provided" });
  }

  const dietaryText =
    dietary && dietary.length > 0
      ? `All recipes MUST be ${dietary.join(", ")}.`
      : "";

  const cacheKey = ingredients.sort().join(",") + dietaryText;
  const cached = await Recipe.findOne({ cacheKey });
  if (cached) {
    console.log("Returning cached recipes");
    return res.json(cached.recipes);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a recipe generator. Always respond with valid JSON only, no markdown, no backticks, no explanation.",
          },
          {
            role: "user",
            content: `I have these ingredients: ${ingredients.join(", ")}. 
            ${dietaryText}
            Generate 15 recipes with a MIX of match levels — some recipes I can make with exactly what I have, some that need 1-2 more ingredients, and some that need several more ingredients but are inspired by what I have. Be creative and diverse with recipe types. For each recipe return a JSON array with objects containing:
            - name (string)
            - ingredients (array of all ingredients needed)
            - steps (array of detailed, descriptive cooking instructions. Each step must cover ONE single action only — never combine multiple actions into one step. Split them out. Each step should be 2-3 sentences long with specific temperatures, times, and visual cues like a professional recipe writer. For example "Preheat your grill" is one step. "Season the chicken" is a separate step. "Cook the chicken for 6-7 minutes until golden" is another separate step. Never write "do X then do Y" in a single step — that should always be two steps.)
            
            Return ONLY a JSON array, nothing else.`,
          },
        ],
        max_tokens: 3000,
      }),
    });

    const data = await response.json();
    const text = data.choices[0].message.content;
    const recipes = JSON.parse(text);

    await Recipe.create({ cacheKey, recipes });

    return res.json(recipes);
  } catch (error) {
    console.error("OpenAI error:", error.message);
    console.error("Full error:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate recipes", details: error.message });
  }
});

module.exports = router;
