const gameBoard = document.getElementById('game-board');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const clueDisplay = document.getElementById('clue');
const leaderboard = document.getElementById('top-scores');
const resetButton = document.getElementById('reset-game');

let timer = 0;
let moves = 0;
let gameInterval;
let ultimatePrizeLocation;
let clues;
let currentClueIndex = 0;
let startTime;

const prizeOrder = [0, 22, 34, 45, 57, 78, 99]; // Sample sequence to follow
const cluesText = [
    "Start in the top left corner!",
    "Move two steps to the right.",
    "Move down to the third row.",
    "Find the center!",
    "Head to the bottom row.",
    "Back to the left!",
    "End in the bottom right corner for the prize!"
];

function setupGame() {
    gameBoard.innerHTML = "";
    currentClueIndex = 0;
    moves = 0;
    timer = 0;
    clearInterval(gameInterval);
    startTime = Date.now();
    gameInterval = setInterval(updateTimer, 1000);

    // Create a 10x10 punchboard grid
    for (let i = 0; i < 100; i++) {
        const punch = document.createElement('button');
        punch.classList.add('punch');
        punch.innerText = "Push";
        punch.addEventListener('click', () => handlePunch(i, punch));
        gameBoard.appendChild(punch);
    }

    // Initialize clues and ultimate prize
    ultimatePrizeLocation = prizeOrder[prizeOrder.length - 1];
    clues = [...prizeOrder];
    updateClue();
    updateMoves();
}

function handlePunch(index, punchElement) {
    if (index === clues[currentClueIndex]) {
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
    timer = Math.floor((Date.now() - startTime) / 1000);
    timerDisplay.innerText = `Time: ${timer} seconds`;
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

resetButton.addEventListener('click', setupGame);

setupGame(); // Initialize the game on load
displayLeaderboard();
