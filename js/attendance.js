console.log("attendance.js loaded");

const RECORD_KEY = "attendance_records_v1";

/* ===== DATA ===== */
function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(RECORD_KEY)) || [];
  } catch {
    return [];
  }
}

/* ===== SELECTY ===== */
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
const calendar = document.getElementById("calendar");

/* naplnění měsíců */
const months = [
  "Leden","Únor","Březen","Duben","Květen","Červen",
  "Červenec","Srpen","Září","Říjen","Listopad","Prosinec"
];

months.forEach((m, i) => {
  const o = document.createElement("option");
  o.value = i;
  o.textContent = m;
  monthSelect.appendChild(o);
});

/* roky */
const currentYear = new Date().getFullYear();
for (let y = currentYear - 2; y <= currentYear + 1; y++) {
  const o = document.createElement("option");
  o.value = y;
  o.textContent = y;
  yearSelect.appendChild(o);
}

monthSelect.value = new Date().getMonth();
yearSelect.value = currentYear;

/* ===== RENDER KALENDÁŘE ===== */
function renderCalendar() {
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearSelect.value);
  const records = loadRecords();

  calendar.innerHTML = "";

  records
    .filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .forEach(r => {
      const div = document.createElement("div");
      div.className = "day";

      div.innerHTML = `
        <strong>${new Date(r.date).toLocaleDateString()}</strong>
        <ul>
          ${r.players
            .map(p => `<li>${p.name} – ${p.attendance} – ⭐ ${p.rating}</li>`)
            .join("")}
        </ul>
      `;

      calendar.appendChild(div);
    });
}

/* ===== PDF EXPORT ===== */
document.getElementById("exportPdfBtn").onclick = () => {
  const w = window.open("", "_blank");
  w.document.write("<h2>Docházka – přehled</h2>");
  w.document.write(calendar.innerHTML);
  w.document.close();
  w.print();
};

/* ===== EVENTS ===== */
monthSelect.onchange = renderCalendar;
yearSelect.onchange = renderCalendar;

/* ===== START ===== */
renderCalendar();
