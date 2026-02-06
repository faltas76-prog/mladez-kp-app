const NOTES_KEY = "coach_notes_v1";

function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY)) || [];
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

function renderNotes() {
  const box = document.getElementById("notesList");
  const notes = loadNotes();

  box.innerHTML = "";

  notes.forEach(n => {
    const div = document.createElement("div");
    div.className = "note";
    div.innerHTML = `
      <strong>${n.title}</strong>
      <p>${n.text}</p>
      <button data-id="${n.id}">❌</button>
    `;

    div.querySelector("button").onclick = () => {
      const updated = loadNotes().filter(x => x.id !== n.id);
      saveNotes(updated);
      renderNotes();
    };

    box.appendChild(div);
  });
}

document.getElementById("saveNoteBtn").onclick = () => {
  const title = noteTitle.value.trim();
  const text = noteText.value.trim();
  if (!title || !text) return;

  const notes = loadNotes();
  notes.push({
    id: Date.now().toString(),
    title,
    text,
    createdAt: Date.now()
  });

  saveNotes(notes);
  noteTitle.value = "";
  noteText.value = "";
  renderNotes();
};

renderNotes();
