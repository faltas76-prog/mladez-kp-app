document.addEventListener("DOMContentLoaded", () => {

  console.log("TacticalPad INIT");

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const wrapper = document.getElementById("wrapper");

  const DB_KEY = "tactical_exercises_db";

  /* ===== RESIZE ===== */
  function resizeCanvas() {
    const r = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  /* ===== STAV ===== */
  let mode = "draw";        // draw | erase | object
  let tool = null;
  let drawing = false;
  let currentLine = null;

  let lines = [];
  let objects = [];

  /* ===== UI ===== */
  document.getElementById("toolDraw").onclick = () => {
    mode = "draw";
    tool = null;
  };

  document.getElementById("toolErase").onclick = () => {
    mode = "erase";
    tool = null;
  };

  document.querySelectorAll("[data-tool]").forEach(b => {
    b.onclick = () => {
      mode = "object";
      tool = b.dataset.tool;
    };
  });

  document.getElementById("resetExercise").onclick = () => {
    if (!confirm("Vymazat cvičení?")) return;
    lines = [];
    objects = [];
    redraw();
  };

  document.getElementById("saveExercise").onclick = saveExercise;

  /* ===== POZICE ===== */
  function pos(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: e.clientX - r.left,
      y: e.clientY - r.top
    };
  }

  /* ===== KRESLENÍ ===== */
  canvas.addEventListener("pointerdown", e => {
    const p = pos(e);
    drawing = true;

    if (mode === "draw") {
      currentLine = [p];
      lines.push(currentLine);
    }

    if (mode === "object" && tool) {
      objects.push({
        type: tool,
        x: p.x,
        y: p.y,
        size: parseInt(document.getElementById("sizeSelect").value)
      });
      redraw();
    }

    if (mode === "erase") {
      lines = lines.filter(l => !l.some(pt => Math.hypot(pt.x - p.x, pt.y - p.y) < 10));
      objects = objects.filter(o => Math.hypot(o.x - p.x, o.y - p.y) > o.size);
      redraw();
    }
  });

  canvas.addEventListener("pointermove", e => {
    if (!drawing || mode !== "draw") return;
    currentLine.push(pos(e));
    redraw();
  });

  canvas.addEventListener("pointerup", () => {
    drawing = false;
    currentLine = null;
  });

  /* ===== RENDER ===== */
  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#ffeb3b";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    lines.forEach(l => {
      ctx.beginPath();
      ctx.moveTo(l[0].x, l[0].y);
      l.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });

    objects.forEach(o => {
      if (o.type === "ball") {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      if (o.type === "cone") {
        ctx.fillStyle = "#ff9800";
        ctx.beginPath();
        ctx.moveTo(o.x, o.y - o.size);
        ctx.lineTo(o.x - o.size, o.y + o.size);
        ctx.lineTo(o.x + o.size, o.y + o.size);
        ctx.fill();
      }
      if (o.type === "hurdle") {
        ctx.fillStyle = "#2196f3";
        ctx.fillRect(o.x - o.size, o.y - o.size / 4, o.size * 2, o.size / 2);
      }
      if (o.type === "goal") {
        ctx.strokeStyle = "#fff";
        ctx.strokeRect(o.x - o.size * 1.5, o.y - o.size / 2, o.size * 3, o.size);
      }
    });
  }

  /* ===== DATABÁZE ===== */
  function loadDB() {
    return JSON.parse(localStorage.getItem(DB_KEY) || "[]");
  }

  function saveExercise() {
    const name = document.getElementById("exerciseName").value.trim();
    if (!name) {
      alert("Zadej název cvičení");
      return;
    }
    const db = loadDB();
    db.push({
      id: Date.now(),
      name,
      lines,
      objects
    });
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    renderExerciseList();
  }

  function loadExercise(id) {
    const ex = loadDB().find(e => e.id === id);
    if (!ex) return;
    lines = ex.lines;
    objects = ex.objects;
    redraw();
  }

  function renderExerciseList() {
    const list = document.getElementById("exerciseList");
    list.innerHTML = "";
    loadDB().forEach(e => {
      const div = document.createElement("div");
      div.className = "exercise-item";
      div.textContent = e.name;
      div.onclick = () => loadExercise(e.id);
      list.appendChild(div);
    });
  }

  renderExerciseList();
});
