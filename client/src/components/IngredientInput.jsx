import { useState } from "react";

const allIngredients = [
  "eggs",
  "spinach",
  "garlic",
  "olive oil",
  "salt",
  "pepper",
  "pasta",
  "parsley",
  "tomato",
  "onion",
  "butter",
  "milk",
  "cheese",
  "chicken",
  "beef",
  "pork",
  "bacon",
  "shrimp",
  "salmon",
  "tuna",
  "bread",
  "flour",
  "sugar",
  "honey",
  "lemon",
  "lime",
  "orange",
  "apple",
  "banana",
  "avocado",
  "potato",
  "sweet potato",
  "carrot",
  "celery",
  "broccoli",
  "cauliflower",
  "zucchini",
  "mushroom",
  "bell pepper",
  "jalapeño",
  "cucumber",
  "lettuce",
  "kale",
  "cabbage",
  "corn",
  "peas",
  "green beans",
  "asparagus",
  "beets",
  "radish",
  "turnip",
  "ginger",
  "turmeric",
  "cumin",
  "paprika",
  "oregano",
  "basil",
  "thyme",
  "rosemary",
  "bay leaf",
  "cinnamon",
  "nutmeg",
  "cloves",
  "vanilla",
  "cocoa powder",
  "baking powder",
  "baking soda",
  "yeast",
  "rice",
  "quinoa",
  "oats",
  "breadcrumbs",
  "panko",
  "cornstarch",
  "vegetable oil",
  "coconut oil",
  "sesame oil",
  "soy sauce",
  "fish sauce",
  "worcestershire sauce",
  "hot sauce",
  "ketchup",
  "mustard",
  "mayonnaise",
  "vinegar",
  "balsamic vinegar",
  "white wine",
  "red wine",
  "beer",
  "chicken broth",
  "beef broth",
  "vegetable broth",
  "coconut milk",
  "heavy cream",
  "sour cream",
  "cream cheese",
  "parmesan",
  "mozzarella",
  "cheddar",
  "feta",
  "tofu",
  "chickpeas",
  "black beans",
  "kidney beans",
  "lentils",
  "almonds",
  "walnuts",
  "cashews",
  "peanuts",
  "peanut butter",
  "tahini",
  "hummus",
  "tortillas",
  "pita bread",
  "noodles",
  "couscous",
  "strawberry",
  "blueberry",
  "raspberry",
  "mango",
  "pineapple",
  "peach",
  "grapes",
  "watermelon",
  "cantaloupe",
  "pomegranate",
  "kiwi",
  "papaya",
];

function IngredientInput({ ingredients, setIngredients }) {
  const [inputValue, setInputValue] = useState("");

  const suggestions =
    inputValue.trim().length > 0
      ? allIngredients
          .filter(
            (ing) =>
              ing.startsWith(inputValue.trim().toLowerCase()) &&
              !ingredients.includes(ing),
          )
          .slice(0, 5)
      : [];

  function addIngredient(valueOverride) {
    const value = (valueOverride || inputValue).trim().toLowerCase();
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
      if (suggestions.length > 0) {
        addIngredient(suggestions[0]);
      } else {
        addIngredient();
      }
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
      <button onClick={() => addIngredient()} id="add-btn">
        Add
      </button>

      {suggestions.length > 0 && (
        <div id="autocomplete-dropdown" style={{ display: "block" }}>
          {suggestions.map((match) => (
            <div
              className="autocomplete-item"
              key={match}
              onClick={() => addIngredient(match)}
            >
              {match}
            </div>
          ))}
        </div>
      )}

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
