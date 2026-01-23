/* ===========================
   🧠 GLOBAL STATE
=========================== */
const STORAGE_KEY = "behaviorLabState";

let state = {
  observations: [],
  notifications: [],
  xp: 0,
  level: 1,
  streak: 0,
  lastLogDate: null
};

let editingId = null;

/* ===========================
   💾 STORAGE
=========================== */
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) state = JSON.parse(saved);
}

/* ===========================
   🔔 NOTIFICATIONS
=========================== */
const toastMessages = [
  // Tiny wins & reinforcement
  "tiny progress detected ✨",
  "data logged. reality updated.",
  "you showed up. that counts.",
  "patterns love consistency 🧬",
  "brain cells applaud politely 👏",
  "behavior noted. no judgment.",
  "small steps still bend time ⏳",
  "one moment at a time 🌱",
  "your effort matters 💜",
  "you’re doing the thing, that’s huge 🫶",

  // Mood & mental health nudges
  "how’s your mood right now? 🌤️",
  "breathe in… breathe out… 🌬️",
  "remember: feelings are valid 💛",
  "check in with yourself 🧠",
  "you deserve a small treat today 🍵",
  "a moment of gratitude goes a long way 🌸",
  "smile! even a tiny one counts 😊",

  // Journaling / tracking reminders
  "time to jot your thoughts ✍️",
  "don’t forget your mood tracker 📝",
  "reflect for 2 minutes, you deserve it ⏳",
  "capture one happy moment today 🌈",
  "your journal loves you 💖",
  "write it down, free your mind 🕊️",

  // Lighthearted & cute encouragement
  "paws and relax 🐾",
  "sending virtual confetti 🎉",
  "you’re a star ⭐",
  "high-five yourself 🙌",
  "tiny neurons celebrate 🧠🎈",
  "keep blooming 🌷",
  "every little step is magic ✨",

  // Reminders for self-care
  "hydrate! 💧",
  "stretch a little 🧘",
  "snack break? 🍎",
  "time for fresh air 🌿",
  "step outside for a moment 🌞",
  "listen to a favorite song 🎵"
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function playDing() {
  const audio = new Audio("assets/audios/ding.mp3"); // example ding
  audio.play();
}

// Push a new notification
function pushNotification(message) {
  const note = {
    id: Date.now(),
    message,
    timestamp: Date.now(),
    read: false
  };

  state.notifications.unshift(note);
  saveState();
  showToast(message);
  playDing();
  renderNotifications();
}

// Temporary toast
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 50);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ===========================
   🔔 NOTIFICATIONS PANEL
=========================== */
function renderNotifications() {
  const container = document.getElementById("notificationList");
  if (!container) return;

  container.innerHTML = "";

  if (state.notifications.length === 0) {
    container.innerHTML = "<p class='empty'>no notifications 🌙</p>";
    return;
  }

  state.notifications.forEach(note => {
    const div = document.createElement("div");
    div.className = `notification-item ${note.read ? "read" : ""}`;
    div.dataset.id = note.id;

    div.innerHTML = `
      <div class="notif-content">
        <p>${note.message}</p>
        <span class="timestamp">${new Date(note.timestamp).toLocaleTimeString()}</span>
      </div>
      <button class="delete-note"><i class="fas fa-trash"></i></button>
    `;

    const deleteBtn = div.querySelector(".delete-note");

    // Delete button click
    deleteBtn.addEventListener("click", e => {
      e.stopPropagation();
      state.notifications = state.notifications.filter(n => n.id !== note.id);
      saveState();
      renderNotifications();
    });

    // Mark as read when clicked
    div.querySelector(".notif-content").addEventListener("click", () => {
      note.read = true;
      div.classList.add("read");
      saveState();
    });

    // Swipe/drag to reveal delete
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    div.addEventListener("pointerdown", e => {
      startX = e.clientX;
      isDragging = true;
      div.setPointerCapture(e.pointerId);
    });

    div.addEventListener("pointermove", e => {
      if (!isDragging) return;
      currentX = e.clientX - startX;
      if (currentX < 0) { // only allow left swipe
        div.style.transform = `translateX(${currentX}px)`;
      }
    });

    div.addEventListener("pointerup", e => {
      isDragging = false;
      if (currentX < -80) { // swipe threshold
        div.style.transform = `translateX(-80px)`; // reveal delete button
      } else {
        div.style.transform = `translateX(0px)`;
      }
    });

    container.appendChild(div);
  });

  document.getElementById("notificationCount").textContent = state.notifications.length;
}


