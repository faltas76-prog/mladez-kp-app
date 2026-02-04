function render() {
  document.getElementById("name").innerText = plan[i].name;
  document.getElementById("desc").innerHTML = `
    ${plan[i].description}<br>
    <a href="${plan[i].link}" target="_blank">
      ▶ Ukázka cvičení
    </a>
  `;
}
