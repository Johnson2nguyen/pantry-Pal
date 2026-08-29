import { useState, useEffect } from "react";

function RecipeDetail({ recipe, onBack, savedRecipes, onToggleFavorite }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!recipe) return;

    setImageUrl(null);

    async function fetchImage() {
      try {
        const response = await fetch(
          `http://localhost:5000/api/recipes/image?query=${encodeURIComponent(
            recipe.name + " food dish plate",
          )}`,
        );
        const data = await response.json();
        setImageUrl(data.url);
      } catch (error) {
        console.error("Image fetch error:", error);
      }
    }

    fetchImage();
  }, [recipe]);

  if (!recipe) return null;

  const isSaved = savedRecipes.some((r) => r.name === recipe.name);

  return (
    <div id="detail-view" className="visible">
      <button onClick={onBack}>← Back</button>
      <button onClick={() => onToggleFavorite(recipe)}>
        {isSaved ? "✕ Remove from Saved" : "♡ Save Recipe"}
      </button>

      {imageUrl ? (
        <img src={imageUrl} alt={recipe.name} className="recipe-image" />
      ) : (
        <div className="recipe-image-placeholder">Loading image...</div>
      )}

      <h2 className="recipe-detail-title">{recipe.name}</h2>

      <h3>Ingredients You Have</h3>
      <ul>
        {recipe.have.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h3>Missing Ingredients</h3>
      <ul>
        {recipe.missing.map((item) => (
          <li key={item} className="missing">
            {item}
          </li>
        ))}
      </ul>

      <h3>Steps</h3>
      <ol>
        {recipe.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

export default RecipeDetail;
