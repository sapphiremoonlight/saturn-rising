const boardEl = document.getElementById('board');
const turnIndicator = document.getElementById('turnIndicator');
const themeSelector = document.getElementById('themeSelector');
const sideSelector = document.getElementById('sideSelector');
const difficultySelector = document.getElementById('difficultySelector');
const whiteGrave = document.getElementById('whiteGrave');
const blackGrave = document.getElementById('blackGrave');
const helpModal = document.getElementById('helpModal');
const endModal = document.getElementById('endModal');
const endMessage = document.getElementById('endMessage');
const pointsDisplay = document.getElementById('pointsDisplay');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const helpBtn = document.getElementById('helpBtn'); // ✅ Added
const playAgainBtn = document.getElementById('playAgainBtn');
const goLobbyBtn = document.getElementById('goLobbyBtn');

//BUTTONS
playAgainBtn.onclick = () => {
    endModal.style.display = 'none';
    initBoard();
};

goLobbyBtn.onclick = () => {
    // Example: go to a lobby page
    window.location.href = '/game.html';
};

let moveHistory = [];
let redoStack = [];
let points = 0;
let board = [];
let selected = null;
let turn = 'white';
let playerSide = 'white';
let gameOver = false;

const pieceMap = {
    P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔",
    p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚"
};

const themes = {
    classic: {
        light: "#f0d9b5",
        dark: "#b58863",
        bg: "radial-gradient(circle at top, #222, #0b0b0b 70%)"
    },
    midnight: {
        light: "#3c4f65",
        dark: "#1c2a3a",
        bg: "radial-gradient(circle at top, #0f2027, #000000)"
    },
    pastel: {
        light: "#f8cdda",
        dark: "#c084fc",
        bg: "radial-gradient(circle at top, #fbc2eb, #a6c1ee)"
    },
    forest: {
        light: "#cfe8cf",   // soft sage
        dark: "#5a7d5a",    // muted forest green
        bg: "radial-gradient(circle at top, #1e2f1e, #0f1a0f 75%)"
    }
};

function applyTheme(name) {
    const t = themes[name];
    document.documentElement.style.setProperty("--light", t.light);
    document.documentElement.style.setProperty("--dark", t.dark);
    document.documentElement.style.setProperty("--bg-main", t.bg);
}

function cloneBoard(b) {
    return b.map(r => [...r]);
}

function initBoard() {
    const setup = [
        'rnbqkbnr',
        'pppppppp',
        '........',
        '........',
        '........',
        '........',
        'PPPPPPPP',
        'RNBQKBNR'
    ];
    board = setup.map(r => r.split(''));
    whiteGrave.innerHTML = '';
    blackGrave.innerHTML = '';
    turn = 'white';
    selected = null;
    gameOver = false;
    moveHistory = [];
    redoStack = [];
    drawBoard();

    if (playerSide === 'black') {
        setTimeout(computerMove, 300);
    }
}

function showEndMessage(msg) { // ✅ Added function
    endMessage.textContent = msg;
    endModal.style.display = 'flex';
}

function makeMove(sr, sc, tr, tc) {
    // Save move for undo
    moveHistory.push({
        board: cloneBoard(board),
        turn
    });
    redoStack = []; // clear redo stack

    const captured = board[tr][tc];

    // Handle captured pieces
    if (captured !== '.') {
        const symbol = pieceMap[captured];
        if (captured === captured.toUpperCase()) {
            whiteGrave.textContent += symbol;
        } else {
            blackGrave.textContent += symbol;
        }

        // Check if a king was captured -> game over
        if (captured.toLowerCase() === 'k') {
            gameOver = true;
            const result = captured === (playerSide === 'white' ? 'K' : 'k')
                ? 'You lost!'
                : 'You won!';
            showEndMessage(result);

            // Award points if player wins
            if (result === 'You won!') {
                const diff = difficultySelector.value;
                points += diff === 'hard' ? 3 : diff === 'medium' ? 2 : 1;
                pointsDisplay.textContent = points;
            }
        }
    }

    // Move piece
    board[tr][tc] = board[sr][sc];
    board[sr][sc] = '.';

    // Pawn promotion
    const movedPiece = board[tr][tc];
    if (movedPiece === 'P' && tr === 0) {
        board[tr][tc] = 'Q'; // White pawn becomes queen
    } else if (movedPiece === 'p' && tr === 7) {
        board[tr][tc] = 'q'; // Black pawn becomes queen
    }

    // Switch turn
    turn = turn === 'white' ? 'black' : 'white';

    // Redraw board
    drawBoard();
}


function undoMove() {
    if (!moveHistory.length) return;

    redoStack.push({
        board: cloneBoard(board),
        turn
    });

    const prev = moveHistory.pop();
    board = cloneBoard(prev.board);
    turn = prev.turn;
    gameOver = false;
    drawBoard();
}