/* ===========================
   🧪 OBSERVATIONS (CRUD)
=========================== */
function logObservation(data) {
  const entry = {
    id: Date.now(),
    category: data.category,
    description: data.description,
    trigger: data.trigger,
    intensity: parseInt(data.intensity),
    outcome: data.outcome,
    timestamp: Date.now()
  };

  state.observations.unshift(entry);

  addXP(25);
  updateStreak();
  pushNotification(randomFrom(toastMessages));

  saveState();
  renderObservations();
}

function deleteObservation(id) {
  state.observations = state.observations.filter(o => o.id !== id);
  saveState();
  renderObservations();
  pushNotification("entry removed 🫧");
}

function editObservation(id) {
  const entry = state.observations.find(o => o.id === id);
  if (!entry) return;

  editingId = id;

  // Fill all fields
  document.getElementById("category").value = entry.category;
  document.getElementById("description").value = entry.description;
  document.getElementById("trigger").value = entry.trigger;
  document.getElementById("intensity").value = entry.intensity;
  document.getElementById("outcome").value = entry.outcome;

  // Scroll into view for easier editing
  document.getElementById("behaviorForm").scrollIntoView({ behavior: "smooth" });
}

function saveObservationFromForm() {
  const category = document.getElementById("category").value;
  const description = document.getElementById("description").value;
  const trigger = document.getElementById("trigger").value;
  const intensity = document.getElementById("intensity").value;
  const outcome = document.getElementById("outcome").value;

  if (!category || !description) return;

  if (editingId) {
    const index = state.observations.findIndex(o => o.id === editingId);
    if (index !== -1) {
      state.observations[index] = {
        ...state.observations[index],
        category,
        description,
        trigger,
        intensity: parseInt(intensity),
        outcome
      };
    }
    editingId = null;
    pushNotification("entry updated ✍️");
  } else {
    logObservation({ category, description, trigger, intensity, outcome });
  }

  saveState();
  renderObservations();
  document.getElementById("behaviorForm").reset();
}

/* ===========================
   🖼️ RENDER OBSERVATIONS
=========================== */
function renderObservations() {
  const list = document.getElementById("timelineEntries");
  if (!list) return;

  list.innerHTML = "";

  if (state.observations.length === 0) {
    list.innerHTML = "<p class='empty'>no observations yet 🫧</p>";
    return;
  }

  const categoryFilter = document.getElementById("filterCategory")?.value || "";
  const timeFilter = document.getElementById("filterTime")?.value || "newest";

  let entries = [...state.observations];

  // Apply category filter
  if (categoryFilter) {
    entries = entries.filter(o => o.category === categoryFilter);
  }

  // Apply time/intensity sorting
  if (timeFilter === "newest") {
    entries.sort((a, b) => b.timestamp - a.timestamp);
  } else if (timeFilter === "oldest") {
    entries.sort((a, b) => a.timestamp - b.timestamp);
  } else if (timeFilter === "highest") {
    entries.sort((a, b) => b.intensity - a.intensity);
  }

  entries.forEach(entry => {
    const card = document.createElement("div");
    card.className = "observation-card collapsed";

    const date = new Date(entry.timestamp).toLocaleDateString();

    card.innerHTML = `
      <div class="obs-preview">
        <span class="obs-category">${entry.category}</span>
        <span class="obs-intensity">intensity ${entry.intensity}</span>
        <span class="obs-date">${date}</span>
      </div>
      <div class="obs-details" style="display:none;">
        <p class="obs-description"><strong>Description:</strong> ${entry.description}</p>
        <p class="obs-trigger"><strong>Trigger:</strong> ${entry.trigger}</p>
        <p class="obs-outcome"><strong>Outcome:</strong> ${entry.outcome}</p>
        <div class="obs-actions">
          <button onclick="editObservation(${entry.id})">edit</button>
          <button onclick="deleteObservation(${entry.id})">delete</button>
        </div>
      </div>
    `;

    // Expand/collapse
    card.querySelector(".obs-preview").addEventListener("click", () => {
      const details = card.querySelector(".obs-details");
      const isCollapsed = card.classList.contains("collapsed");
      if (isCollapsed) {
        details.style.display = "block";
        card.classList.remove("collapsed");
        card.classList.add("expanded");
      } else {
        card.classList.add("collapsed");
        card.classList.remove("expanded");
        setTimeout(() => { details.style.display = "none"; }, 300);
      }
    });

    list.appendChild(card);
  });

  document.getElementById("entryCount").textContent = entries.length;
}

