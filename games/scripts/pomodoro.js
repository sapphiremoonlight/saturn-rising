/* 🔷🔷🔷 THEME & DARK MODE TOGGLE 🔷🔷🔷 */

const themeSelector = document.getElementById('themeSelector');
const darkToggle = document.getElementById('darkModeToggle');
const body = document.body;

function updateThemeClass(theme, isDark) {
  const mode = isDark ? 'dark' : 'light';
  const fullTheme = `${theme}-${mode}`;
  body.className = fullTheme;
  localStorage.setItem('themeColor', theme);
  localStorage.setItem('darkMode', isDark);
}

// 🎨 On theme change
themeSelector.addEventListener('change', () => {
  const selectedTheme = themeSelector.value;
  const isDark = darkToggle.checked;
  updateThemeClass(selectedTheme, isDark);
});

// 🌙 On dark mode toggle
darkToggle.addEventListener('change', () => {
  const selectedTheme = themeSelector.value;
  const isDark = darkToggle.checked;
  updateThemeClass(selectedTheme, isDark);
});

// 💾 Load theme from localStorage
const savedTheme = localStorage.getItem('themeColor') || 'blue';
const savedDarkMode = localStorage.getItem('darkMode') === 'true';
themeSelector.value = savedTheme;
darkToggle.checked = savedDarkMode;
updateThemeClass(savedTheme, savedDarkMode);


/* ✅✅✅ TASK LIST LOGIC ✅✅✅ */

const taskInput = document.getElementById('taskInput');
const taskCategory = document.getElementById('taskCategory');
const taskList = document.getElementById('taskList');
const addTaskBtn = document.getElementById('addTaskBtn');

// Category management elements
const newCategoryInput = document.getElementById('newCategoryInput');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const editCategorySelect = document.getElementById('editCategorySelect');
const editCategoryBtn = document.getElementById('editCategoryBtn');
const deleteCategoryBtn = document.getElementById('deleteCategoryBtn');

let categories = ['work', 'study', 'chores', 'health', 'misc'];
let tasks = [];

// --- CATEGORY MANAGEMENT ---

function updateCategoryUI() {
  // Update category dropdowns
  taskCategory.innerHTML = '';
  editCategorySelect.innerHTML = '';
  categories.forEach(cat => {
    const option1 = document.createElement('option');
    option1.value = cat;
    option1.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    taskCategory.appendChild(option1);

    const option2 = document.createElement('option');
    option2.value = cat;
    option2.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    editCategorySelect.appendChild(option2);
  });
  localStorage.setItem('categories', JSON.stringify(categories));
}

// Dynamically generate and inject CSS for new categories
function applyDynamicCategoryColors() {
  const styleId = 'dynamic-category-styles';
  let styleTag = document.getElementById(styleId);

  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = styleId;
    document.head.appendChild(styleTag);
  }

  let css = '';

  categories.forEach(cat => {
    const safeClass = cat.replace(/[^a-z0-9_-]/gi, '').toLowerCase();
    if (!['work', 'study', 'chores', 'health', 'misc'].includes(safeClass)) {
      const hash = Array.from(cat).reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const hue = hash % 360;
      const color = `hsl(${hue}, 70%, 70%)`;
      css += `
        .task-${safeClass} {
          border-left: 6px solid ${color} !important;
        }
      `;
    }
  });

  styleTag.textContent = css;
}


function loadCategories() {
  const stored = localStorage.getItem('categories');
  if (stored) categories = JSON.parse(stored);
  updateCategoryUI();
}

addCategoryBtn.addEventListener('click', () => {
  const newCat = newCategoryInput.value.trim().toLowerCase();
  if (!newCat) return alert('Enter a category name!');
  if (categories.includes(newCat)) return alert('Category already exists!');
  categories.push(newCat);
  updateCategoryUI();
  newCategoryInput.value = '';
});

