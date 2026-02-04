function saveNote(){
  let n = JSON.parse(localStorage.getItem("notes"))||[];
  n.push({
    date:date.value, player:player.value,
    rating:rating.value, text:note.value
  });
  localStorage.setItem("notes",JSON.stringify(n));
  location.reload();
}
function exportPDF(){ window.print(); }
