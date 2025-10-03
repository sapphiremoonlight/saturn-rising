const GRID_SIZE = 10;

let player = { x: 0, y: 0, name: '', img: '' };
let treasure = { x: GRID_SIZE - 1, y: GRID_SIZE - 1 };
let enemies = [];
let gameOver = false;

const gameEl = document.getElementById('game');
const statusEl = document.getElementById('status');
const difficultySelect = document.getElementById('difficulty');
const restartBtn = document.getElementById('restartBtn');
const lobbyBtn = document.getElementById('lobbyBtn');
const playerSelectDiv = document.getElementById('playerSelect');
const playerOptionsDiv = playerSelectDiv.querySelector('.player-options');
const controlsDiv = document.getElementById('controls');
const touchControlsDiv = document.getElementById('touchControls');
const selectedPlayerDiv = document.getElementById('selectedPlayer');
const playerNameSpan = document.getElementById('playerName');
const playerImgEl = document.getElementById('playerImg');
const backToSelectBtn = document.getElementById('backToSelect');

const players = [
  { name: 'Clawdeen', img: 'images/players/clawdeen.png' },
  { name: 'Cleo', img: 'images/players/cleo.png' },
  { name: 'Scarah-Screams', img: 'images/players/scarah-screams.png' },
  { name: 'Stella', img: 'images/players/stella.png' },
  { name: 'Musa', img: 'images/players/musa.png' },
  { name: 'Draculaura', img: 'images/players/draculaura.png' },
  { name: 'Flora', img: 'images/players/flora.png' },
];

// Images for treasure and enemy
const treasureImgSrc = 'images/chest.png';
const enemyImgSrc = 'images/skull.png';

// Preload images to avoid flicker
players.forEach(p => {
  const img = new Image();
  img.src = p.img;
});
const preloadTreasure = new Image();
preloadTreasure.src = treasureImgSrc;
const preloadEnemy = new Image();
preloadEnemy.src = enemyImgSrc;

function setupPlayerSelection() {
  players.forEach((p, index) => {
    const div = document.createElement('div');
    div.classList.add('player-option');
    div.tabIndex = 0;
    div.innerHTML = `<img src="${p.img}" alt="${p.name}" /><div>${p.name}</div>`;
    div.addEventListener('click', () => selectPlayer(index));
    div.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        selectPlayer(index);
      }
    });
    playerOptionsDiv.appendChild(div);
  });
}

function selectPlayer(index) {
  playerSelectDiv.style.display = 'none';
  controlsDiv.style.display = 'flex';
  touchControlsDiv.style.display = 'flex';
  selectedPlayerDiv.style.display = 'block';
  backToSelectBtn.style.display = 'inline-block';
  restartBtn.style.display = 'none';

  player.name = players[index].name;
  player.img = players[index].img;

  playerNameSpan.textContent = player.name;
  playerImgEl.src = player.img;
  playerImgEl.alt = player.name;

  restartGame();
}

function initEnemies() {
  const difficulty = difficultySelect.value;
  let enemyCount;
  if (difficulty === 'easy') enemyCount = 2;
  else if (difficulty === 'medium') enemyCount = 4;
  else enemyCount = 6;

  enemies = [];
  while (enemies.length < enemyCount) {
    const e = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    if (
      (e.x !== player.x || e.y !== player.y) &&
      (e.x !== treasure.x || e.y !== treasure.y)
    ) {
      if (!enemies.some(en => en.x === e.x && en.y === e.y)) {
        enemies.push(e);
      }
    }
  }
}

function drawGrid() {
  gameEl.innerHTML = '';

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');

      if (player.x === x && player.y === y) {
        const img = document.createElement('img');
        img.src = player.img;
        img.alt = player.name;
        cell.appendChild(img);
      } else if (treasure.x === x && treasure.y === y) {
        const img = document.createElement('img');
        img.src = treasureImgSrc;
        img.alt = 'Treasure Chest';
        cell.appendChild(img);
      } else {
        const enemyHere = enemies.find(e => e.x === x && e.y === y);
        if (enemyHere) {
          const img = document.createElement('img');
          img.src = enemyImgSrc;
          img.alt = 'Enemy Skull';
          cell.appendChild(img);
        }
      }

      gameEl.appendChild(cell);
    }
  }

  checkStatus();
}

