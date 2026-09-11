import { useState, useEffect } from "react";

const cookingVerbs = [
  "chop",
  "dice",
  "slice",
  "mince",
  "peel",
  "grate",
  "mix",
  "whisk",
  "beat",
  "stir",
  "fold",
  "pour",
  "add",
  "heat",
  "fry",
  "saute",
  "sauté",
  "boil",
  "simmer",
  "bake",
  "roast",
  "grill",
  "steam",
  "season",
  "marinate",
  "coat",
  "drain",
  "rinse",
  "cook",
  "brown",
  "caramelize",
  "blend",
  "mash",
  "knead",
  "roll",
  "spread",
  "layer",
  "garnish",
  "serve",
];

const stopWords = [
  "the",
  "and",
  "with",
  "into",
  "until",
  "over",
  "from",
  "them",
  "then",
  "that",
  "this",
  "your",
  "each",
  "both",
];

const imageCache = {};

async function fetchRecipeImage(query) {
  if (imageCache[query]) return imageCache[query];

  try {
    const tryFetch = async (q) => {
      const response = await fetch(
        `http://localhost:5000/api/recipes/image?query=${encodeURIComponent(q)}`,
      );
      const data = await response.json();
      return data.url || null;
    };

    let url = await tryFetch(query);
    if (url) imageCache[query] = url;
    return url;
  } catch (error) {
    console.error("Image fetch error:", error);
    return null;
  }
}

function RecipeDetail({
  recipe,
  onBack,
  savedRecipes,
  onToggleFavorite,
  panelVisible,
}) {
  const [imageUrl, setImageUrl] = useState(null);
  const [stepImages, setStepImages] = useState({});

  useEffect(() => {
    if (!recipe) return;

    setImageUrl(null);
    setStepImages({});

    fetchRecipeImage(recipe.name + " food dish plate").then((url) => {
      setImageUrl(url);
    });

    recipe.steps.forEach((step, i) => {
      const words = step.toLowerCase().split(" ");
      const verb =
        words.find((w) => cookingVerbs.includes(w.replace(/[^a-z]/g, ""))) ||
        "";
      const nouns = words
        .filter(
          (w) =>
            w.length > 3 && !cookingVerbs.includes(w) && !stopWords.includes(w),
        )
        .slice(0, 2)
        .join(" ");
      const query = `${verb} ${nouns} food cooking`.trim();

      fetchRecipeImage(query).then((url) => {
        setStepImages((prev) => ({ ...prev, [i]: url }));
      });
    });
  }, [recipe]);

  if (!recipe) return null;

  const isSaved = savedRecipes.some((r) => r.name === recipe.name);

  return (
    <div
      id="detail-view"
      className="visible"
      style={
        panelVisible
          ? { marginRight: "100px", marginLeft: "0px" }
          : { marginRight: "auto", marginLeft: "auto" }
      }
    >
      <div id="detail-top-bar">
        <button id="back-btn" onClick={onBack}>
          ← Back
        </button>
        <button
          id="fav-btn"
          className={isSaved ? "favorited" : ""}
          onClick={() => onToggleFavorite(recipe)}
        >
          {isSaved ? "✕ Remove from Saved" : "♡ Save Recipe"}
        </button>
      </div>

      <div className="recipe-detail">
        <div id="recipe-image-container">
          {imageUrl ? (
            <img src={imageUrl} alt={recipe.name} className="recipe-image" />
          ) : (
            <div className="recipe-image-placeholder">Loading image...</div>
          )}
        </div>

        <div className="recipe-detail-title">{recipe.name}</div>

        <div className="recipe-meta-row">
          {recipe.have.length > 0 && (
            <div className="recipe-meta-card have-card">
              <div className="meta-card-title">✓ You Have</div>
              <div className="meta-card-items">
                {recipe.have.map((item) => (
                  <span className="meta-tag have-tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
          {recipe.missing.length > 0 && (
            <div className="recipe-meta-card missing-card">
              <div className="meta-card-title">✕ You Need</div>
              <div className="meta-card-items">
                {recipe.missing.map((item) => (
                  <span className="meta-tag missing-tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="steps-title">Steps</div>
        <div id="steps-container">
          {recipe.steps.map((step, i) => (
            <div className="step-card" key={i}>
              <div className="step-content">
                <div className="step-number">{i + 1}</div>
                <div className="step-text">{step}</div>
              </div>
              <div className="step-image-container">
                {stepImages[i] ? (
                  <img
                    src={stepImages[i]}
                    alt={`step ${i + 1}`}
                    className="step-image"
                  />
                ) : (
                  <div className="step-image-placeholder">Loading...</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;
