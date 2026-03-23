document.addEventListener("DOMContentLoaded", () => {

const noteTitle = document.getElementById("noteTitle");
const noteText = document.getElementById("noteText");
const saveBtn = document.getElementById("saveNoteBtn");
const notesList = document.getElementById("notesList");

let editIndex = null;

/* ===== NAČTENÍ ===== */
function loadNotes(){
  const notes = JSON.parse(localStorage.getItem("NOTES")) || [];
  notesList.innerHTML = "";

  notes.forEach((note, index) => {

    const div = document.createElement("div");
    div.className = "note";

    div.innerHTML = `
      <strong>${note.title}</strong><br>
      <p>${note.text}</p>
      <button onclick="editNote(${index})">✏️ Upravit</button>
      <button onclick="deleteNote(${index})">🗑️ Smazat</button>
    `;

    notesList.appendChild(div);
  });
}

/* ===== ULOŽENÍ / EDITACE ===== */
saveBtn.addEventListener("click", () => {

  const notes = JSON.parse(localStorage.getItem("NOTES")) || [];

  const newNote = {
    title: noteTitle.value.trim() || "Bez názvu",
    text: noteText.value.trim()
  };

  if(editIndex !== null){
    notes[editIndex] = newNote; // 🔥 EDITACE
    editIndex = null;
  } else {
    notes.push(newNote); // NOVÁ POZNÁMKA
  }

  localStorage.setItem("NOTES", JSON.stringify(notes));

  noteTitle.value = "";
  noteText.value = "";

  loadNotes();
});

/* ===== EDITACE ===== */
window.editNote = function(index){

  const notes = JSON.parse(localStorage.getItem("NOTES")) || [];

  noteTitle.value = notes[index].title;
  noteText.value = notes[index].text;

  editIndex = index;

  window.scrollTo({ top: 0, behavior: "smooth" });
};

/* ===== SMAZÁNÍ ===== */
window.deleteNote = function(index){

  const notes = JSON.parse(localStorage.getItem("NOTES")) || [];

  notes.splice(index,1);

  localStorage.setItem("NOTES", JSON.stringify(notes));

  loadNotes();
};

/* ===== INIT ===== */
loadNotes();

});