function movePlayer(dx, dy) {
  if (gameOver) return;

  const newX = player.x + dx;
  const newY = player.y + dy;

  if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;

  player.x = newX;
  player.y = newY;

  moveEnemies();
  drawGrid();
}

function moveEnemies() {
  const difficulty = difficultySelect.value;

  enemies.forEach(e => {
    const dx = Math.sign(player.x - e.x);
    const dy = Math.sign(player.y - e.y);
    let moveChance = 0.7;

    if (difficulty === 'easy') moveChance = 0.5;
    else if (difficulty === 'hard') moveChance = 0.9;

    if (Math.random() < moveChance) {
      if (Math.random() > 0.5) e.x += dx;
      else e.y += dy;

      e.x = Math.max(0, Math.min(GRID_SIZE - 1, e.x));
      e.y = Math.max(0, Math.min(GRID_SIZE - 1, e.y));
    }
  });
}

function checkStatus() {
  if (player.x === treasure.x && player.y === treasure.y) {
    statusEl.textContent = 'You found the treasure! 🎉';
    gameOver = true;
    restartBtn.style.display = 'inline-block';
  } else if (enemies.some(e => e.x === player.x && e.y === player.y)) {
    statusEl.textContent = 'You were caught by an enemy! Game Over ☠';
    gameOver = true;
    restartBtn.style.display = 'inline-block';
  } else {
    statusEl.textContent = 'Use arrow keys or touch buttons to move. Reach the treasure!';
  }
}

document.addEventListener('keydown', e => {
  if (gameOver) return;
  if (e.key === 'ArrowUp') movePlayer(0, -1);
  else if (e.key === 'ArrowDown') movePlayer(0, 1);
  else if (e.key === 'ArrowLeft') movePlayer(-1, 0);
  else if (e.key === 'ArrowRight') movePlayer(1, 0);
});

document.querySelectorAll('.touch-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (gameOver) return;
    const dir = btn.dataset.dir;
    if (dir === 'up') movePlayer(0, -1);
    else if (dir === 'down') movePlayer(0, 1);
    else if (dir === 'left') movePlayer(-1, 0);
    else if (dir === 'right') movePlayer(1, 0);
  });
});

difficultySelect.addEventListener('change', () => {
  restartGame();
});

restartBtn.addEventListener('click', () => {
  restartGame();
});

lobbyBtn.addEventListener('click', () => {
  window.location.href = '../game.html';
});

function restartGame() {
  player.x = 0;
  player.y = 0;
  treasure.x = GRID_SIZE - 1;
  treasure.y = GRID_SIZE - 1;
  gameOver = false;
  restartBtn.style.display = 'none';
  initEnemies();
  drawGrid();
}

function createSparkles(x, y) {
  for (let i = 0; i < 8; i++) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');

    const offsetX = (Math.random() - 0.5) * 80;
    const offsetY = (Math.random() - 0.5) * 80;

    sparkle.style.left = `${x + offsetX}px`;
    sparkle.style.top = `${y + offsetY}px`;

    document.body.appendChild(sparkle);

    setTimeout(() => sparkle.remove(), 800);
  }
}

// Start with player selection UI
setupPlayerSelection();

backToSelectBtn.addEventListener('click', () => {
  const rect = backToSelectBtn.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  createSparkles(centerX, centerY);

  // Reset to character selection screen
  playerSelectDiv.style.display = 'block';
  controlsDiv.style.display = 'none';
  touchControlsDiv.style.display = 'none';
  selectedPlayerDiv.style.display = 'none';
  restartBtn.style.display = 'none';
  statusEl.textContent = '';
  gameEl.innerHTML = '';
  backToSelectBtn.style.display = 'none';
});
