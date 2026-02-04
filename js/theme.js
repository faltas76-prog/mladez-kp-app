function applyTheme() {
  const cat = localStorage.getItem("activeCategory");

  document.body.classList.remove(
    "theme-barca",
    "theme-real",
    "theme-arsenal"
  );

  if (["U7","U8","U9"].includes(cat)) {
    document.body.classList.add("theme-barca");
  }

  if (["U10","U11","U12"].includes(cat)) {
    document.body.classList.add("theme-real");
  }

  if (["U13","U14","U15"].includes(cat)) {
    document.body.classList.add("theme-arsenal");
  }
}
