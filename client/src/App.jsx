import { useState } from "react";
import Header from "./components/Header";
import IngredientInput from "./components/IngredientInput";
import RecipeList from "./components/RecipeList";
import RecipeDetail from "./components/RecipeDetail";
import SavedRecipes from "./components/SavedRecipes";
import DietaryFilters from "./components/DietaryFilters";
import "./App.css";

function App() {
  const [ingredients, setIngredients] = useState(
    JSON.parse(localStorage.getItem("ingredients")) || [],
  );
  const [matchedRecipes, setMatchedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [savedRecipes, setSavedRecipes] = useState(
    JSON.parse(localStorage.getItem("savedRecipes")) || [],
  );
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  const [invalidIngredients, setInvalidIngredients] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  function togglePanel() {
    setPanelCollapsed(!panelCollapsed);
  }

  async function findRecipes() {
    if (ingredients.length === 0) return;

    setLoading(true);
    setInvalidIngredients(null);
    setErrorMessage(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/recipes/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredients, dietary: selectedFilters }),
        },
      );

      if (response.status === 429) {
        setErrorMessage(
          "You're making requests too quickly. Please wait a bit and try again.",
        );
        setLoading(false);
        return;
      }

      const parsed = await response.json();

      if (parsed.error === "invalid_ingredients") {
        setInvalidIngredients(parsed.invalid);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

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
      setErrorMessage(
        "Something went wrong. Check your internet connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleFavorite(recipe) {
    const alreadySaved = savedRecipes.some((r) => r.name === recipe.name);
    let updated;
    if (alreadySaved) {
      updated = savedRecipes.filter((r) => r.name !== recipe.name);
    } else {
      updated = [
        ...savedRecipes,
        { ...recipe, savedAt: new Date().toISOString() },
      ];
    }
    setSavedRecipes(updated);
    localStorage.setItem("savedRecipes", JSON.stringify(updated));
  }

  return (
    <div>
      <Header />
      <SavedRecipes
        savedRecipes={savedRecipes}
        setSavedRecipes={setSavedRecipes}
        onSelectRecipe={setSelectedRecipe}
      />

      <div id="app">
        <div
          id="left-panel"
          className={
            (matchedRecipes.length > 0 ||
            loading ||
            invalidIngredients ||
            errorMessage
              ? "visible has-recipes"
              : "") + (panelCollapsed ? " collapsed" : "")
          }
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            if (e.clientX > rect.right - 20) {
              togglePanel();
            }
          }}
        >
          <RecipeList
            matchedRecipes={matchedRecipes}
            loading={loading}
            onSelectRecipe={setSelectedRecipe}
            invalidIngredients={invalidIngredients}
            errorMessage={errorMessage}
          />
        </div>

        <div id="right-panel">
          {!selectedRecipe && (
            <div id="search-view">
              <IngredientInput
                ingredients={ingredients}
                setIngredients={setIngredients}
              />
              <DietaryFilters
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
              />
              <button
                id="find-btn"
                onClick={findRecipes}
                disabled={loading}
                style={loading ? { opacity: 0.6, cursor: "not-allowed" } : {}}
              >
                {loading ? "Finding..." : "Find Recipes"}
              </button>
            </div>
          )}

          <RecipeDetail
            recipe={selectedRecipe}
            onBack={() => setSelectedRecipe(null)}
            savedRecipes={savedRecipes}
            onToggleFavorite={toggleFavorite}
            panelVisible={matchedRecipes.length > 0 && !panelCollapsed}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
