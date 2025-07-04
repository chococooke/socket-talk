import { state, setState } from "./state.js";

// document.addEventListener("DOMContentLoaded", () => {
const toggleButton = document.getElementById("theme-toggle");
const html = document.documentElement;

// Load saved theme from localStorage
  const savedTheme = localStorage.getItem("theme") || "light";
// const savedTheme = state.theme || "light";
html.setAttribute("data-theme", savedTheme);
updateToggleButton(savedTheme);

toggleButton.addEventListener("click", () => {
  const currentTheme = html.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
//   setState({ theme: newTheme });
  updateToggleButton(newTheme);
});

function updateToggleButton(theme) {
  toggleButton.innerHTML =
    theme === "light"
      ? '<i class="fas fa-moon"></i>'
      : '<i class="fas fa-sun"></i>';
}
