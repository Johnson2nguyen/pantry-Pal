let ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
let matchedRecipes = [];
let currentRecipeIndex = null;
let savedRecipes = JSON.parse(localStorage.getItem("savedRecipes")) || [];
let panelCollapsed = false;
let savedPanelOpen = false;
let currentSort = "recent";
let sortMenuOpen = false;
let sortDirections = { az: "asc", recent: "desc" };
let recipeSortMenuOpen = false;
let currentRecipeSort = "match";
let recipeSortDirections = { match: "desc", az: "asc" };

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

const imageCache = {};

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
  localStorage.setItem("ingredients", JSON.stringify(ingredients));
}

function removeIngredient(item) {
  ingredients = ingredients.filter((i) => i !== item);
  renderTags();
  localStorage.setItem("ingredients", JSON.stringify(ingredients));
}

function clearIngredients() {
  ingredients = [];
  localStorage.removeItem("ingredients");
  document.getElementById("ingredient-input").value = "";
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

function handleAutocomplete() {
  const input = document.getElementById("ingredient-input");
  const value = input.value.trim().toLowerCase();
  let dropdown = document.getElementById("autocomplete-dropdown");

  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.id = "autocomplete-dropdown";
    input.parentNode.appendChild(dropdown);
  }

  if (!value) {
    dropdown.innerHTML = "";
    dropdown.style.display = "none";
    return;
  }

  const matches = allIngredients
    .filter((ing) => ing.startsWith(value) && !ingredients.includes(ing))
    .slice(0, 5);

  if (matches.length === 0) {
    dropdown.style.display = "none";
    return;
  }

  dropdown.innerHTML = matches
    .map(
      (match) => `
    <div class="autocomplete-item" onclick="selectSuggestion('${match}')">
      ${match}
    </div>
  `,
    )
    .join("");

  dropdown.style.display = "block";
}

function selectSuggestion(value) {
  document.getElementById("ingredient-input").value = value;
  document.getElementById("autocomplete-dropdown").style.display = "none";
  addIngredient();
}