function redoMove() {
    if (!redoStack.length) return;

    moveHistory.push({
        board: cloneBoard(board),
        turn
    });

    const next = redoStack.pop();
    board = cloneBoard(next.board);
    turn = next.turn;
    drawBoard();
}

function computerMove() {
    if (gameOver || turn === playerSide) return;

    const moves = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p !== '.' && isCorrectTurn(p)) {
                for (let tr = 0; tr < 8; tr++) {
                    for (let tc = 0; tc < 8; tc++) {
                        if (!sameColor(p, board[tr][tc]) &&
                            isLegalMove(r, c, tr, tc)) {

                            const value = getPieceValue(board[tr][tc]);
                            moves.push({ r, c, tr, tc, value });
                        }
                    }
                }
            }
        }
    }

    if (!moves.length) return;

    let choice;
    const diff = difficultySelector.value;

    if (diff === 'easy') {
        choice = moves[Math.floor(Math.random() * moves.length)];
    }

    else if (diff === 'medium') {
        const captures = moves.filter(m => m.value > 0);
        choice = captures.length
            ? captures[Math.floor(Math.random() * captures.length)]
            : moves[Math.floor(Math.random() * moves.length)];
    }

    else { // hard
        moves.sort((a, b) => b.value - a.value);
        choice = moves[0];
    }

    makeMove(choice.r, choice.c, choice.tr, choice.tc);
}

function getPieceValue(p) {
    switch (p?.toLowerCase()) {
        case 'p': return 1;
        case 'n':
        case 'b': return 3;
        case 'r': return 5;
        case 'q': return 9;
        case 'k': return 100;
        default: return 0;
    }
}

function isCorrectTurn(piece) {
    return (turn === 'white' && piece === piece.toUpperCase()) ||
        (turn === 'black' && piece === piece.toLowerCase());
}

function sameColor(a, b) {
    if (a === '.' || b === '.') return false;
    return (a === a.toUpperCase()) === (b === b.toUpperCase());
}

function isLegalMove(sr, sc, tr, tc) {
    if (sr === tr && sc === tc) return false;

    const piece = board[sr][sc];
    if (!isCorrectTurn(piece)) return false;
    if (sameColor(piece, board[tr][tc])) return false;

    const dr = tr - sr;
    const dc = tc - sc;

    switch (piece.toLowerCase()) {
        case 'p':
            const dir = piece === 'P' ? -1 : 1;
            if (dc === 0 && board[tr][tc] === '.' && dr === dir) return true;
            if (Math.abs(dc) === 1 && dr === dir && board[tr][tc] !== '.') return true;
            return false;

        case 'r': return dr === 0 || dc === 0;
        case 'b': return Math.abs(dr) === Math.abs(dc);
        case 'q': return dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);
        case 'n': return (Math.abs(dr) === 2 && Math.abs(dc) === 1) ||
            (Math.abs(dr) === 1 && Math.abs(dc) === 2);
        case 'k': return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
    }
    return false;
}

function drawBoard() {
    boardEl.innerHTML = "";

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const sq = document.createElement("div");
            sq.className = "square " + ((r + c) % 2 === 0 ? "light" : "dark");

            // Show piece
            sq.textContent = board[r][c] !== '.' ? pieceMap[board[r][c]] : "";

            // Highlight legal moves if a piece is selected
            if (selected) {
                if (isLegalMove(selected.r, selected.c, r, c)) {
                    sq.classList.add('legal-move');
                }
                // Highlight the selected piece
                if (selected.r === r && selected.c === c) {
                    sq.classList.add('selected');
                }
            }

            // Click handler
            sq.onclick = () => onSquareClick(r, c);

            boardEl.appendChild(sq);
        }
    }

    turnIndicator.textContent =
        turn.charAt(0).toUpperCase() + turn.slice(1) + " to move";
}

function onSquareClick(r, c) {
    if (gameOver || turn !== playerSide) return;

    const piece = board[r][c];

    if (selected) {
        if (isLegalMove(selected.r, selected.c, r, c)) {
            makeMove(selected.r, selected.c, r, c);
            selected = null;
            setTimeout(computerMove, 250);
            return;
        }
        selected = null;
    }

    if (piece !== '.' && isCorrectTurn(piece)) {
        selected = { r, c };
    }
}

undoBtn.onclick = undoMove;
redoBtn.onclick = redoMove;

sideSelector.onchange = e => {
    playerSide = e.target.value;
    initBoard();
};

themeSelector.onchange = e => applyTheme(e.target.value);
helpBtn.onclick = () => helpModal.style.display = "flex";

applyTheme("classic");
initBoard();

// LOADING SCREEN
window.addEventListener("load", () => {
    const loader = document.getElementById("loadingScreen");

    // Show loader briefly, then hide after board is ready
    setTimeout(() => {
        loader.style.opacity = 0;
        loader.style.transition = "opacity 0.5s";
        setTimeout(() => loader.style.display = "none", 500);
    }, 2500); // 1 second minimum loading screen
});
