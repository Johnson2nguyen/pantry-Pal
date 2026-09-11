function DietaryFilters({ selectedFilters, setSelectedFilters }) {
  const options = [
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "gluten-free", label: "Gluten-Free" },
    { value: "dairy-free", label: "Dairy-Free" },
    { value: "high-protein", label: "High Protein" },
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
        {options.map(({ value, label }) => (
          <label
            key={value}
            className={`dietary-option ${selectedFilters.includes(value) ? "checked" : ""}`}
          >
            <input
              type="checkbox"
              checked={selectedFilters.includes(value)}
              onChange={() => toggleFilter(value)}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default DietaryFilters;
