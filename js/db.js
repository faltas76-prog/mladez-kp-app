let db;

/* =====================
   OTEVŘENÍ DB
===================== */
const request = indexedDB.open("TrainingDB", 1);

request.onupgradeneeded = e => {
  db = e.target.result;
  db.createObjectStore("exercises", { keyPath: "id" });
};

request.onsuccess = e => {
  db = e.target.result;
  renderList();
};

request.onerror = () => {
  alert("Nelze otevřít databázi");
};

/* =====================
   ULOŽENÍ
===================== */
document.getElementById("saveBtn").onclick = () => {
  const title = document.getElementById("title").value.trim();
  const note = document.getElementById("note").value.trim();

  if (!title) {
    alert("Zadej název cvičení");
    return;
  }

  const tx = db.transaction("exercises", "readwrite");
  const store = tx.objectStore("exercises");

  store.put({
    id: Date.now(),
    title,
    note,
    created: new Date().toISOString()
  });

  tx.oncomplete = () => {
    document.getElementById("title").value = "";
    document.getElementById("note").value = "";
    renderList();
  };
};

/* =====================
   VÝPIS
===================== */
function renderList() {
  const list = document.getElementById("list");
  list.innerHTML = "";

  const tx = db.transaction("exercises", "readonly");
  const store = tx.objectStore("exercises");

  store.openCursor().onsuccess = e => {
    const cursor = e.target.result;
    if (!cursor) return;

    const item = document.createElement("div");
    item.className = "item";
    item.textContent = cursor.value.title;

    item.onclick = () => {
      if (confirm("Smazat záznam?")) {
        deleteItem(cursor.value.id);
      }
    };

    list.appendChild(item);
    cursor.continue();
  };
}

/* =====================
   SMAZÁNÍ
===================== */
function deleteItem(id) {
  const tx = db.transaction("exercises", "readwrite");
  const store = tx.objectStore("exercises");
  store.delete(id);
  tx.oncomplete = renderList;
}
