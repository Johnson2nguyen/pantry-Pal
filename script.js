let ingredients = [];
let matchedRecipes = [];
let currentRecipeIndex = null;
let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
let panelCollapsed = false;
let savedPanelOpen = false;
let currentSort = "recent";
let sortMenuOpen = false;
let sortDirections = { az: "asc", recent: "desc" };

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
  const clearBtn = document.getElementById("clear-btn");
  container.innerHTML = "";

  if (ingredients.length === 0) {
    clearBtn.style.display = "none";
    return;
  }

  clearBtn.style.display = "block";
  ingredients.forEach((item) => {
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.innerHTML = `${item} <span onclick="removeIngredient('${item}')">×</span>`;
    container.appendChild(tag);
  });
}

function findRecipes() {
  const resultsDiv = document.getElementById("recipe-list");

  if (ingredients.length === 0) {
    resultsDiv.innerHTML =
      "<p style='color:rgba(255,255,255,0.4);padding:12px'>Please add at least one ingredient.</p>";
    return;
  }

  matchedRecipes = recipes
    .filter((recipe) =>
      recipe.ingredients.some((ing) => ingredients.includes(ing)),
    )
    .map((recipe) => {
      const have = recipe.ingredients.filter((ing) =>
        ingredients.includes(ing),
      );
      const percent = Math.round(
        (have.length / recipe.ingredients.length) * 100,
      );
      return {
        ...recipe,
        have,
        missing: recipe.ingredients.filter((ing) => !ingredients.includes(ing)),
        percent,
      };
    })
    .sort((a, b) => b.percent - a.percent);

  if (matchedRecipes.length === 0) {
    resultsDiv.innerHTML =
      "<p style='color:rgba(255,255,255,0.4);padding:12px'>No recipes found. Try adding more ingredients!</p>";
    return;
  }

  document.getElementById("left-panel").classList.add("visible");
  document.getElementById("left-panel").classList.add("has-recipes");

  resultsDiv.innerHTML = `
    <div class="left-panel-title">Recipes (${matchedRecipes.length})</div>
    ${matchedRecipes
      .map(
        (recipe, index) => `
      <div class="recipe-list-item" onclick="showRecipe(${index})" id="recipe-item-${index}">
        <h3>${recipe.name}</h3>
        <div class="match-bar-bg">
          <div class="match-bar-fill" style="width: ${recipe.percent}%"></div>
        </div>
        <span class="match-label">${recipe.percent}% match · ${recipe.have.length}/${recipe.ingredients.length} ingredients</span>
      </div>
    `,
      )
      .join("")}
  `;
}

function showRecipe(index) {
  currentRecipeIndex = index;
  const recipe = matchedRecipes[index];
  const alreadySaved = savedRecipes.some((r) => r.name === recipe.name);
  const favBtn = document.getElementById("fav-btn");
  favBtn.textContent = alreadySaved ? "✕ Remove from Saved" : "♡ Save Recipe";
  alreadySaved
    ? favBtn.classList.add("favorited")
    : favBtn.classList.remove("favorited");
  favBtn.onclick = toggleFavorite;

  const detailView = document.getElementById("detail-view");
  if (panelCollapsed) {
    detailView.style.marginRight = "auto";
    detailView.style.marginLeft = "auto";
  } else {
    detailView.style.marginRight = "100px";
    detailView.style.marginLeft = "0px";
  }

  document
    .querySelectorAll(".recipe-list-item")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById(`recipe-item-${index}`).classList.add("active");

  document.getElementById("search-view").style.display = "none";
  detailView.classList.add("visible");

  document.getElementById("recipe-detail").innerHTML = `
    <div class="recipe-detail">
      <div class="recipe-detail-title">${recipe.name}</div>
      <h3>Ingredients You Have</h3>
      <ul>${recipe.have.map((i) => `<li>${i}</li>`).join("")}</ul>
      ${
        recipe.missing.length > 0
          ? `<h3>Missing Ingredients</h3>
           <ul>${recipe.missing.map((i) => `<li class="missing">${i}</li>`).join("")}</ul>`
          : ""
      }
      <h3>Steps</h3>
      <ol>${recipe.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
    </div>
  `;
}

function showSavedRecipe(index) {
  const recipe = savedRecipes[index];
  if (savedPanelOpen) toggleSaved();

  const detailView = document.getElementById("detail-view");
  const leftPanelVisible = document
    .getElementById("left-panel")
    .classList.contains("visible");

  if (leftPanelVisible && !panelCollapsed) {
    detailView.style.marginRight = "100px";
    detailView.style.marginLeft = "0px";
  } else {
    detailView.style.marginRight = "auto";
    detailView.style.marginLeft = "auto";
  }

  document.getElementById("search-view").style.display = "none";
  detailView.classList.add("visible");

  const favBtn = document.getElementById("fav-btn");
  favBtn.textContent = "✕ Remove from Saved";
  favBtn.classList.add("favorited");
  currentRecipeIndex = null;

  favBtn.onclick = () => {
    removeSaved(recipe.name);
    goBack();
  };

  document.getElementById("recipe-detail").innerHTML = `
    <div class="recipe-detail">
      <div class="recipe-detail-title">${recipe.name}</div>
      ${
        recipe.have
          ? `<h3>Ingredients You Have</h3>
        <ul>${recipe.have.map((i) => `<li>${i}</li>`).join("")}</ul>`
          : ""
      }
      ${
        recipe.missing && recipe.missing.length > 0
          ? `<h3>Missing Ingredients</h3>
           <ul>${recipe.missing.map((i) => `<li class="missing">${i}</li>`).join("")}</ul>`
          : ""
      }
      <h3>Steps</h3>
      <ol>${recipe.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
    </div>
  `;
}

