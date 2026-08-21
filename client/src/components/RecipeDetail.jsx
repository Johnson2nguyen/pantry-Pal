function RecipeDetail({ recipe, onBack, savedRecipes, onToggleFavorite }) {
  if (!recipe) return null;

  const isSaved = savedRecipes.some((r) => r.name === recipe.name);

  return (
    <div id="detail-view" className="visible">
      <button onClick={onBack}>← Back</button>
      <button onClick={() => onToggleFavorite(recipe)}>
        {isSaved ? "✕ Remove from Saved" : "♡ Save Recipe"}
      </button>

      <h2>{recipe.name}</h2>

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
