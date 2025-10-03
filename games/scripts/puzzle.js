// 🌌 Global variables
let currentTheme = '';
let currentLevel = '';
let puzzleImage = '';
let puzzlePieces = [];
let puzzleSolved = false;
let currentOrder = [];

// Undo/Redo stacks
let moveHistory = [];
let redoStack = [];

// 🧩 Puzzle data
const puzzleData = {
  'Nature': {
    'Easy': 'nature_easy.jpg',
    'Medium': 'nature_medium.jpg',
    'Hard': 'nature_hard.jpg',
    'Expert': 'nature_expert.jpg'
  },
  'Animals': {
    'Easy': 'animal_easy.jpeg',
    'Medium': 'animal_medium.jpeg',
    'Hard': 'animal_hard.jpg',
    'Expert': 'animal_expert.jpg'
  },
  'Fictional-Characters': {
    'Easy': 'character-easy.jpg',
    'Medium': 'character-medium.jpg',
    'Hard': 'character-hard.jpg',
    'Expert': 'character-expert.jpg'
  },
  'Anime': {
    'Easy': 'anime-easy.jpg',
    'Medium': 'anime-medium.jpg',
    'Hard': 'anime-hard.jpg',
    'Expert': 'anime-expert.jpg'
  },
  'Cosmic': { 
    'Easy': 'cosmic_easy.jpg',
    'Medium': 'cosmic_medium.jpg',
    'Hard': 'cosmic_hard.jpg',
    'Expert': 'cosmic_expert.jpg'
  }
};

// 🌠 Map theme to folder
function getThemeFolder(theme) {
  const themeFolderMap = {
    'Nature': 'nature',
    'Animals': 'animals',
    'Fictional-Characters': 'characters',
    'Anime': 'anime',
    'Cosmic': 'cosmic' 
  };

  return themeFolderMap[theme] || theme.toLowerCase();
}

// 🔘 Theme & Difficulty Selection
document.querySelectorAll('.theme-btn').forEach(button => {
  button.addEventListener('click', () => {
    currentTheme = button.dataset.theme;
    saveProgress(); // Save theme selection
    loadPuzzle();
  });
});

document.querySelectorAll('.difficulty-btn').forEach(button => {
  button.addEventListener('click', () => {
    currentLevel = button.dataset.level;
    saveProgress(); // Save difficulty selection
    loadPuzzle();
  });
});

// 🧠 Save current puzzle state to localStorage
function saveProgress() {
  const state = {
    currentTheme,
    currentLevel,
    currentOrder,
    puzzleSolved
  };
  localStorage.setItem('savedPuzzle', JSON.stringify(state));
}

// 💾 Load puzzle (from selection or resume)
function loadPuzzle(isRestoring = false) {
  if (!currentTheme || !currentLevel) return;

  // Reset move stacks
  moveHistory = [];
  redoStack = [];
  updateUndoRedoButtons();

  // Get image path
  puzzleImage = puzzleData[currentTheme][currentLevel];
  const folder = getThemeFolder(currentTheme);
  document.getElementById('preview-img').src = `images/${folder}/${puzzleImage}`;

  // Generate puzzle pieces
  puzzlePieces = generatePuzzlePieces(puzzleImage);

  // Use saved order or shuffle new
  if (isRestoring && currentOrder.length === puzzlePieces.length) {
    // Use saved currentOrder
  } else {
    currentOrder = [...Array(puzzlePieces.length).keys()];
    currentOrder = shuffleArray([...currentOrder]);
  }

  renderPuzzleGrid();

  if (puzzleSolved) {
    document.getElementById('puzzle-completed').style.display = 'flex';
  } else {
    document.getElementById('puzzle-completed').style.display = 'none';
  }

  saveProgress(); // Save current state
}

// 🧩 Generate grid positions
const cols = 6;
const rows = 5;

function generatePuzzlePieces(image) {
  const pieces = [];
  const xStep = 100 / (cols - 1);
  const yStep = 100 / (rows - 1);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      pieces.push({ x: col * xStep, y: row * yStep });
    }
  }
  return pieces;
}

