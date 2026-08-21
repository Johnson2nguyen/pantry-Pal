import { useState } from "react";
import Header from "./components/Header";
import IngredientInput from "./components/IngredientInput";
import RecipeList from "./components/RecipeList";
import RecipeDetail from "./components/RecipeDetail";
import SavedRecipes from "./components/SavedRecipes";
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

      {!selectedRecipe && (
        <>
          <IngredientInput
            ingredients={ingredients}
            setIngredients={setIngredients}
          />
          <RecipeList
            ingredients={ingredients}
            matchedRecipes={matchedRecipes}
            setMatchedRecipes={setMatchedRecipes}
            loading={loading}
            setLoading={setLoading}
            onSelectRecipe={setSelectedRecipe}
          />
        </>
      )}

      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
        savedRecipes={savedRecipes}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}

export default App;
