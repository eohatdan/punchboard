const gameBoard = document.getElementById('game-board');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const clueDisplay = document.getElementById('clue');
const leaderboard = document.getElementById('top-scores');
const resetButton = document.getElementById('reset-game');
const pauseButton = document.getElementById('pause-game');

let timer = 0;
let moves = 0;
let gameInterval;
let ultimatePrizeLocation;
let clues;
let currentClueIndex = 0;
let startTime;
let isPaused = false;
let randomStart;
const boardSize = 10; // Assuming a 10x10 grid

// Randomize the starting position of the puzzle
function getRandomStart() {
    return Math.floor(Math.random() * (boardSize * boardSize));
}

// Calculate a new position based on dx and dy
function calculatePosition(currentPos, dx, dy, boardSize) {
    const currentRow = Math.floor(currentPos / boardSize);
    const currentCol = currentPos % boardSize;

    const newRow = currentRow + dy;
    const newCol = currentCol + dx;

    // Ensure the new position is within the grid boundaries
    if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
        return newRow * boardSize + newCol; // Convert (row, col) back to 1D index
    }
    return null; // Invalid move
}

function setupGame() {
    console.log("Setting up the game...");
    gameBoard.innerHTML = "";
    currentClueIndex = 0;
    moves = 0;
    timer = 0;
    randomStart = getRandomStart();
    clearInterval(gameInterval);
    startTime = Date.now();
    gameInterval = setInterval(updateTimer, 1000);

    prizeOrder = [];
    cluesText = [];

    // Add the starting position
    prizeOrder.push(randomStart);
    cluesText.push("Start at the highlighted position!");

    // Dynamically add the next positions and clues
    let currentPos = randomStart;

    const movesSequence = [
        { dx: 2, dy: 0, clue: "Move two steps to the right." },
        { dx: 0, dy: 2, clue: "Move down two rows." },
        { dx: -3, dy: 0, clue: "Move three steps to the left." },
        { dx: 0, dy: -1, clue: "Move up one row." },
    ];

    movesSequence.forEach(move => {
        const nextPos = calculatePosition(currentPos, move.dx, move.dy, boardSize);
        if (nextPos !== null) {
            prizeOrder.push(nextPos);
            cluesText.push(move.clue);
            currentPos = nextPos;
        }
    });

    // Ensure ultimate prize is the last position
    ultimatePrizeLocation = prizeOrder[prizeOrder.length - 1];

    // Create the game board
    for (let i = 0; i < boardSize * boardSize; i++) {
        const punch = document.createElement('button');
        punch.classList.add('punch');
        punch.innerText = "Push";

        // Highlight starting position
        if (i === randomStart) {
            punch.classList.add('starting');
        }

        punch.addEventListener('click', () => handlePunch(i, punch));
        gameBoard.appendChild(punch);
    }

    updateClue();
    updateMoves();
}

function handlePunch(index, punchElement) {
    if (isPaused) return;

    if (index === prizeOrder[currentClueIndex]) {
        punchElement.classList.add('clicked');
        moves++;
        currentClueIndex++;

        if (index === ultimatePrizeLocation) {
            gameWon();
        } else {
            updateClue();
            updateMoves();
        }
    } else {
        clueDisplay.innerText = "Wrong punch! Try again based on the last clue.";
    }
}

function updateClue() {
    clueDisplay.innerText = `Clue: ${cluesText[currentClueIndex]}`;
}

function updateTimer() {
    if (!isPaused) {
        timer = Math.floor((Date.now() - startTime) / 1000);
        timerDisplay.innerText = `Time: ${timer} seconds`;
    }
}

function updateMoves() {
    movesDisplay.innerText = `Moves: ${moves}`;
}

function gameWon() {
    clearInterval(gameInterval);
    clueDisplay.innerText = "Congratulations! You've found the ultimate prize!";
    saveScore();
    displayLeaderboard();
}

function saveScore() {
    const scores = JSON.parse(localStorage.getItem('rallyeScores') || '[]');
    scores.push({ time: timer, moves });
    scores.sort((a, b) => a.time - b.time || a.moves - b.moves);
    localStorage.setItem('rallyeScores', JSON.stringify(scores.slice(0, 3))); // Keep top 3
}

function displayLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('rallyeScores') || '[]');
    leaderboard.innerHTML = "";
    scores.forEach((score, index) => {
        const li = document.createElement('li');
        li.innerText = `#${index + 1} - Time: ${score.time}s, Moves: ${score.moves}`;
        leaderboard.appendChild(li);
    });
}

pauseButton.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseButton.innerText = isPaused ? "Resume" : "Pause";
    if (isPaused) {
        clearInterval(gameInterval);
    } else {
        startTime = Date.now() - timer * 1000;
        gameInterval = setInterval(updateTimer, 1000);
    }
});

resetButton.addEventListener('click', setupGame);

setupGame();
displayLeaderboard();