// 🔀 Shuffle array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 🧱 Render puzzle grid
function renderPuzzleGrid() {
  const puzzleGrid = document.getElementById('puzzle-grid');
  puzzleGrid.innerHTML = '';

  const folder = getThemeFolder(currentTheme);

  currentOrder.forEach((pieceIndex, displayIndex) => {
    const piece = puzzlePieces[pieceIndex];
    const pieceElem = document.createElement('div');
    pieceElem.classList.add('puzzle-piece');
    pieceElem.style.backgroundImage = `url(images/${folder}/${puzzleImage})`;
    pieceElem.style.backgroundPosition = `${piece.x}% ${piece.y}%`;
    pieceElem.dataset.index = pieceIndex;
    pieceElem.setAttribute('draggable', 'true');

    pieceElem.addEventListener('dragstart', dragStart);
    pieceElem.addEventListener('dragover', dragOver);
    pieceElem.addEventListener('drop', dropPiece);

    puzzleGrid.appendChild(pieceElem);
  });

  saveProgress(); // Update saved layout
}

// 🖱️ Drag & Drop Events
function dragStart(event) {
  event.dataTransfer.setData('text/plain', event.target.dataset.index);
}

function dragOver(event) {
  event.preventDefault();
}

function dropPiece(event) {
  event.preventDefault();

  const draggedIndex = event.dataTransfer.getData('text');
  const targetElem = event.target;

  if (!targetElem.classList.contains('puzzle-piece')) return;

  const targetIndex = targetElem.dataset.index;
  if (draggedIndex === targetIndex) return;

  const draggedPos = currentOrder.indexOf(Number(draggedIndex));
  const targetPos = currentOrder.indexOf(Number(targetIndex));

  [currentOrder[draggedPos], currentOrder[targetPos]] = [currentOrder[targetPos], currentOrder[draggedPos]];

  recordMove(draggedPos, targetPos);
  renderPuzzleGrid();
  checkPuzzleCompletion();
}

// 🧩 Completion check
function checkPuzzleCompletion() {
  if (puzzleSolved || currentOrder.length === 0) return;

  const isSolved = currentOrder.every((val, idx) => val === idx);
  if (isSolved) {
    puzzleSolved = true;
    document.getElementById('puzzle-completed').style.display = 'flex';
    saveProgress(); // Save completion
  }
}

// 🧠 Restore from localStorage
window.onload = () => {
  document.getElementById('puzzle-completed').style.display = 'none';

  const saved = JSON.parse(localStorage.getItem('savedPuzzle'));
  if (saved && saved.currentTheme && saved.currentLevel) {
    currentTheme = saved.currentTheme;
    currentLevel = saved.currentLevel;
    currentOrder = saved.currentOrder || [];
    puzzleSolved = saved.puzzleSolved || false;
    loadPuzzle(true); // Load from saved data
  }
};

// 🔁 Undo/Redo
function recordMove(fromPos, toPos) {
  moveHistory.push({ from: fromPos, to: toPos });
  redoStack = [];
  updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
  document.getElementById('undo-btn').disabled = moveHistory.length === 0;
  document.getElementById('redo-btn').disabled = redoStack.length === 0;
}

document.getElementById('undo-btn').addEventListener('click', () => {
  if (moveHistory.length === 0) return;
  const lastMove = moveHistory.pop();
  [currentOrder[lastMove.from], currentOrder[lastMove.to]] = [currentOrder[lastMove.to], currentOrder[lastMove.from]];
  redoStack.push(lastMove);
  renderPuzzleGrid();
  updateUndoRedoButtons();
});

document.getElementById('redo-btn').addEventListener('click', () => {
  if (redoStack.length === 0) return;
  const nextMove = redoStack.pop();
  [currentOrder[nextMove.from], currentOrder[nextMove.to]] = [currentOrder[nextMove.to], currentOrder[nextMove.from]];
  moveHistory.push(nextMove);
  renderPuzzleGrid();
  updateUndoRedoButtons();
});

// ➡️ Next Puzzle
document.getElementById('next-puzzle').addEventListener('click', () => {
  // Hide the modal
  document.getElementById('puzzle-completed').style.display = 'none';

  // Reset puzzle state
  puzzleSolved = false;
  currentTheme = '';
  currentLevel = '';
  currentOrder = [];
  moveHistory = [];
  redoStack = [];

  // Show main menu UI
  document.getElementById('menu').style.display = 'block';
  document.getElementById('puzzle-area').style.display = 'none';

  // Optional: clear saved progress
  localStorage.removeItem('savedPuzzle');
});

// 🔙 Back to Lobby
document.getElementById('back-lobby-btn').addEventListener('click', () => {
  window.location.href = '../game.html'; // Update as needed
});
