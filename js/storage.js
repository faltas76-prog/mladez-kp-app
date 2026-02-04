const KEY = "clubData";

function loadData() {
  return JSON.parse(localStorage.getItem(KEY)) || {};
}

function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function getCategory(cat) {
  const data = loadData();
  if (!data[cat]) {
    data[cat] = { players: [], notes: [], attendance: [] };
    saveData(data);
  }
  return data[cat];
}

function saveCategory(cat, content) {
  const data = loadData();
  data[cat] = content;
  saveData(data);
}
