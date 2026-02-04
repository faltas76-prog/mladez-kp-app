function selectCategory(cat) {
  localStorage.setItem("activeCategory", cat);
  window.location.href = "dashboard.html";
}
