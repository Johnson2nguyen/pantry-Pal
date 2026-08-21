import { useState } from "react";

function RecipeList({
  ingredients,
  matchedRecipes,
  setMatchedRecipes,
  loading,
  setLoading,
  onSelectRecipe,
  selectedFilters,
}) {
  async function findRecipes() {
    if (ingredients.length === 0) return;

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/recipes/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredients, dietary: selectedFilters }),
        },
      );

      const parsed = await response.json();

      const withMatch = parsed.map((recipe) => {
        const have = recipe.ingredients.filter((ing) =>
          ingredients.some((userIng) =>
            ing.toLowerCase().includes(userIng.toLowerCase()),
          ),
        );
        const missing = recipe.ingredients.filter(
          (ing) =>
            !ingredients.some((userIng) =>
              ing.toLowerCase().includes(userIng.toLowerCase()),
            ),
        );
        const percent = Math.round(
          (have.length / recipe.ingredients.length) * 100,
        );
        return { ...recipe, have, missing, percent };
      });

      withMatch.sort((a, b) => b.percent - a.percent);
      setMatchedRecipes(withMatch);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={findRecipes}>Find Recipes</button>

      {loading && <p>Finding recipes...</p>}

      {matchedRecipes.map((recipe, index) => (
        <div
          className="recipe-list-item"
          key={index}
          onClick={() => onSelectRecipe(recipe)}
        >
          <h3>{recipe.name}</h3>
          <p>{recipe.percent}% match</p>
        </div>
      ))}
    </div>
  );
}

export default RecipeList;
