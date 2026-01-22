/* =====================================================
   🎨🎨🎨 MOOD COLORS
===================================================== */
const moodColors = {
  angry: "#ff4e4e",
  average: "#b0b0b0",
  happy: "#ffd166",
  sad: "#78a1bb",
  energetic: "#7ce577",
  productive: "#6ed3cf",
  anxious: "#f39c9c",
  annoyed: "#d68fd6",
  stressed: "#f97575",
  drained: "#8c8ca1",
  numb: "#bfb6aa",
  reflective: "#b088f9",
  motivated: "#ffb347",
  comforted: "#ff8fab",
  focused: "#5ab2ff"
};

/* =====================================================
   🌙🌙🌙 LIGHT / DARK THEME TOGGLE
===================================================== */
function toggleTheme() {
  document.body.classList.toggle("dark");
}

/* =====================================================
   📅📅📅 CALENDAR STATE & ELEMENTS
===================================================== */
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

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
   📅📅📅 CALENDAR RENDERING
===================================================== */
function renderCalendar(month, year) {
  calendarGrid.innerHTML = "";

  /* Weekday labels */
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  weekdays.forEach(day => {
    const label = document.createElement("div");
    label.className = "weekday-label";
    label.textContent = day;
    calendarGrid.appendChild(label);
  });

  monthYearText.textContent =
    `${new Date(year, month).toLocaleString("default", { month: "long" })} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  /* Previous month tail */
  for (let i = firstDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthDays - i);
    calendarGrid.appendChild(createDayCell(date, true));
  }

  /* Current month */
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    calendarGrid.appendChild(createDayCell(date, false));
  }

  /* Next month head */
  const totalCells = 42;
  const remaining = totalCells - calendarGrid.childNodes.length;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    calendarGrid.appendChild(createDayCell(date, true));
  }

  /* Monthly Wrapped */
  renderMonthWrapped(month, year);
}

/* =====================================================
   📅📅📅 DAY CELL CREATION
===================================================== */
function createDayCell(date, isInactive) {
  const day = document.createElement("div");
  day.className = "calendar-day";
  if (isInactive) day.classList.add("inactive");

  /* Highlight today */
  const today = new Date();
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    day.classList.add("today");
  }

  const dayNum = document.createElement("div");
  dayNum.textContent = date.getDate();

  const dotsContainer = document.createElement("div");
  dotsContainer.className = "mood-dots";

  const key = date.toISOString().split("T")[0];
  const moods = moodData[key] || [];

  moods.forEach(mood => {
    const dot = document.createElement("div");
    dot.className = "mood-dot";
    dot.style.backgroundColor = moodColors[mood] || "#ccc";
    dotsContainer.appendChild(dot);
  });

  day.appendChild(dayNum);
  day.appendChild(dotsContainer);

  if (!isInactive) {
    day.addEventListener("click", () => {
      selectedDate = key;
      openMoodModal(moods);
    });
  }

  return day;
}

/* =====================================================
   🛑🛑🛑 MOOD MODAL
===================================================== */
function openMoodModal(existingMoods = []) {
  moodOptions.innerHTML = "";

  Object.entries(moodColors).forEach(([mood, color]) => {
    const label = document.createElement("label");
    label.className = "mood-checkbox";
    if (existingMoods.includes(mood)) label.classList.add("checked");

    label.style.borderLeft = `5px solid ${color}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = mood;
    checkbox.checked = existingMoods.includes(mood);

    checkbox.addEventListener("change", () => {
      label.classList.toggle("checked", checkbox.checked);
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(mood));
    moodOptions.appendChild(label);
  });

  moodModal.classList.remove("hidden");
}

/* =====================================================
   💾 SAVE / CLOSE MODAL
===================================================== */
saveMoodsBtn.addEventListener("click", () => {
  const checked = moodOptions.querySelectorAll("input:checked");
  const selectedMoods = Array.from(checked).map(c => c.value);

  if (selectedMoods.length) {
    moodData[selectedDate] = selectedMoods;
  } else {
    delete moodData[selectedDate];
  }

  localStorage.setItem("moodData", JSON.stringify(moodData));
  moodModal.classList.add("hidden");
  renderCalendar(currentMonth, currentYear);
});

closeModalBtn.addEventListener("click", () => {
  moodModal.classList.add("hidden");
});

/* =====================================================
   ⬅️➡️ MONTH NAVIGATION
===================================================== */
prevMonthBtn.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentMonth, currentYear);
});

nextMonthBtn.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentMonth, currentYear);
});

/* =====================================================
   📊 MONTHLY & YEARLY WRAPPED
===================================================== */
function getMonthStats(month, year) {
  const stats = {};
  let total = 0;

  Object.entries(moodData).forEach(([date, moods]) => {
    const d = new Date(date);
    if (d.getMonth() === month && d.getFullYear() === year) {
      moods.forEach(m => {
        stats[m] = (stats[m] || 0) + 1;
        total++;
      });
    }
  });

  return { stats, total };
}

