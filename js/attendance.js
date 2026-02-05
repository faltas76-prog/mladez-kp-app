console.log("attendance.js – stats + calendar loaded");

const RECORD_KEY = "attendance_records_v1";

/* ===== DATA ===== */
function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(RECORD_KEY)) || [];
  } catch {
    return [];
  }
}

/* ===== UI ===== */
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
const calendar = document.getElementById("calendar");
const dayDetail = document.getElementById("dayDetail");
const statsBox = document.getElementById("stats");

/* ===== SELECTY ===== */
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

const currentYear = new Date().getFullYear();
for (let y = currentYear - 2; y <= currentYear + 1; y++) {
  const o = document.createElement("option");
  o.value = y;
  o.textContent = y;
  yearSelect.appendChild(o);
}

monthSelect.value = new Date().getMonth();
yearSelect.value = currentYear;

/* ===== KALENDÁŘ ===== */
function renderCalendar() {
  const month = parseInt(monthSelect.value);
  const year = parseInt(yearSelect.value);
  const records = loadRecords();

  calendar.innerHTML = "";
  dayDetail.innerHTML = "";

  records
    .filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .forEach(r => {
      const div = document.createElement("div");
      div.className = "calendar-day";
      div.textContent = new Date(r.date).toLocaleDateString();

      div.onclick = () => showDayDetail(r);

      calendar.appendChild(div);
    });

  renderStats(records);
}

/* ===== DETAIL DNE ===== */
function showDayDetail(record) {
  dayDetail.innerHTML = `
    <strong>📅 ${new Date(record.date).toLocaleDateString()}</strong>
    <ul>
      ${record.players
        .map(p =>
          `<li>${p.name} – ${p.attendance} – ⭐ ${p.rating}</li>`
        )
        .join("")}
    </ul>
  `;
}

/* ===== STATISTIKY ===== */
function renderStats(records) {
  const stats = {};

  records.forEach(r => {
    r.players.forEach(p => {
      if (!stats[p.playerId]) {
        stats[p.playerId] = {
          name: p.name,
          total: 0,
          present: 0
        };
      }

      stats[p.playerId].total++;
      if (p.attendance === "ano") stats[p.playerId].present++;
    });
  });

  statsBox.innerHTML = "";

  Object.values(stats).forEach(s => {
    const percent = Math.round((s.present / s.total) * 100);

    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${s.name}</strong> – ${percent}% docházky
      <small>(${s.present}/${s.total})</small>
    `;

    statsBox.appendChild(div);
  });
}

/* ===== EVENTS ===== */
monthSelect.onchange = renderCalendar;
yearSelect.onchange = renderCalendar;

/* ===== START ===== */
renderCalendar();
