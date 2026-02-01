/* =====================================================
   🎨🎨🎨 MOOD COLORS
===================================================== */
const moodColors = {
  happy: "#ffd166",
  energetic: "#0ea448",
  motivated: "#f77f00",
  productive: "#118ab2",
  comforted: "#dcfa96",
  focused: "#3a86ff",
  grateful: "#c77dff",
  inspired: "#ff025f",
  relaxed: "#a2e0f5",

  average: "#b0b0b0",
  reflective: "#6d6875",
  curious: "#0da4d1",
  tired: "#abab40",

  sad: "#5cb0cc",
  anxious: "#ffcad4",
  stressed: "#ff595e",
  overwhelmed: "#ff106b",
  hopeless: "#0918c0",
  drained: "#495c87",
  burntOut: "#343a40",
  numb: "#ced4da",
  angry: "#b31108",
  annoyed: "#9f86c0",
  frustrated: "#d0510c",
  lonely: "#5f0f40"
};

/* =====================================================
   📅 STATE
===================================================== */
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentWrapPage = 0;

const calendarGrid = document.getElementById("calendarGrid");
const monthYearText = document.getElementById("calendarMonthYear");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

const moodModal = document.getElementById("moodModal");
const moodOptions = document.getElementById("moodOptions");
const saveMoodsBtn = document.getElementById("saveMoodsBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

let selectedDate = null;
let moodData = JSON.parse(localStorage.getItem("moodData")) || {};

/* =====================================================
   📅 CALENDAR
===================================================== */
function renderCalendar(month, year) {
  calendarGrid.innerHTML = "";

  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(d => {
    const el = document.createElement("div");
    el.className = "weekday-label";
    el.textContent = d;
    calendarGrid.appendChild(el);
  });

  monthYearText.textContent =
    `${new Date(year, month).toLocaleString("default", { month: "long" })} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  for (let i = firstDay - 1; i >= 0; i--) {
    calendarGrid.appendChild(
      createDayCell(new Date(year, month - 1, prevMonthDays - i), true)
    );
  }

  for (let i = 1; i <= daysInMonth; i++) {
    calendarGrid.appendChild(
      createDayCell(new Date(year, month, i), false)
    );
  }

  const remaining = 42 - calendarGrid.childNodes.length;
  for (let i = 1; i <= remaining; i++) {
    calendarGrid.appendChild(
      createDayCell(new Date(year, month + 1, i), true)
    );
  }

  renderMonthWrapped(month, year);
}

/* =====================================================
   📅 DAY CELL
===================================================== */
function createDayCell(date, inactive) {
  const day = document.createElement("div");
  day.className = "calendar-day";
  if (inactive) day.classList.add("inactive");

  const key = date.toISOString().split("T")[0];
  const moods = moodData[key] || [];

  const num = document.createElement("div");
  num.textContent = date.getDate();

  const dots = document.createElement("div");
  dots.className = "mood-dots";

  moods.forEach(m => {
    const d = document.createElement("div");
    d.className = "mood-dot";
    d.style.backgroundColor = moodColors[m] || "#ccc";
    dots.appendChild(d);
  });

  day.append(num, dots);

  if (!inactive) {
    day.addEventListener("click", () => {
      selectedDate = key;
      openMoodModal(moods);
    });
  }

  return day;
}

/* =====================================================
   🛑 MOOD MODAL
===================================================== */
function openMoodModal(existing = []) {
  moodOptions.innerHTML = "";

  Object.entries(moodColors).forEach(([m, c]) => {
    const label = document.createElement("label");
    label.className = "mood-checkbox";
    label.style.borderLeft = `5px solid ${c}`;

    const box = document.createElement("input");
    box.type = "checkbox";
    box.value = m;
    box.checked = existing.includes(m);

    label.classList.toggle("checked", box.checked);
    box.addEventListener("change", () =>
      label.classList.toggle("checked", box.checked)
    );

    label.append(box, m);
    moodOptions.appendChild(label);
  });

  moodModal.classList.remove("hidden");
}

saveMoodsBtn.onclick = () => {
  const checked = [...moodOptions.querySelectorAll("input:checked")]
    .map(c => c.value);

  if (checked.length) moodData[selectedDate] = checked;
  else delete moodData[selectedDate];

  localStorage.setItem("moodData", JSON.stringify(moodData));
  moodModal.classList.add("hidden");
  renderCalendar(currentMonth, currentYear);
};

closeModalBtn.onclick = () => moodModal.classList.add("hidden");

/* =====================================================
   ⬅️➡️ MONTH NAV
===================================================== */
prevMonthBtn.onclick = () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar(currentMonth, currentYear);
};

nextMonthBtn.onclick = () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar(currentMonth, currentYear);
};

/* =====================================================
   📊 STATS + PERSONALITY
   - Calculates mood stats for a specific month/year
===================================================== */
function getMonthStats(month, year) {
  const stats = {};
  let total = 0;

  Object.entries(moodData).forEach(([dateStr, moods]) => {
    const date = new Date(dateStr);
    // Only include moods from the specific month/year
    if (date.getMonth() === month && date.getFullYear() === year) {
      moods.forEach(m => {
        stats[m] = (stats[m] || 0) + 1;
        total++;
      });
    }
  });

  return { stats, total };
}

function getMonthPersonality(stats) {
  if (!stats.total) return "Quiet Reset Era 🌱";

  // Sort moods by frequency
  const sorted = Object.entries(stats.stats).sort((a, b) => b[1] - a[1]);
  const [top, count] = sorted[0];
  const diversity = sorted.length;

  if (diversity >= 6) return "Emotional Multiverse :)";
  if (count / stats.total > 0.65) return "Singular Focus Era :)";

  return "Main Character Month 🎬";
}

/* =====================================================
   📦 MONTH WRAPPED PREVIEW
   - Shows a preview of the current month’s moods
   - Only includes moods logged in that month
===================================================== */
function renderMonthWrapped(month, year) {
  const wrap = document.getElementById("monthWrapped");
  if (!wrap) return;

  // Get stats only for this month/year
  const stats = getMonthStats(month, year);

  // Hide section if no moods logged in this month
  if (!stats.total) {
    wrap.classList.add("hidden");
    return;
  }

  const monthName = new Date(year, month).toLocaleString("default", { month: "long" });
  const preview = wrap.querySelector(".wrapped-preview");

  // Reset previous content to prevent cross-month dots
  preview.innerHTML = "";

  // Build new mood dots only for this month
  let moodDotsHTML = '';
  Object.entries(stats.stats).forEach(([mood, count]) => {
    const color = moodColors[mood] || "#ccc";
    for (let i = 0; i < count; i++) {
      moodDotsHTML += `<span class="mood-dot" style="background-color:${color};"></span>`;
    }
  });

  preview.innerHTML = `
    <h3>${monthName} Wrapped ✨</h3>
    <p class="big-vibe">${getMonthPersonality(stats)}</p>

    <div class="stat">
      ${stats.total} moods logged •
      ${Object.keys(stats.stats).length} emotional states
    </div>

    <div class="month-moods-preview" style="margin-top:10px; display:flex; flex-wrap:wrap; gap:4px;">
      ${moodDotsHTML}
    </div>

    <p style="margin-top:12px; font-size:0.85rem; opacity:0.9;">
      Your full emotional story — mood breakdowns, visuals,
      and reflections — lives in your downloadable Wrapped.
    </p>
  `;

  wrap.classList.remove("hidden");
}

/* =====================================================
   📄 PDF EXPORT
===================================================== */
function hexToRgb(hex) {
  const parsed = hex.replace(/^#/, '');
  const bigint = parseInt(parsed, 16);
  if (parsed.length === 3) {
    return [
      (bigint >> 8 & 0xf) * 17,
      (bigint >> 4 & 0xf) * 17,
      (bigint & 0xf) * 17
    ];
  }
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255
  ];
}

function downloadMonthPDF(month, year) {
  if (month == null || year == null) {
    console.error("Month or year not defined");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "pt", "a4");

  const stats = getMonthStats(month, year);
  if (!stats.total) {
    alert("No moods logged this month to export.");
    return;
  }

  const personality = getMonthPersonality(stats);
  const monthName = new Date(year, month).toLocaleString("default", { month: "long" });
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  let y = 60;

  // Background Gradient
  doc.setFillColor(255, 214, 233);
  doc.rect(0, 0, pageWidth, pageHeight / 2, "F");
  doc.setFillColor(214, 234, 255);
  doc.rect(0, pageHeight / 2, pageWidth, pageHeight / 2, "F");

  // Header
  doc.setFillColor(255, 255, 255, 0.9);
  doc.roundedRect(30, 30, pageWidth - 60, 80, 18, 18, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(255, 85, 160);
  doc.text(`${monthName} ${year}`, 50, 70);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(208, 232, 242);
  doc.text("Your Mood Wrapped :)", 50, 95);

  y = 140;

  // Personality Card
  doc.setFillColor(255, 240, 248);
  doc.roundedRect(40, y, pageWidth - 80, 70, 16, 16, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 70, 150);
  doc.text("Personality Arc", 60, y + 24);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(16);
  doc.setTextColor(60, 60, 90);
  doc.text(doc.splitTextToSize(personality, pageWidth - 140), 60, y + 48);

  y += 100;

  // Mood Stats
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(245, 222, 250);
  doc.text("Mood Breakdown", 40, y);
  y += 20;

  Object.entries(stats.stats).forEach(([mood, count], index) => {
    const rowY = y + index * 26;

    doc.setFillColor(255, 255, 255, 0.85);
    doc.roundedRect(40, rowY, pageWidth - 80, 22, 11, 11, "F");

    const [r, g, b] = hexToRgb(moodColors[mood] || "#ccc");
    doc.setFillColor(r, g, b);
    doc.circle(54, rowY + 11, 6, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(249, 232, 252);
    doc.text(mood, 70, rowY + 15);

    doc.setFont("helvetica", "bold");
    doc.text(`${count} day${count > 1 ? "s" : ""}`, pageWidth - 80, rowY + 15, { align: "right" });
  });

  y += Object.keys(stats.stats).length * 26 + 30;

  // Footer
  doc.setFillColor(255, 255, 255, 0.7);
  doc.roundedRect(40, y, pageWidth - 80, 60, 14, 14, "F");

  doc.setFont("helvetica", "italic");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 110);
  doc.text(doc.splitTextToSize(
    "Tracking your emotions is an act of self-respect. Thank you for showing up for yourself this month <3",
    pageWidth - 120
  ), 60, y + 30);

  // Download PDF
  doc.save(`Saturn-Mood-Wrapped-${month + 1}-${year}.pdf`);
}

/* =====================================================
   🚀 INIT
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderCalendar(currentMonth, currentYear);
});