async function findRecipes() {
  const resultsDiv = document.getElementById("recipe-list");
  const loadingState = document.getElementById("loading-state");
  const findBtn = document.getElementById("find-btn");

  if (ingredients.length === 0) {
    resultsDiv.innerHTML =
      "<p style='color:rgba(255,255,255,0.4);padding:12px'>Please add at least one ingredient.</p>";
    return;
  }

  document.getElementById("left-panel").classList.add("visible");
  document.getElementById("left-panel").classList.add("has-recipes");
  document.getElementById("app").classList.add("results-active");

  resultsDiv.innerHTML = "";
  loadingState.classList.add("visible");
  findBtn.disabled = true;
  findBtn.textContent = "Finding...";
  findBtn.style.opacity = "0.6";
  findBtn.style.cursor = "not-allowed";
  document.getElementById("app").classList.add("results-active");

  try {
    const checkedFilters = [
      ...document.querySelectorAll("#dietary-options input:checked"),
    ].map((cb) => cb.value);
    const dietaryText =
      checkedFilters.length > 0
        ? `All recipes MUST be ${checkedFilters.join(", ")}.`
        : "";
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a recipe generator. Always respond with valid JSON only, no markdown, no backticks, no explanation.",
          },
          {
            role: "user",
            content: `I have these ingredients: ${ingredients.join(", ")}. 
                        ${dietaryText}
                        Generate 15 recipes with a MIX of match levels — some recipes I can make with exactly what I have, some that need 1-2 more ingredients, and some that need several more ingredients but are inspired by what I have. Be creative and diverse with recipe types. For each recipe return a JSON array with objects containing:
                        - name (string)
                        - ingredients (array of all ingredients needed)
                        - steps (array of detailed, descriptive cooking instructions. Each step must cover ONE single action only — never combine multiple actions into one step. Split them out. Each step should be 2-3 sentences long with specific temperatures, times, and visual cues like a professional recipe writer. For example "Preheat your grill" is one step. "Season the chicken" is a separate step. "Cook the chicken for 6-7 minutes until golden" is another separate step. Never write "do X then do Y" in a single step — that should always be two steps.)
                        
                        Return ONLY a JSON array, nothing else.`,
          },
        ],
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    const parsed = JSON.parse(text);

    matchedRecipes = parsed.map((recipe) => {
      const have = recipe.ingredients.filter((ing) =>
        ingredients.some(
          (userIng) =>
            ing.toLowerCase().includes(userIng.toLowerCase()) ||
            userIng.toLowerCase().includes(ing.toLowerCase()),
        ),
      );
      const missing = recipe.ingredients.filter(
        (ing) =>
          !ingredients.some(
            (userIng) =>
              ing.toLowerCase().includes(userIng.toLowerCase()) ||
              userIng.toLowerCase().includes(ing.toLowerCase()),
          ),
      );
      const percent = Math.round(
        (have.length / recipe.ingredients.length) * 100,
      );
      return { ...recipe, have, missing, percent };
    });

    matchedRecipes.sort((a, b) => b.percent - a.percent);
    loadingState.classList.remove("visible");

    if (matchedRecipes.length === 0) {
      resultsDiv.innerHTML =
        "<p style='color:rgba(255,255,255,0.4);padding:12px'>No recipes found. Try adding more ingredients!</p>";
      return;
    }

    resultsDiv.innerHTML = `
          <div class="left-panel-title">
            <span>Recipes (${matchedRecipes.length})</span>
            <button id="recipe-sort-btn" onclick="toggleRecipeSortMenu()">⇅ Sort</button>
          </div>
          <div id="recipe-sort-menu">
            <div class="recipe-sort-option" onclick="sortRecipes('az', event)">
              <span>Alphabetical</span><span id="recipe-az-arrow">↑</span>
            </div>
            <div class="recipe-sort-option active" onclick="sortRecipes('match', event)">
              <span>Best Match</span><span id="match-arrow">↓</span>
            </div>
          </div>
          <div id="recipe-filter-row">
            <button class="filter-btn active" onclick="filterRecipes('all', this)">All</button>
            <button class="filter-btn" onclick="filterRecipes('ready', this)">Ready to Cook</button>
            <button class="filter-btn" onclick="filterRecipes('close', this)">Need a Few</button>
          </div>
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
  } catch (error) {
    console.error("Error:", error);
    loadingState.classList.remove("visible");
    resultsDiv.innerHTML = `
      <div style='padding: 20px 16px'>
        <p style='color:#e05555;font-size:14px;margin-bottom:8px'>Something went wrong.</p>
        <p style='color:rgba(255,255,255,0.4);font-size:12px'>Check your internet connection and try again.</p>
      </div>
    `;
  } finally {
    findBtn.disabled = false;
    findBtn.textContent = "Find Recipes";
    findBtn.style.opacity = "1";
    findBtn.style.cursor = "pointer";
    document.getElementById("app").classList.remove("results-active");
  }
}

async function fetchRecipeImage(recipeName) {
  if (imageCache[recipeName]) {
    return imageCache[recipeName];
  }

  try {
    const tryFetch = async (query) => {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        },
      );

      if (response.status === 403 || response.status === 401) {
        console.warn("Unsplash rate limit hit or unauthorized");
        return null;
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results.reduce((prev, curr) => {
          const prevRatio = prev.width / prev.height;
          const currRatio = curr.width / curr.height;
          return Math.abs(currRatio - 1.6) < Math.abs(prevRatio - 1.6)
            ? curr
            : prev;
        });
      }
      return null;
    };

    let result = await tryFetch(recipeName + " food dish plate");
    if (!result) {
      const firstWord = recipeName.split(" ")[0];
      result = await tryFetch(firstWord + " food");
    }
    if (!result) {
      result = await tryFetch("food dish");
    }

    const url = result ? result.urls.regular : null;
    if (url) imageCache[recipeName] = url;
    return url;
  } catch (error) {
    console.error("Unsplash error:", error);
    return null;
  }
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
        <div id="recipe-image-container">
          <div class="recipe-image-placeholder">Loading image...</div>
        </div>
        <div class="recipe-detail-title">${recipe.name}</div>
        
        <div class="recipe-meta-row">
          ${
            recipe.have.length > 0
              ? `
          <div class="recipe-meta-card have-card">
            <div class="meta-card-title">✓ You Have</div>
            <div class="meta-card-items">
              ${recipe.have.map((i) => `<span class="meta-tag have-tag">${i}</span>`).join("")}
            </div>
          </div>`
              : ""
          }
          ${
            recipe.missing.length > 0
              ? `
          <div class="recipe-meta-card missing-card">
            <div class="meta-card-title">✕ You Need</div>
            <div class="meta-card-items">
              ${recipe.missing.map((i) => `<span class="meta-tag missing-tag">${i}</span>`).join("")}
            </div>
          </div>`
              : ""
          }
        </div>

        <div class="steps-title">Steps</div>
        <div id="steps-container">
          ${recipe.steps
            .map(
              (step, i) => `
            <div class="step-card" id="step-${i}">
              <div class="step-content">
                <div class="step-number">${i + 1}</div>
                <div class="step-text">${step}</div>
              </div>
              <div class="step-image-container" id="step-img-${i}">
                <div class="step-image-placeholder">Loading...</div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;

  fetchRecipeImage(recipe.name).then((imageUrl) => {
    const container = document.getElementById("recipe-image-container");
    if (imageUrl) {
      container.innerHTML = `<img src="${imageUrl}" alt="${recipe.name}" class="recipe-image" />`;
    } else {
      container.innerHTML = "";
    }
  });

  recipe.steps.forEach((step, i) => {
    const cookingVerbs = [
      "chop",
      "dice",
      "slice",
      "mince",
      "peel",
      "grate",
      "mix",
      "whisk",
      "beat",
      "stir",
      "fold",
      "pour",
      "add",
      "heat",
      "fry",
      "saute",
      "sauté",
      "boil",
      "simmer",
      "bake",
      "roast",
      "grill",
      "steam",
      "season",
      "marinate",
      "coat",
      "drain",
      "rinse",
      "cook",
      "brown",
      "caramelize",
      "blend",
      "mash",
      "knead",
      "roll",
      "spread",
      "layer",
      "garnish",
      "serve",
    ];

    const words = step.toLowerCase().split(" ");
    const verb =
      words.find((w) => cookingVerbs.includes(w.replace(/[^a-z]/g, ""))) || "";

    const nouns = words
      .filter(
        (w) =>
          w.length > 3 &&
          !cookingVerbs.includes(w) &&
          ![
            "the",
            "and",
            "with",
            "into",
            "until",
            "over",
            "from",
            "them",
            "then",
            "that",
            "this",
            "your",
            "each",
            "both",
          ].includes(w),
      )
      .slice(0, 2)
      .join(" ");

    const query = `${verb} ${nouns} food cooking`.trim();

    fetchRecipeImage(query).then((imageUrl) => {
      const container = document.getElementById(`step-img-${i}`);
      if (container) {
        if (imageUrl) {
          container.innerHTML = `<img src="${imageUrl}" alt="step ${i + 1}" class="step-image" />`;
        } else {
          container.innerHTML = "";
        }
      }
    });
  });

  fetchRecipeImage(recipe.name).then((imageUrl) => {
    const container = document.getElementById("recipe-image-container");
    if (imageUrl) {
      container.innerHTML = `<img src="${imageUrl}" alt="${recipe.name}" class="recipe-image" />`;
    } else {
      container.innerHTML = "";
    }
  });
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
        <div id="recipe-image-container">
          <div class="recipe-image-placeholder">Loading image...</div>
        </div>
        <div class="recipe-detail-title">${recipe.name}</div>
        
        <div class="recipe-meta-row">
          ${
            recipe.have.length > 0
              ? `
          <div class="recipe-meta-card have-card">
            <div class="meta-card-title">✓ You Have</div>
            <div class="meta-card-items">
              ${recipe.have.map((i) => `<span class="meta-tag have-tag">${i}</span>`).join("")}
            </div>
          </div>`
              : ""
          }
          ${
            recipe.missing.length > 0
              ? `
          <div class="recipe-meta-card missing-card">
            <div class="meta-card-title">✕ You Need</div>
            <div class="meta-card-items">
              ${recipe.missing.map((i) => `<span class="meta-tag missing-tag">${i}</span>`).join("")}
            </div>
          </div>`
              : ""
          }
        </div>

        <div class="steps-title">Steps</div>
        <div id="steps-container">
          ${recipe.steps
            .map(
              (step, i) => `
            <div class="step-card" id="step-${i}">
              <div class="step-content">
                <div class="step-number">${i + 1}</div>
                <div class="step-text">${step}</div>
              </div>
              <div class="step-image-container" id="step-img-${i}">
                <div class="step-image-placeholder">Loading...</div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;

  fetchRecipeImage(recipe.name).then((imageUrl) => {
    const container = document.getElementById("recipe-image-container");
    if (imageUrl) {
      container.innerHTML = `<img src="${imageUrl}" alt="${recipe.name}" class="recipe-image" />`;
    } else {
      container.innerHTML = "";
    }
  });

  recipe.steps.forEach((step, i) => {
    const keywords = step.split(" ").slice(0, 4).join(" ");
    fetchRecipeImage(keywords + " cooking").then((imageUrl) => {
      const container = document.getElementById(`step-img-${i}`);
      if (container) {
        if (imageUrl) {
          container.innerHTML = `<img src="${imageUrl}" alt="step ${i + 1}" class="step-image" />`;
        } else {
          container.innerHTML = "";
        }
      }
    });
  });

  fetchRecipeImage(recipe.name).then((imageUrl) => {
    const container = document.getElementById("recipe-image-container");
    if (imageUrl) {
      container.innerHTML = `<img src="${imageUrl}" alt="${recipe.name}" class="recipe-image" />`;
    } else {
      container.innerHTML = "";
    }
  });
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

function updateSavedCount() {
  const badge = document.getElementById("saved-count");
  if (savedRecipes.length > 0) {
    badge.textContent = savedRecipes.length;
    badge.style.display = "inline";
  } else {
    badge.style.display = "none";
  }
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

function toggleRecipeSortMenu() {
  const menu = document.getElementById("recipe-sort-menu");
  recipeSortMenuOpen = !recipeSortMenuOpen;
  recipeSortMenuOpen
    ? menu.classList.add("visible")
    : menu.classList.remove("visible");
}

function sortRecipes(type, e) {
  recipeSortDirections[type] =
    recipeSortDirections[type] === "asc" ? "desc" : "asc";
  currentRecipeSort = type;

  document.getElementById("match-arrow").textContent =
    recipeSortDirections.match === "desc" ? "↓" : "↑";
  document.getElementById("recipe-az-arrow").textContent =
    recipeSortDirections.az === "asc" ? "↑" : "↓";

  document
    .querySelectorAll(".recipe-sort-option")
    .forEach((el) => el.classList.remove("active"));
  e.currentTarget.classList.add("active");

  renderRecipeList();
}

function renderRecipeList() {
  const resultsDiv = document.getElementById("recipe-list");
  let sorted = [...matchedRecipes];

  if (currentRecipeSort === "az") {
    sorted.sort((a, b) =>
      recipeSortDirections.az === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name),
    );
  } else {
    sorted.sort((a, b) =>
      recipeSortDirections.match === "desc"
        ? b.percent - a.percent
        : a.percent - b.percent,
    );
  }

  const allItems = resultsDiv.querySelectorAll(".recipe-list-item");
  allItems.forEach((el) => el.remove());

  resultsDiv.insertAdjacentHTML(
    "beforeend",
    sorted
      .map(
        (recipe) => `
    <div class="recipe-list-item" onclick="showRecipe(${matchedRecipes.indexOf(recipe)})" id="recipe-item-${matchedRecipes.indexOf(recipe)}">
      <h3>${recipe.name}</h3>
      <div class="match-bar-bg">
        <div class="match-bar-fill" style="width: ${recipe.percent}%"></div>
      </div>
      <span class="match-label">${recipe.percent}% match · ${recipe.have.length}/${recipe.ingredients.length} ingredients</span>
    </div>
  `,
      )
      .join(""),
  );
}

document.getElementById("left-panel").addEventListener("click", function (e) {
  const rect = this.getBoundingClientRect();
  if (e.clientX > rect.right - 20) {
    togglePanel();
  }
});

document.getElementById("ingredient-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const dropdown = document.getElementById("autocomplete-dropdown");
    const firstSuggestion = dropdown
      ? dropdown.querySelector(".autocomplete-item")
      : null;
    const inputValue = document
      .getElementById("ingredient-input")
      .value.trim()
      .toLowerCase();

    if (firstSuggestion) {
      const suggestionValue = firstSuggestion.textContent.trim().toLowerCase();
      if (suggestionValue.startsWith(inputValue) && inputValue.length >= 2) {
        document.getElementById("ingredient-input").value =
          firstSuggestion.textContent.trim();
      }
    }

    if (dropdown) dropdown.style.display = "none";
    addIngredient();
  }
});

document.addEventListener("click", function (e) {
  const dropdown = document.getElementById("autocomplete-dropdown");
  const input = document.getElementById("ingredient-input");
  if (dropdown && e.target !== input) {
    dropdown.style.display = "none";
  }
});

function filterRecipes(type, btn) {
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");

  const items = document.querySelectorAll(".recipe-list-item");
  items.forEach((item, i) => {
    const recipe = matchedRecipes[i];
    if (type === "all") {
      item.style.display = "block";
    } else if (type === "ready") {
      item.style.display = recipe.percent === 100 ? "block" : "none";
    } else if (type === "close") {
      item.style.display =
        recipe.missing.length <= 3 && recipe.percent < 100 ? "block" : "none";
    }
  });
}

document.addEventListener("change", function (e) {
  if (e.target.type === "checkbox" && e.target.closest(".dietary-option")) {
    const label = e.target.closest(".dietary-option");
    if (e.target.checked) {
      label.classList.add("checked");
    } else {
      label.classList.remove("checked");
    }
  }
});

renderTags();
updateSavedCount();
