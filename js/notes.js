console.log("notes.js loaded");

const NOTES_KEY = "coach_notes_v1";

/* ===== DB ===== */
function loadNotes() {
  return JSON.parse(localStorage.getItem(NOTES_KEY)) || [];
}

function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

/* ===== RENDER ===== */
function renderNotes() {
  const box = document.getElementById("notesList");
  const notes = loadNotes();

  box.innerHTML = "";

  // 🔽 nejnovější nahoře
  notes
    .slice()
    .reverse()
    .forEach(note => {
      const div = document.createElement("div");
      div.className = "note";

      div.innerHTML = `
        <strong>${note.title}</strong><br>
        <small>${new Date(note.createdAt).toLocaleString()}</small>
        <p>${note.text}</p>
        <button data-id="${note.id}">❌ Smazat</button>
      `;

      div.querySelector("button").onclick = () => {
        const updated = loadNotes().filter(n => n.id !== note.id);
        saveNotes(updated);
        renderNotes();
      };

      box.appendChild(div);
    });
}

/* ===== INIT ===== */
document.getElementById("saveNoteBtn").onclick = () => {
  const titleInput = document.getElementById("noteTitle");
  const textInput = document.getElementById("noteText");

  const title = titleInput.value.trim();
  const text = textInput.value.trim();

  if (!title || !text) {
    alert("Vyplň název i text poznámky");
    return;
  }

  const notes = loadNotes();

  notes.push({
    id: Date.now().toString(),
    title,
    text,
    createdAt: new Date().toISOString()
  });

  saveNotes(notes);

  titleInput.value = "";
  textInput.value = "";

  renderNotes();
};

/* ===== START ===== */
renderNotes();
