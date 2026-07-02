let ingredients = [];

const recipes = [
  {
    name: "Garlic Spinach Omelette",
    ingredients: ["eggs", "spinach", "garlic", "olive oil", "salt"],
    steps: [
      "Heat olive oil in a pan over medium heat.",
      "Sauté garlic for 1 minute until fragrant.",
      "Add spinach and cook until wilted.",
      "Beat eggs, pour into pan, and cook until set.",
      "Fold omelette in half and serve.",
    ],
  },
  {
    name: "Pasta Aglio e Olio",
    ingredients: ["pasta", "garlic", "olive oil", "parsley", "salt", "pepper"],
    steps: [
      "Boil pasta according to package instructions.",
      "Heat olive oil and sauté sliced garlic until golden.",
      "Toss drained pasta in the garlic oil.",
      "Season with salt and pepper, top with parsley.",
    ],
  },
  {
    name: "Tomato Egg Scramble",
    ingredients: ["eggs", "tomato", "salt", "olive oil"],
    steps: [
      "Dice tomatoes and set aside.",
      "Beat eggs with a pinch of salt.",
      "Heat oil in pan, cook tomatoes for 2 minutes.",
      "Add eggs and scramble everything together.",
    ],
  },
];

function addIngredient() {
  const input = document.getElementById("ingredient-input");
  const value = input.value.trim().toLowerCase();

  if (!value || ingredients.includes(value)) {
    input.value = "";
    return;
  }

  ingredients.push(value);
  input.value = "";
  renderTags();
}

function removeIngredient(item) {
  ingredients = ingredients.filter((i) => i !== item);
  renderTags();
}

function renderTags() {
  const container = document.getElementById("ingredient-tags");
  container.innerHTML = "";

  ingredients.forEach((item) => {
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.innerHTML = `${item} <span onclick="removeIngredient('${item}')">×</span>`;
    container.appendChild(tag);
  });
}

function findRecipes() {
  const results = document.getElementById("results");

  if (ingredients.length === 0) {
    results.innerHTML = "<p>Please add at least one ingredient.</p>";
    return;
  }

  const matched = recipes.filter((recipe) =>
    recipe.ingredients.some((ing) => ingredients.includes(ing)),
  );

  if (matched.length === 0) {
    results.innerHTML =
      "<p>No recipes found with those ingredients. Try adding more!</p>";
    return;
  }

  results.innerHTML = matched
    .map((recipe) => {
      const have = recipe.ingredients.filter((ing) =>
        ingredients.includes(ing),
      );
      const missing = recipe.ingredients.filter(
        (ing) => !ingredients.includes(ing),
      );

      return `
      <div class="recipe-card">
        <h2>${recipe.name}</h2>
        <h3>Ingredients You Have</h3>
        <ul>${have.map((i) => `<li>${i}</li>`).join("")}</ul>
        ${
          missing.length > 0
            ? `<h3>Missing Ingredients</h3>
          <ul>${missing.map((i) => `<li class="missing">${i}</li>`).join("")}</ul>`
            : ""
        }
        <h3>Steps</h3>
        <ol>${recipe.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
      </div>
    `;
    })
    .join("");
}

document.getElementById("ingredient-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addIngredient();
});
