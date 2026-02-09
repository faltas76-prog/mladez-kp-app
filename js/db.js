let db;

/* =====================
   OTEVŘENÍ DB
===================== */
const request = indexedDB.open("TrainingDB", 1);

request.onupgradeneeded = e => {
  db = e.target.result;

  if (!db.objectStoreNames.contains("exercises")) {
    db.createObjectStore("exercises", { keyPath: "id" });
  }
};

request.onsuccess = e => {
  db = e.target.result;

  // ⬅️ IMPORT AŽ PO OTEVŘENÍ DB
  importFromTacticalPad();

  renderList();
};

request.onerror = () => {
  alert("❌ Nelze otevřít databázi");
};

/* =====================
   ULOŽENÍ Z FORMULÁŘE
===================== */
document.getElementById("saveBtn").onclick = () => {
  const titleInput = document.getElementById("title");
  const noteInput = document.getElementById("note");

  const title = titleInput.value.trim();
  const note = noteInput.value.trim();

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
    // ✅ RESET FORMULÁŘE
    titleInput.value = "";
    noteInput.value = "";

    renderList();
  };
};

/* =====================
   IMPORT Z TACTICAL PAD
===================== */
function importFromTacticalPad() {
  const raw = localStorage.getItem("OFFLINE_EXERCISE_IMPORT");
  if (!raw) return;

  try {
    const ex = JSON.parse(raw);

    const tx = db.transaction("exercises", "readwrite");
    const store = tx.objectStore("exercises");

    store.put({
      id: Date.now(),
      title: ex.title,
      note: "Importováno z TacticalPadu",
      drawing: {
        lines: ex.lines,
        objects: ex.objects
      },
      created: ex.created
    });

    tx.oncomplete = () => {
      // ✅ SMAZÁNÍ PŘENOSOVÝCH DAT
      localStorage.removeItem("OFFLINE_EXERCISE_IMPORT");

      // ✅ VYČIŠTĚNÍ FORMULÁŘE (PRO JISTOTU)
      document.getElementById("title").value = "";
      document.getElementById("note").value = "";

      renderList();

      alert("✅ Cvičení úspěšně importováno");
    };

  } catch (err) {
    console.error("Import error:", err);
  }
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

    const item = document.createElement("div");
    item.className = "item";
    item.textContent = cursor.value.title;

    item.onclick = () => {
      if (confirm("Smazat cvičení?")) {
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
