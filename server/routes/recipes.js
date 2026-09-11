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
    const validationResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
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
                "You are a strict food ingredient validator. Respond with ONLY valid JSON, nothing else.",
            },
            {
              role: "user",
              content: `Check this list of items: ${ingredients.join(", ")}.
            
            For each item, determine if it is a real, recognizable food or cooking ingredient (including uncommon but real ones like cellulose, gelatin, gochujang, xanthan gum, nutritional yeast, MSG, agar agar, etc).
            
            Respond with ONLY this JSON format:
            {"valid": true} if ALL items are real ingredients
            {"valid": false, "invalid": ["item1", "item2"]} if any items are gibberish, random characters, or not real food ingredients
            
            Return ONLY the JSON, nothing else.`,
            },
          ],
          max_tokens: 200,
        }),
      },
    );

    const validationData = await validationResponse.json();
    const validationText = validationData.choices[0].message.content;
    const validationResult = JSON.parse(validationText);

    if (!validationResult.valid) {
      return res.status(400).json({
        error: "invalid_ingredients",
        invalid: validationResult.invalid,
      });
    }

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

            Generate 15 recipes with a MIX of match levels — some recipes I can make with exactly what I have, some that need 1-2 more ingredients, and some that need several more ingredients but are inspired by what I have. Be creative and diverse with recipe types across different cuisines (not just one cultural style every time).

            NAMING RULES:
            - If the ingredients clearly and specifically match a well-known traditional or cultural dish from ANY cuisine (Vietnamese, Thai, Italian, Mexican, Indian, Japanese, Korean, French, etc.), use that dish's accurate, commonly recognized name instead of a generic descriptive name. Examples: "Pho" not "Beef Noodle Soup", "Pad Thai" not "Thai Noodle Stir-Fry", "Carbonara" not "Bacon Egg Pasta", "Bibimbap" not "Korean Rice Bowl".
            - Only use a traditional dish name if the ingredients genuinely and closely match that dish's real recipe — do not force a cultural name onto a random ingredient combination that doesn't actually resemble that dish.
            - If no traditional dish matches, use a clear, appetizing, descriptive name instead.

            INGREDIENT RULES:
            - Every recipe must prominently use at least one of my listed ingredients.
            - Do not silently substitute or ignore an ingredient I listed — if it's unusual, build a recipe around it rather than skipping it.

            STEP RULES:
            - Steps must be an array of individual, single-action instructions. Never combine two actions into one step (e.g. "Preheat the oven and season the chicken" must be two separate steps).
            - Each step should be 2-3 sentences with specific temperatures, times, and visual/sensory cues like a professional recipe writer would use.

            For each recipe return a JSON array with objects containing:
            - name (string)
            - ingredients (array of all ingredients needed)
            - steps (array of detailed, single-action cooking instructions as described above)

            Return ONLY a valid JSON array, nothing else — no markdown, no commentary, no code fences.`,
          },
        ],
        max_tokens: 5000,
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

router.get("/image", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "No query provided" });
  }

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      },
    );

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const best = data.results.reduce((prev, curr) => {
        const prevRatio = prev.width / prev.height;
        const currRatio = curr.width / curr.height;
        return Math.abs(currRatio - 1.6) < Math.abs(prevRatio - 1.6)
          ? curr
          : prev;
      });
      return res.json({ url: best.urls.regular });
    }

    return res.json({ url: null });
  } catch (error) {
    console.error("Unsplash error:", error);
    return res.status(500).json({ error: "Failed to fetch image" });
  }
});

module.exports = router;