editCategoryBtn.addEventListener('click', () => {
  const selected = editCategorySelect.value;
  if (!selected) return alert('Select a category!');
  const newName = prompt('New name:', selected);
  if (!newName) return;
  const lower = newName.toLowerCase().trim();
  if (categories.includes(lower)) return alert('That category exists already.');
  const index = categories.indexOf(selected);
  if (index !== -1) categories[index] = lower;
  tasks.forEach(t => {
    if (t.category === selected) t.category = lower;
  });
  updateCategoryUI();
  saveTasks();
  renderTasks();
});

deleteCategoryBtn.addEventListener('click', () => {
  const selected = editCategorySelect.value;
  if (!selected) return alert('Select a category!');
  if (!confirm(`Delete category "${selected}"? Tasks with it will also be removed.`)) return;
  categories = categories.filter(cat => cat !== selected);
  tasks = tasks.filter(t => t.category !== selected);
  updateCategoryUI();
  saveTasks();
  renderTasks();
});

// --- TASKS ---

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  const stored = localStorage.getItem('tasks');
  if (stored) tasks = JSON.parse(stored);
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => createTaskElement(task, index));
}

function createTaskElement(task, index) {
  const li = document.createElement('li');
  li.classList.add(`task-${task.category}`);

  const label = document.createElement('label');
  label.className = 'task-label';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.done;

  const span = document.createElement('span');
  span.textContent = `[${task.category}] ${task.text}`;
  if (task.done) li.classList.add('task-completed');

  checkbox.addEventListener('change', () => {
    task.done = checkbox.checked;
    li.classList.toggle('task-completed', task.done);
    saveTasks();
  });

  label.appendChild(checkbox);
  label.appendChild(span);
  li.appendChild(label);

  // Delete button
  const deleteBtn = document.createElement('div');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.textContent = '🗑';
  li.appendChild(deleteBtn);

  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
  });

  // Swipe detection (mobile)
  let startX = 0, currentX = 0, isDragging = false;

  li.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    li.style.transition = '';
  });

  li.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    if (deltaX < 0 && deltaX >= -80) {
      li.style.transform = `translateX(${40 + deltaX}px)`;
    }
  });

  li.addEventListener('touchend', () => {
    isDragging = false;
    const deltaX = currentX - startX;
    if (deltaX < -40) {
      li.classList.add('show-delete');
      li.style.transform = `translateX(40px)`;
    } else {
      li.classList.remove('show-delete');
      li.style.transform = 'translateX(0)';
    }
  });

  li.addEventListener('click', () => {
    if (li.classList.contains('show-delete')) {
      li.classList.remove('show-delete');
      li.style.transform = 'translateX(0)';
    }
  });

  taskList.appendChild(li);
}

// Add task
addTaskBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  const category = taskCategory.value;
  if (!text) return;
  tasks.push({ text, category, done: false });
  saveTasks();
  renderTasks();
  taskInput.value = '';
});

// Initialize
loadCategories();
loadTasks();


/* 📝📝📝 RICH TEXT NOTEBOOK TOOLBAR 📝📝📝 */

const notebook = document.getElementById('notebook');

// 🖋 Format Buttons (bold, italic, underline, lists, etc.)
document.querySelectorAll('[data-cmd]').forEach(btn => {
  btn.addEventListener('click', () => {
    notebook.focus(); // Ensure notebook is active
    const cmd = btn.dataset.cmd;
    document.execCommand(cmd, false, null);
  });
});

// 🔠 Heading / Paragraph Dropdown
document.getElementById('formatBlock').addEventListener('change', (e) => {
  notebook.focus(); // Ensure notebook is active
  document.execCommand('formatBlock', false, e.target.value);
});


/* 💾💾💾 NOTEBOOK DOWNLOAD FUNCTION 💾💾💾 */
document.getElementById('downloadNotebookBtn')?.addEventListener('click', () => {
  const content = document.getElementById('notebook').innerHTML || '';
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-notes.html';  // or .txt if you want plain text
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url); // Clean up memory
});

