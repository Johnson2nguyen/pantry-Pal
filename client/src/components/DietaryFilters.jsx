function DietaryFilters({ selectedFilters, setSelectedFilters }) {
  const options = [
    "vegetarian",
    "vegan",
    "gluten-free",
    "dairy-free",
    "high-protein",
  ];

  function toggleFilter(option) {
    if (selectedFilters.includes(option)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== option));
    } else {
      setSelectedFilters([...selectedFilters, option]);
    }
  }

  return (
    <div id="dietary-filters">
      <span id="dietary-label">Dietary Preferences</span>
      <div id="dietary-options">
        {options.map((option) => (
          <label
            key={option}
            className={`dietary-option ${selectedFilters.includes(option) ? "checked" : ""}`}
          >
            <input
              type="checkbox"
              checked={selectedFilters.includes(option)}
              onChange={() => toggleFilter(option)}
            />
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </label>
        ))}
      </div>
    </div>
  );
}

export default DietaryFilters;
