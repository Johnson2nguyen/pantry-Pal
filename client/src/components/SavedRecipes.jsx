import { useState } from "react";

function SavedRecipes({ savedRecipes, setSavedRecipes, onSelectRecipe }) {
  const [open, setOpen] = useState(false);

  function removeSaved(name) {
    const updated = savedRecipes.filter((r) => r.name !== name);
    setSavedRecipes(updated);
    localStorage.setItem("savedRecipes", JSON.stringify(updated));
  }

  return (
    <div>
      <div id="saved-btn" onClick={() => setOpen(!open)}>
        📖 Saved Recipes{" "}
        <span id="saved-count">{savedRecipes.length || ""}</span>
      </div>

      {open && (
        <div id="saved-panel" className="visible">
          <div id="saved-panel-header">
            <span>📖 Saved Recipes</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div id="saved-list">
            {savedRecipes.length === 0 && (
              <div className="saved-empty">No saved recipes yet.</div>
            )}
            {savedRecipes.map((recipe) => (
              <div
                className="saved-item"
                key={recipe.name}
                onClick={() => {
                  onSelectRecipe(recipe);
                  setOpen(false);
                }}
              >
                <span className="saved-item-name">{recipe.name}</span>
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
