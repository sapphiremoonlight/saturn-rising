// Mood tag color definitions
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

// Light/Dark mode toggle setup (optional — future enhancement)
function toggleTheme() {
  document.body.classList.toggle("dark");
}

// You can call toggleTheme() from a button later

// CALENDER
// moodColors already defined previously
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

// Mood storage format: { "YYYY-MM-DD": ["happy", "sad"] }
let moodData = JSON.parse(localStorage.getItem("moodData")) || {};

function renderCalendar(month, year) {
  calendarGrid.innerHTML = "";
  monthYearText.textContent = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Previous month's tail
  for (let i = firstDay - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthDays - i);
    calendarGrid.appendChild(createDayCell(date, true));
  }

  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    calendarGrid.appendChild(createDayCell(date, false));
  }

  // Next month's head to fill the grid
  const remaining = 42 - calendarGrid.childNodes.length;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    calendarGrid.appendChild(createDayCell(date, true));
  }
}

function createDayCell(date, isInactive) {
  const day = document.createElement("div");
  day.className = "calendar-day";
  if (isInactive) day.classList.add("inactive");

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

  // Only allow current month to be editable
  if (!isInactive) {
    day.addEventListener("click", () => {
      selectedDate = key;
      openMoodModal(moodData[key] || []);
    });
  }

  return day;
}

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

saveMoodsBtn.addEventListener("click", () => {
  const checked = moodOptions.querySelectorAll("input:checked");
  const selectedMoods = Array.from(checked).map(c => c.value);

  if (selectedMoods.length > 0) {
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

renderCalendar(currentMonth, currentYear);


// JavaScript to handle scrolling and markers
let currentIndex = 0; // To keep track of which card is currently visible
const scrollAmount = 300; // Amount to scroll per click (adjust as needed)
const extraScrollAmount = 150; // Extra scroll amount when scrolling left to reveal the first card

function scrollCatalogue(direction) {
  const container = document.querySelector('.catalogue-container');
  const totalCards = document.querySelectorAll('.catalogue-container .card').length;

  if (direction === 'right') {
    // Scroll the container right by the scrollAmount
    container.scrollBy({
      left: scrollAmount,  // Scroll right by a fixed amount
      behavior: 'smooth',   // Smooth scroll effect
    });
  } else {
    // Scroll the container left by the scrollAmount + extraScrollAmount
    container.scrollBy({
      left: -(scrollAmount + extraScrollAmount),  // Scroll left by an extra amount to reveal the first card
      behavior: 'smooth',   // Smooth scroll effect
    });
  }

  // Ensure the currentIndex stays within bounds after scrolling
  if (direction === 'right') {
    currentIndex = (currentIndex + 1) % totalCards;
  } else {
    currentIndex = (currentIndex - 1 + totalCards) % totalCards;
  }

  // Update markers
  updateMarkers();
}

// Update scroll markers based on the current card
function updateMarkers() {
  const markers = document.querySelectorAll('.scroll-markers .marker');
  markers.forEach(marker => marker.classList.remove('active'));  // Remove active class from all markers
  markers[currentIndex].classList.add('active');  // Add active class to the current marker
}

// Call updateMarkers on initial load to set the first marker as active
document.addEventListener('DOMContentLoaded', updateMarkers);
