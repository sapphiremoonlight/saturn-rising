// Global variables
let currentTheme = '';
let currentLevel = '';
let puzzleImage = '';
let puzzlePieces = [];
let puzzleSolved = false;
let currentOrder = [];

// Undo/Redo stacks
let moveHistory = [];
let redoStack = [];

// Puzzle data (simplified for now)
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
    'Hard': 'animal_hard.jpeg',
    'Expert': 'animal_expert.jpg'
  },
  // Add other themes and their corresponding difficulty images here
};

// Handle theme and difficulty selection
document.querySelectorAll('.theme-btn').forEach(button => {
  button.addEventListener('click', () => {
    currentTheme = button.dataset.theme;
    loadPuzzle();
  });
});

document.querySelectorAll('.difficulty-btn').forEach(button => {
  button.addEventListener('click', () => {
    currentLevel = button.dataset.level;
    loadPuzzle();
  });
});

// Load puzzle based on theme and difficulty
function loadPuzzle() {
  if (!currentTheme || !currentLevel) {
    return;
  }

  // Reset undo/redo stacks and buttons
  moveHistory = [];
  redoStack = [];
  updateUndoRedoButtons();

  // Set the puzzle image
  puzzleImage = puzzleData[currentTheme][currentLevel];
  document.getElementById('preview-img').src = `images/${puzzleImage}`;

  // Generate puzzle pieces
  puzzlePieces = generatePuzzlePieces(puzzleImage);

  // Initialize currentOrder array representing the order of pieces
  currentOrder = [...Array(puzzlePieces.length).keys()];

  // Create shuffled pieces order for display
  const shuffledOrder = shuffleArray([...currentOrder]);

  currentOrder = [...shuffledOrder]; // Update currentOrder with shuffled positions

  renderPuzzleGrid();

  puzzleSolved = false;
  document.getElementById('puzzle-completed').style.display = 'none';
}

// Generate mock puzzle pieces (for simplicity)
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

// Shuffle array helper
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Render the puzzle grid from currentOrder array
function renderPuzzleGrid() {
  const puzzleGrid = document.getElementById('puzzle-grid');
  puzzleGrid.innerHTML = '';

  currentOrder.forEach((pieceIndex, displayIndex) => {
    const piece = puzzlePieces[pieceIndex];
    const pieceElem = document.createElement('div');
    pieceElem.classList.add('puzzle-piece');
    pieceElem.style.backgroundImage = `url(images/${puzzleImage})`;
    pieceElem.style.backgroundPosition = `${piece.x}% ${piece.y}%`;
    pieceElem.dataset.index = pieceIndex; // The *correct* position of this piece
    pieceElem.setAttribute('draggable', 'true');

    pieceElem.addEventListener('dragstart', dragStart);
    pieceElem.addEventListener('dragover', dragOver);
    pieceElem.addEventListener('drop', dropPiece);

    puzzleGrid.appendChild(pieceElem);
  });
}

// Drag-and-Drop functionality
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

  if (draggedIndex === targetIndex) return; // Dropped on same piece, ignore

  // Find positions in currentOrder array (display positions)
  const draggedPos = currentOrder.indexOf(Number(draggedIndex));
  const targetPos = currentOrder.indexOf(Number(targetIndex));

  // Swap pieces in currentOrder
  [currentOrder[draggedPos], currentOrder[targetPos]] = [currentOrder[targetPos], currentOrder[draggedPos]];

  // Record move for undo/redo
  recordMove(draggedPos, targetPos);

  renderPuzzleGrid();

  checkPuzzleCompletion();
}

// Check if the puzzle is completed
function checkPuzzleCompletion() {
  if (puzzleSolved) return;

  // Puzzle solved if currentOrder is sorted ascending
  const isSolved = currentOrder.every((val, idx) => val === idx);

  if (isSolved) {
    puzzleSolved = true;
    document.getElementById('puzzle-completed').style.display = 'flex';
  }
}

// History and Undo/Redo functionality
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

  // Swap pieces back
  [currentOrder[lastMove.from], currentOrder[lastMove.to]] = [currentOrder[lastMove.to], currentOrder[lastMove.from]];

  redoStack.push(lastMove);

  renderPuzzleGrid();
  updateUndoRedoButtons();
});

document.getElementById('redo-btn').addEventListener('click', () => {
  if (redoStack.length === 0) return;

  const nextMove = redoStack.pop();

  // Swap pieces again
  [currentOrder[nextMove.from], currentOrder[nextMove.to]] = [currentOrder[nextMove.to], currentOrder[nextMove.from]];

  moveHistory.push(nextMove);

  renderPuzzleGrid();
  updateUndoRedoButtons();
});

// Next puzzle button
document.getElementById('next-puzzle').addEventListener('click', () => {
  document.getElementById('puzzle-completed').style.display = 'none';
  loadPuzzle(); // Load next puzzle
});

// Back to Lobby button
document.getElementById('back-lobby-btn').addEventListener('click', () => {
  // Redirect to lobby page (update URL accordingly)
  window.location.href = '../game.html'; // or your lobby URL
});
