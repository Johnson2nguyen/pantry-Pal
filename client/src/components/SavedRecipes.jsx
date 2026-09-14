import { useState } from "react";

function SavedRecipes({ savedRecipes, setSavedRecipes, onSelectRecipe }) {
  const [open, setOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState("recent");
  const [sortDirections, setSortDirections] = useState({
    az: "asc",
    recent: "desc",
  });

  function removeSaved(name) {
    const updated = savedRecipes.filter((r) => r.name !== name);
    setSavedRecipes(updated);
    localStorage.setItem("savedRecipes", JSON.stringify(updated));
  }

  function toggleSort(type) {
    const newDirections = {
      ...sortDirections,
      [type]: sortDirections[type] === "asc" ? "desc" : "asc",
    };
    setSortDirections(newDirections);
    setCurrentSort(type);
  }

  let sorted = [...savedRecipes];
  if (currentSort === "az") {
    sorted.sort((a, b) =>
      sortDirections.az === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name),
    );
  } else {
    sorted =
      sortDirections.recent === "asc"
        ? [...savedRecipes]
        : [...savedRecipes].reverse();
  }

  return (
    <div>
      <div id="saved-btn" onClick={() => setOpen(!open)}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 4C7.5 3 5 2.5 2 3V13C5 12.5 7.5 13 9 14C10.5 13 13 12.5 16 13V3C13 2.5 10.5 3 9 4Z"
            stroke="#e8a838"
            stroke-width="1.3"
            stroke-linejoin="round"
          />
          <path d="M9 4V14" stroke="#e8a838" stroke-width="1.3" />
        </svg>
        Saved Recipes{" "}
        {savedRecipes.length > 0 && (
          <span id="saved-count">{savedRecipes.length}</span>
        )}
      </div>

      {open && (
        <div id="saved-panel" className="visible">
          <div id="saved-panel-header">
            <span>Saved Recipes</span>
            <div id="saved-header-actions">
              <button
                id="sort-btn"
                onClick={() => setSortMenuOpen(!sortMenuOpen)}
              >
                ⇅ Sort
              </button>
              <button id="close-saved-btn" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
          </div>

          {sortMenuOpen && (
            <div id="sort-menu">
              <div
                className={`sort-option ${currentSort === "az" ? "active" : ""}`}
                onClick={() => toggleSort("az")}
              >
                <span>Alphabetical</span>
                <span>{sortDirections.az === "asc" ? "↑" : "↓"}</span>
              </div>
              <div
                className={`sort-option ${currentSort === "recent" ? "active" : ""}`}
                onClick={() => toggleSort("recent")}
              >
                <span>Most Recent</span>
                <span>{sortDirections.recent === "asc" ? "↑" : "↓"}</span>
              </div>
            </div>
          )}

          <div id="saved-list">
            {savedRecipes.length === 0 && (
              <div className="saved-empty">No saved recipes yet.</div>
            )}
            {sorted.map((recipe) => (
              <div
                className="saved-item"
                key={recipe.name}
                onClick={() => {
                  onSelectRecipe(recipe);
                  setOpen(false);
                }}
              >
                <div className="saved-item-info">
                  <span className="saved-item-name">{recipe.name}</span>
                  <span className="saved-item-date">
                    {recipe.savedAt
                      ? new Date(recipe.savedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>
                </div>
                <button
                  className="saved-item-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSaved(recipe.name);
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SavedRecipes;
