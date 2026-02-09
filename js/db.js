console.log("OFFLINE DB SCRIPT LOADED");

let db;

/* =====================
   OTEVŘENÍ DB
===================== */
const openReq = indexedDB.open("TrainingDB", 1);

openReq.onupgradeneeded = e => {
  db = e.target.result;
  if (!db.objectStoreNames.contains("exercises")) {
    db.createObjectStore("exercises", { keyPath: "id" });
  }
};

openReq.onsuccess = e => {
  db = e.target.result;
  console.log("DB OPENED");

  // 👉 AŽ TADY připojuj tlačítka
  initUI();
  renderList();
};

openReq.onerror = () => {
  alert("❌ IndexedDB nelze otevřít");
};

/* =====================
   UI – AŽ PO DB
===================== */
function initUI() {
  document.getElementById("saveBtn").onclick = saveExercise;
}

/* =====================
   ULOŽENÍ
===================== */
function saveExercise() {
  console.log("SAVE CLICKED");

  const titleInput = document.getElementById("titleInput");
  const noteInput = document.getElementById("noteInput");

  const title = titleInput.value.trim();
  const note = noteInput.value.trim();

  if (!title) {
    alert("Zadej název");
    return;
  }

  const tx = db.transaction("exercises", "readwrite");
  const store = tx.objectStore("exercises");

  store.add({
    id: Date.now(),
    title,
    note,
    created: new Date().toISOString()
  });

  tx.oncomplete = () => {
    console.log("SAVED");

    titleInput.value = "";
    noteInput.value = "";

    renderList();
  };

  tx.onerror = () => {
    alert("❌ Uložení selhalo");
  };
}

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

    const div = document.createElement("div");
    div.className = "item";
    div.textContent = cursor.value.title;

    div.onclick = () => {
      if (confirm("Smazat cvičení?")) {
        deleteExercise(cursor.value.id);
      }
    };

    list.appendChild(div);
    cursor.continue();
  };
}

/* =====================
   SMAZÁNÍ
===================== */
function deleteExercise(id) {
  console.log("DELETE", id);

  const tx = db.transaction("exercises", "readwrite");
  const store = tx.objectStore("exercises");

  store.delete(id);
  tx.oncomplete = renderList;
}