/* ===========================
   🎮 GAMIFICATION
=========================== */
function addXP(amount) {
  state.xp += amount;
  const xpNeeded = state.level * 100;
  if (state.xp >= xpNeeded) {
    state.xp -= xpNeeded;
    state.level++;
    pushNotification(`level up ✨ level ${state.level}`);
  }
  saveState();
  updateStats();
}

function updateStreak() {
  const today = new Date().toDateString();
  if (state.lastLogDate !== today) {
    state.streak++;
    state.lastLogDate = today;
  }
  saveState();
  updateStats();
}

function updateStats() {
  document.getElementById("xpCount").textContent = state.xp;
  document.getElementById("level").textContent = state.level;
  document.getElementById("streakCount").textContent = state.streak;
}

/* ===========================
   🔔 NOTIFICATIONS RENDER
=========================== */
function renderNotifications() {
  const container = document.getElementById("notificationList") || document.getElementById("notificationContainer");
  if (!container) return;

  container.innerHTML = "";

  if (state.notifications.length === 0) {
    container.innerHTML = "<p class='empty'>no notifications 🌙</p>";
    document.getElementById("notificationCount").textContent = 0;
    return;
  }

  state.notifications.forEach(note => {
    const div = document.createElement("div");
    div.className = `notification-item ${note.read ? "read" : ""}`;
    div.innerHTML = `
      <p>${note.message}</p>
      <span class="timestamp">${new Date(note.timestamp).toLocaleTimeString()}</span>
      <button class="delete-note">x</button>
    `;

    // Mark read on click
    div.addEventListener("click", e => {
      if (!e.target.classList.contains("delete-note")) {
        note.read = true;
        div.classList.add("read");
        saveState();
      }
    });

  
    // Delete button
    div.querySelector(".delete-note").addEventListener("click", e => {
      e.stopPropagation();
      state.notifications = state.notifications.filter(n => n.id !== note.id);
      saveState();
      renderNotifications();
    });

    container.appendChild(div);
  });

  document.getElementById("notificationCount").textContent = state.notifications.length;
}

/* ===========================
   🚀 INIT & EVENTS
=========================== */
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  updateStats();
  renderObservations();
  renderNotifications();

  // Filters
  document.getElementById("filterCategory")?.addEventListener("change", renderObservations);
  document.getElementById("filterTime")?.addEventListener("change", renderObservations);

  // Form submit
  const form = document.getElementById("behaviorForm");
  form.addEventListener("submit", e => {
    e.preventDefault();
    saveObservationFromForm();
  });

  // Notification panel toggle
  const notifBtn = document.getElementById("notificationButton");
  const notifPanel = document.getElementById("notificationPanel");
  const closeBtn = document.getElementById("closeNotifications");

  notifBtn?.addEventListener("click", () => notifPanel?.classList.toggle("hidden"));
  closeBtn?.addEventListener("click", () => notifPanel?.classList.add("hidden"));
});
