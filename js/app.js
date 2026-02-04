function selectCategory(cat) {
  localStorage.setItem("category", cat);
  window.location.href = "dashboard.html";
}