function goBack() {
  document.getElementById("search-view").style.display = "block";
  document.getElementById("detail-view").classList.remove("visible");
  document
    .querySelectorAll(".recipe-list-item")
    .forEach((el) => el.classList.remove("active"));
}

function togglePanel() {
  const panel = document.getElementById("left-panel");
  const recipeList = document.getElementById("recipe-list");
  const searchView = document.getElementById("search-view");
  const detailView = document.getElementById("detail-view");
  panelCollapsed = !panelCollapsed;

  if (panelCollapsed) {
    recipeList.style.display = "none";
    panel.style.width = "0";
    panel.style.overflow = "visible";
    panel.classList.add("collapsed");
    searchView.style.maxWidth = "700px";
    searchView.style.margin = "0 auto";
    detailView.style.marginRight = "auto";
    detailView.style.marginLeft = "auto";
  } else {
    panel.style.width = "260px";
    panel.classList.remove("collapsed");
    searchView.style.maxWidth = "";
    searchView.style.margin = "";
    detailView.style.marginRight = "100px";
    detailView.style.marginLeft = "0px";
    setTimeout(() => {
      recipeList.style.display = "block";
      panel.style.overflow = "visible";
    }, 500);
  }
}

function saveFavorites() {
  localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));
}

function toggleFavorite() {
  const recipe = matchedRecipes[currentRecipeIndex];
  const favBtn = document.getElementById("fav-btn");
  const alreadySaved = savedRecipes.some((r) => r.name === recipe.name);

  if (alreadySaved) {
    savedRecipes = savedRecipes.filter((r) => r.name !== recipe.name);
    favBtn.textContent = "♡ Save Recipe";
    favBtn.classList.remove("favorited");
  } else {
    savedRecipes.push({ ...recipe, savedAt: new Date().toISOString() });
    favBtn.textContent = "✕ Remove from Saved";
    favBtn.classList.add("favorited");
  }

  saveFavorites();
  updateSavedCount();
  renderSavedList();
}

function removeSaved(name) {
  savedRecipes = savedRecipes.filter((r) => r.name !== name);
  saveFavorites();
  renderSavedList();
  updateSavedCount();

  const favBtn = document.getElementById("fav-btn");
  if (favBtn && matchedRecipes[currentRecipeIndex]?.name === name) {
    favBtn.textContent = "♡ Save Recipe";
    favBtn.classList.remove("favorited");
  }
}

function renderSavedList() {
  const list = document.getElementById("saved-list");

  if (savedRecipes.length === 0) {
    list.innerHTML = "<div class='saved-empty'>No saved recipes yet.</div>";
    return;
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

  list.innerHTML = sorted
    .map(
      (recipe) => `
    <div class="saved-item" onclick="showSavedRecipe(${savedRecipes.indexOf(recipe)})">
      <div class="saved-item-info">
        <span class="saved-item-name">${recipe.name}</span>
        <span class="saved-item-date">${recipe.savedAt ? new Date(recipe.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</span>
      </div>
      <button class="saved-item-remove" onclick="event.stopPropagation(); removeSaved('${recipe.name}')">×</button>
    </div>
  `,
    )
    .join("");
}

function toggleSaved() {
  const panel = document.getElementById("saved-panel");
  savedPanelOpen = !savedPanelOpen;

  if (savedPanelOpen) {
    panel.classList.add("visible");
    renderSavedList();
  } else {
    panel.classList.remove("visible");
  }
}

function toggleSortMenu() {
  const menu = document.getElementById("sort-menu");
  sortMenuOpen = !sortMenuOpen;
  sortMenuOpen
    ? menu.classList.add("visible")
    : menu.classList.remove("visible");
}

function sortSaved(type) {
  sortDirections[type] = sortDirections[type] === "asc" ? "desc" : "asc";
  currentSort = type;

  document.getElementById("az-arrow").textContent =
    sortDirections.az === "asc" ? "↑" : "↓";
  document.getElementById("recent-arrow").textContent =
    sortDirections.recent === "asc" ? "↑" : "↓";

  document
    .querySelectorAll(".sort-option")
    .forEach((el) => el.classList.remove("active"));
  event.currentTarget.classList.add("active");

  renderSavedList();
}

document.getElementById("left-panel").addEventListener("click", function (e) {
  const rect = this.getBoundingClientRect();
  if (e.clientX > rect.right - 20) {
    togglePanel();
  }
});

document.getElementById("ingredient-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") addIngredient();
});

if (savedRecipes.length > 0) {
  document.getElementById("saved-btn").classList.add("visible");
}

function clearIngredients() {
  ingredients = [];
  renderTags();
  document.getElementById("ingredient-input").value = "";
}

function updateSavedCount() {
  const badge = document.getElementById("saved-count");
  if (savedRecipes.length > 0) {
    badge.textContent = savedRecipes.length;
    badge.style.display = "inline";
  } else {
    badge.style.display = "none";
  }
}

updateSavedCount();
