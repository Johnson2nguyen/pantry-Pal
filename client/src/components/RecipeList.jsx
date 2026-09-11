import { useState } from "react";

function RecipeList({
  matchedRecipes,
  loading,
  onSelectRecipe,
  invalidIngredients,
  errorMessage,
}) {
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState("match");
  const [sortDirections, setSortDirections] = useState({
    match: "desc",
    az: "asc",
  });
  const [filterBy, setFilterBy] = useState("all");

  function toggleSort(type) {
    const newDirections = {
      ...sortDirections,
      [type]: sortDirections[type] === "asc" ? "desc" : "asc",
    };
    setSortDirections(newDirections);
    setSortBy(type);
  }

  let displayedRecipes = [...matchedRecipes];

  if (sortBy === "az") {
    displayedRecipes.sort((a, b) =>
      sortDirections.az === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name),
    );
  } else {
    displayedRecipes.sort((a, b) =>
      sortDirections.match === "desc"
        ? b.percent - a.percent
        : a.percent - b.percent,
    );
  }

  if (filterBy === "ready") {
    displayedRecipes = displayedRecipes.filter((r) => r.percent === 100);
  } else if (filterBy === "close") {
    displayedRecipes = displayedRecipes.filter(
      (r) => r.missing.length <= 3 && r.percent < 100,
    );
  }

  return (
    <div id="recipe-list">
      {loading && (
        <div id="loading-state">
          <div className="spinner"></div>
          <span className="loading-text">Finding recipes...</span>
        </div>
      )}
      {invalidIngredients && (
        <div style={{ padding: "20px 16px" }}>
          <p
            style={{ color: "#e05555", fontSize: "14px", marginBottom: "8px" }}
          >
            Some ingredients weren't recognized:
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
            {invalidIngredients.join(", ")}
          </p>
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: "20px 16px" }}>
          <p style={{ color: "#e05555", fontSize: "14px" }}>{errorMessage}</p>
        </div>
      )}

      {matchedRecipes.length > 0 && (
        <>
          <div className="left-panel-title">
            <span>Recipes ({matchedRecipes.length})</span>
            <button
              id="recipe-sort-btn"
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
            >
              ⇅ Sort
            </button>
          </div>

          {sortMenuOpen && (
            <div id="recipe-sort-menu">
              <div
                className={`recipe-sort-option ${sortBy === "az" ? "active" : ""}`}
                onClick={() => toggleSort("az")}
              >
                <span>Alphabetical</span>
                <span>{sortDirections.az === "asc" ? "↑" : "↓"}</span>
              </div>
              <div
                className={`recipe-sort-option ${sortBy === "match" ? "active" : ""}`}
                onClick={() => toggleSort("match")}
              >
                <span>Best Match</span>
                <span>{sortDirections.match === "desc" ? "↓" : "↑"}</span>
              </div>
            </div>
          )}

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

          {displayedRecipes.map((recipe, index) => (
            <div
              className="recipe-list-item"
              key={recipe.name}
              onClick={() => onSelectRecipe(recipe)}
            >
              <h3>{recipe.name}</h3>
              <div className="match-bar-bg">
                <div
                  className="match-bar-fill"
                  style={{ width: `${recipe.percent}%` }}
                ></div>
              </div>
              <span className="match-label">
                {recipe.percent}% match · {recipe.have.length}/
                {recipe.ingredients.length} ingredients
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default RecipeList;