// 📝 Save Notes to localStorage under a notebook name
document.getElementById('saveNotesBtn').addEventListener('click', () => {
  const name = document.getElementById('notebookName').value.trim();
  if (!name) return alert("Please enter a notebook name!");
  const content = document.getElementById('notebook').innerHTML;
  localStorage.setItem(`notes:${name}`, content);
  alert(`Notebook "${name}" saved!`);
});

// 📂 Load Notes from localStorage using the name
document.getElementById('loadNotesBtn').addEventListener('click', () => {
  const name = document.getElementById('notebookName').value.trim();
  if (!name) return alert("Please enter a notebook name!");
  const content = localStorage.getItem(`notes:${name}`);
  if (!content) return alert(`No notebook found with name "${name}".`);
  document.getElementById('notebook').innerHTML = content;
});

// At the end of your setup code:
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('savedNotebook');
  if (saved) {
    document.getElementById('notebook').innerHTML = saved;
  }
});

/* 🍅🍅🍅 POMODORO TIMER 🍅🍅🍅 */

let timer;
let isRunning = false;
let remainingTime = 0;
let sessionType = 'work'; // or 'shortBreak' / 'longBreak'
let pomodoroCount = 0;

const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startTimerBtn');
const pauseBtn = document.getElementById('pauseTimerBtn');
const resetBtn = document.getElementById('resetTimerBtn');
const sessionCountDisplay = document.getElementById('sessionCount');

// Input elements
const workInput = document.getElementById('workDuration');
const shortBreakInput = document.getElementById('shortBreak');
const longBreakInput = document.getElementById('longBreak');
const autoStartCheckbox = document.getElementById('autoStart');

function getDurationInSeconds(type) {
  const minutes = {
    work: parseInt(workInput.value) || 25,
    shortBreak: parseInt(shortBreakInput.value) || 5,
    longBreak: parseInt(longBreakInput.value) || 15,
  }[type];

  return minutes * 60;
}

function updateTimerDisplay() {
  const minutes = Math.floor(remainingTime / 60).toString().padStart(2, '0');
  const seconds = (remainingTime % 60).toString().padStart(2, '0');
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

function startTimer() {
  if (isRunning) return;

  if (remainingTime <= 0) {
    remainingTime = getDurationInSeconds(sessionType);
  }

  isRunning = true;
  timer = setInterval(() => {
    if (remainingTime <= 0) {
      clearInterval(timer);
      isRunning = false;
      handleSessionEnd();
      return;
    }
    remainingTime--;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  remainingTime = getDurationInSeconds(sessionType);
  updateTimerDisplay();
}

function handleSessionEnd() {
  if (sessionType === 'work') {
    pomodoroCount++;
    sessionCountDisplay.textContent = `Pomodoros Today: ${pomodoroCount}`;
    sessionType = (pomodoroCount % 4 === 0) ? 'longBreak' : 'shortBreak';
  } else {
    sessionType = 'work';
  }

  remainingTime = getDurationInSeconds(sessionType);
  updateTimerDisplay();

  if (autoStartCheckbox.checked) {
    startTimer();
  } else {
    alert(`${sessionType === 'work' ? 'Break over! Time to work.' : 'Work session complete! Take a break.'}`);
  }
}

// Listen to manual changes to update the display immediately (optional)
[workInput, shortBreakInput, longBreakInput].forEach(input => {
  input.addEventListener('change', () => {
    if (!isRunning) {
      remainingTime = getDurationInSeconds(sessionType);
      updateTimerDisplay();
    }
  });
});

// Button Events
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Initial state
remainingTime = getDurationInSeconds(sessionType);
updateTimerDisplay();

/* 🚪🚪🚪 BACK TO LOBBY BUTTON 🚪🚪🚪 */

document.getElementById('lobbyBtn')?.addEventListener('click', () => {
  window.location.href = '../game.html';
});