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
  const [sortBy, setSortBy] = useState("match");
  const [filterBy, setFilterBy] = useState("all");

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

      setMatchedRecipes(withMatch);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  let displayedRecipes = [...matchedRecipes];

  if (sortBy === "az") {
    displayedRecipes.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    displayedRecipes.sort((a, b) => b.percent - a.percent);
  }

  if (filterBy === "ready") {
    displayedRecipes = displayedRecipes.filter((r) => r.percent === 100);
  } else if (filterBy === "close") {
    displayedRecipes = displayedRecipes.filter(
      (r) => r.missing.length <= 3 && r.percent < 100,
    );
  }

  return (
    <div>
      <button onClick={findRecipes}>Find Recipes</button>

      {loading && <p>Finding recipes...</p>}

      {matchedRecipes.length > 0 && (
        <div id="recipe-filter-row">
          <button
            className={`filter-btn ${filterBy === "all" ? "active" : ""}`}
            onClick={() => setFilterBy("all")}
          >
            All
          </button>
          <button
            className={`filter-btn ${filterBy === "ready" ? "active" : ""}`}
            onClick={() => setFilterBy("ready")}
          >
            Ready to Cook
          </button>
          <button
            className={`filter-btn ${filterBy === "close" ? "active" : ""}`}
            onClick={() => setFilterBy("close")}
          >
            Need a Few
          </button>
        </div>
      )}

      {matchedRecipes.length > 0 && (
        <div id="recipe-sort-menu" style={{ display: "block" }}>
          <div
            className={`recipe-sort-option ${sortBy === "az" ? "active" : ""}`}
            onClick={() => setSortBy("az")}
          >
            <span>Alphabetical</span>
          </div>
          <div
            className={`recipe-sort-option ${sortBy === "match" ? "active" : ""}`}
            onClick={() => setSortBy("match")}
          >
            <span>Best Match</span>
          </div>
        </div>
      )}

      {displayedRecipes.map((recipe, index) => (
        <div
          className="recipe-list-item"
          key={recipe.name}
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