/* =============================== 
    🎪🪄❤️‍🩹 PERSONALITY ENGINE 
  =============================== */
function getMonthPersonality(stats) {
  if (!stats.total) return "Quiet Reset Era";

  const sorted = Object.entries(stats.stats)
    .sort((a, b) => b[1] - a[1]);

  const [topMood, topCount] = sorted[0];
  const secondMood = sorted[1]?.[0];
  const diversity = sorted.length;

  // Core personality logic
  if (diversity >= 6) {
    return "Emotional Multiverse";
  }

  // Strong dual-energy months
  if (secondMood) {
    if (
      (topMood === "happy" && secondMood === "anxious") ||
      (topMood === "anxious" && secondMood === "happy")
    ) {
      return "High-Functioning Chaos";
    }

    if (
      (topMood === "sad" && secondMood === "reflective") ||
      (topMood === "reflective" && secondMood === "sad")
    ) {
      return "Soft Healing Cocoon";
    }

    if (
      (topMood === "motivated" && secondMood === "stressed") ||
      (topMood === "stressed" && secondMood === "motivated")
    ) {
      return "Pushing Through It Era";
    }
  }

  // Single-mood dominant arcs
  const basePersonalities = {
    happy: "Golden Light Expansion",
    anxious: "Tender Vigilance Mode",
    calm: "Zen Arc Complete",
    sad: "Gentle Grief Processing",
    angry: "Boundary-Setting Era",
    reflective: "Inner World Excavation",
    motivated: "Main Character Momentum",
    numb: "Low-Battery Survival Mode",
    comforted: "Safe Harbor Season",
    focused: "Tunnel Vision Mastery"
  };

  // Intensity check
  if (topCount / stats.total > 0.65) {
    return `${basePersonalities[topMood] || "Singular Focus Era"} (Intense Arc)`;
  }

  return basePersonalities[topMood] || "Main Character Month";
}

function renderMonthWrapped(month, year) {
  const wrap = document.getElementById("monthWrapped");
  if (!wrap) return;

  const stats = getMonthStats(month, year);
  if (!stats.total) {
    wrap.classList.add("hidden");
    return;
  }

  const topMood = Object.entries(stats.stats)
    .sort((a, b) => b[1] - a[1])[0][0];

  wrap.classList.remove("hidden");
  wrap.innerHTML = `
  <h3>${new Date(year, month).toLocaleString("default", { month: "long" })} Wrapped</h3>
  <p>${getMonthPersonality(stats)}</p>

  <div class="stat preview-stat">
    <strong>Top mood:</strong> ${topMood}
  </div>

  <button 
    onclick="downloadMonthPDF(${month}, ${year})" 
    style="margin-top: 16px;">
    Unlock Full Wrapped 📄
  </button>
`;
}

/* =====================================================
   				📊 GRAPHS & STATS
===================================================== */

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16)
  ];
}

//📊 Draw bar graph in PDF

function drawMoodBarGraph(doc, stats, startY) {
  const barHeight = 6;
  const maxBarWidth = 120;
  const moods = Object.entries(stats.stats);

  if (!moods.length) return startY;

  const maxCount = Math.max(...moods.map(([_, c]) => c));
  let y = startY;

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 80);
  doc.text("Mood distribution", 20, y - 6);

  moods.forEach(([mood, count]) => {
    const width = (count / maxCount) * maxBarWidth;
    const color = moodColors[mood] || "#ccc";
    const [r, g, b] = hexToRgb(color);

    // Label
    doc.setTextColor(40, 40, 60);
    doc.text(mood, 20, y + 5);

    // Bar
    doc.setFillColor(r, g, b);
    doc.roundedRect(60, y, width, barHeight, 3, 3, "F");

    // Count
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 120);
    doc.text(`${count}`, 60 + width + 4, y + 5);

    y += barHeight + 8;
  });

  return y;
}
 

/* =====================================================
   📄 PDF EXPORT
===================================================== */

