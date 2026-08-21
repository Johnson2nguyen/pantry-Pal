import { useState } from "react";

function IngredientInput({ ingredients, setIngredients }) {
  const [inputValue, setInputValue] = useState("");

  function addIngredient() {
    const value = inputValue.trim().toLowerCase();
    if (!value || ingredients.includes(value)) {
      setInputValue("");
      return;
    }
    setIngredients([...ingredients, value]);
    setInputValue("");
  }

  function removeIngredient(item) {
    setIngredients(ingredients.filter((i) => i !== item));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      addIngredient();
    }
  }

  return (
    <div className="input-section">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g. eggs, spinach, garlic"
      />
      <button onClick={addIngredient} id="add-btn">
        Add
      </button>

      <div id="tags-row">
        {ingredients.length > 0 && (
          <button id="clear-btn" onClick={() => setIngredients([])}>
            ✕
          </button>
        )}
        <div id="ingredient-tags">
          {ingredients.map((item) => (
            <div className="tag" key={item}>
              {item} <span onClick={() => removeIngredient(item)}>×</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IngredientInput;
