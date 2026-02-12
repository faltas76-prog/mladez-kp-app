const pitch = document.getElementById("players-layer");
let players = [];

function createFormation() {
  pitch.innerHTML = "";
  players = [];

  const formation = document.getElementById("formationSelect").value;
  const parts = formation.split("-").map(Number);

  const rows = [1, ...parts];
  const height = pitch.clientHeight;
  const width = pitch.clientWidth;

  rows.forEach((count, rowIndex) => {
    for (let i = 0; i < count; i++) {

      const player = document.createElement("div");
      player.className = "player";

      const input = document.createElement("input");
      input.placeholder = "Hráč";
      player.appendChild(input);

      const y = height - (rowIndex + 1) * (height / (rows.length + 1));
      const x = (i + 1) * (width / (count + 1));

      player.style.left = x + "px";
      player.style.top = y + "px";

      makeDraggable(player);

      pitch.appendChild(player);
      players.push(player);
    }
  });
}

function makeDraggable(el) {
  let offsetX, offsetY;

  el.addEventListener("pointerdown", e => {
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    el.setPointerCapture(e.pointerId);
  });

  el.addEventListener("pointermove", e => {
    if (e.buttons !== 1) return;
    el.style.left = (e.pageX - pitch.offsetLeft - offsetX) + "px";
    el.style.top = (e.pageY - pitch.offsetTop - offsetY) + "px";
  });
}

function saveLineup() {
  const data = players.map(p => ({
    name: p.querySelector("input").value,
    x: p.style.left,
    y: p.style.top
  }));

  localStorage.setItem("MATCH_LINEUP", JSON.stringify(data));
  alert("Sestava uložena ✔");
}

function exportImage() {
  html2canvas(pitch).then(canvas => {
    const link = document.createElement("a");
    link.download = "sestava.png";
    link.href = canvas.toDataURL();
    link.click();
  });
}
document.getElementById("exportBtn").onclick = () => {
  html2canvas(pitch).then(canvas => {
    const link = document.createElement("a");
    link.download = "rozestaveni.png";
    link.href = canvas.toDataURL();
    link.click();
  });
};

document.getElementById("exportPdfBtn").onclick = async () => {
  const { jsPDF } = window.jspdf;
  const canvas = await html2canvas(pitch);
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: "portrait"
  });

  pdf.addImage(imgData, "PNG", 10, 10, 180, 260);
  pdf.save("rozestaveni.pdf");
};