function downloadMonthPDF(month, year) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'pt', 'a4');
  const stats = getMonthStats(month, year);
  const personality = getMonthPersonality(stats);

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let y = 40;

  // --------------------------
  // Background Color
  // --------------------------
  doc.setFillColor('#e0f7ff'); // soft pastel blue
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // --------------------------
  // Top header rectangle (decorative)
  // --------------------------
  doc.setFillColor('#cceeff');
  doc.roundedRect(30, 20, pageWidth - 60, 60, 10, 10, 'F');

  // --------------------------
  // Logo
  // --------------------------
  const img = new Image();
  img.src = "https://attic.sh/pwmwe81jg91gtv4wds5vvg8fmzjt";
  img.onload = () => {
    const imgWidth = 80;
    const imgHeight = 80;
    doc.addImage(img, 'PNG', pageWidth - imgWidth - 40, 20, imgWidth, imgHeight);

    // Website name
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#1f1f2f");
    doc.text("Attic Mood Tracker", 40, 60);

    y += 70;

    // --------------------------
    // Month Title
    // --------------------------
    doc.setFontSize(28);
    doc.setFont("helvetica", "italic");
    doc.setTextColor("#5ab2ff");
    doc.text(
      `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year} Wrapped`,
      40,
      y
    );
    y += 50;

    // --------------------------
    // Personality Card (bubble with shadow)
    // --------------------------
    const personalityText = `Personality Arc: ${personality}`;
    const cardHeight = 60;

    // Shadow behind card
    doc.setFillColor('#a8d0f9');
    doc.roundedRect(37, y - 18, pageWidth - 74, cardHeight, 12, 12, 'F');

    // Main personality card
    doc.setFillColor('#cce0ff');
    doc.roundedRect(35, y - 20, pageWidth - 70, cardHeight, 12, 12, 'F');

    doc.setFontSize(14);
    doc.setTextColor("#0a4f94");
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(personalityText, pageWidth - 90), 50, y);
    y += cardHeight + 30;

    // --------------------------
    // Mood Graph (Bar Graph with border)
    // --------------------------
    const graphX = 40;
    const graphY = y;
    const graphWidth = pageWidth - 80;
    const graphHeight = 200;

    // Graph background card
    doc.setFillColor('#d9f0ff');
    doc.roundedRect(graphX - 5, graphY - 5, graphWidth + 10, graphHeight + 10, 10, 10, 'F');

    // Graph border
    doc.setDrawColor("#3399ff");
    doc.setLineWidth(1.5);
    doc.rect(graphX, graphY, graphWidth, graphHeight, 'S');

    const dayCount = new Date(year, month + 1, 0).getDate();
    const barWidth = graphWidth / dayCount - 4;

    for (let day = 1; day <= dayCount; day++) {
      const key = new Date(year, month, day).toISOString().split("T")[0];
      const dayMoods = moodData[key] || [];
      dayMoods.forEach((mood, idx) => {
        const barHeight = (graphHeight / 5) * (1 / dayMoods.length);
        doc.setFillColor(moodColors[mood] || "#ccc");
        doc.roundedRect(
          graphX + (day - 1) * (barWidth + 4),
          graphY + graphHeight - (idx + 1) * barHeight,
          barWidth,
          barHeight,
          3, 3,
          'F'
        );
      });
    }

    // X-axis labels
    doc.setFontSize(8);
    for (let day = 1; day <= dayCount; day += Math.ceil(dayCount / 7)) {
      doc.setTextColor("#555");
      doc.text(
        `${day}`,
        graphX + (day - 1) * (barWidth + 4) + barWidth / 2,
        graphY + graphHeight + 12,
        { align: 'center' }
      );
    }

    y += graphHeight + 40;

    // --------------------------
    // Mood Stats Table (playful circles)
    // --------------------------
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#0055cc");
    doc.text("Mood Counts", 40, y);
    y += 20;

    doc.setFont("helvetica", "normal");
    let statY = y;
    Object.entries(stats.stats).forEach(([mood, count], i) => {
      // Optional alternating row background
      if (i % 2 === 0) {
        doc.setFillColor('#e6f7ff');
        doc.rect(40, statY - 15, pageWidth - 80, 20, 'F');
      }

      // Mood circle
      doc.setFillColor(moodColors[mood] || "#ccc");
      doc.circle(46, statY - 6, 6, 'F');

      doc.setTextColor("#003366");
      doc.text(`${mood}: ${count} days`, 60, statY);
      statY += 24;
    });

    y = statY + 30;

    // --------------------------
    // Footer
    // --------------------------
    doc.setFontSize(10);
    doc.setTextColor("#5588cc");
    doc.text("Keep shining & tracking!", pageWidth / 2, pageHeight - 20, { align: 'center' });

    // --------------------------
    // Save PDF
    // --------------------------
    doc.save(`Mood-Wrapped-${month + 1}-${year}.pdf`);
  };
}

  

/* =====================================================
   🧭 SCROLLING / CATALOGUE (SAFE)
===================================================== */
let currentIndex = 0;
const scrollAmount = 300;
const extraScrollAmount = 150;

function scrollCatalogue(direction) {
  const container = document.querySelector(".catalogue-container");
  const cards = document.querySelectorAll(".catalogue-container .card");
  if (!container || !cards.length) return;

  if (direction === "right") {
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    currentIndex = (currentIndex + 1) % cards.length;
  } else {
    container.scrollBy({ left: -(scrollAmount + extraScrollAmount), behavior: "smooth" });
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  }

  updateMarkers();
}

function updateMarkers() {
  const markers = document.querySelectorAll(".scroll-markers .marker");
  markers.forEach(m => m.classList.remove("active"));
  if (markers[currentIndex]) {
    markers[currentIndex].classList.add("active");
  }
}

/* =====================================================
   🚀 INITIAL LOAD
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  renderCalendar(currentMonth, currentYear);
  updateMarkers();
});
