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

// Randomize the starting position of the puzzle
function getRandomStart() {
    return Math.floor(Math.random() * 100);
}

// Set up the game with updated starting logic
function setupGame() {
    console.log("Setting up the game..."); // Debugging log
    gameBoard.innerHTML = "";
    currentClueIndex = 0;
    moves = 0;
    timer = 0;
    randomStart = getRandomStart();
    clearInterval(gameInterval);
    startTime = Date.now();
    gameInterval = setInterval(updateTimer, 1000);

    // Define the order and clues based on a random starting position
    prizeOrder = [randomStart, randomStart + 12, randomStart + 22, randomStart + 33, randomStart + 45, randomStart + 67, randomStart + 89].map(num => num % 100);
    cluesText = [
        "Start at the highlighted position!",
        "Move two steps to the right.",
        "Move down to the third row.",
        "Find the center!",
        "Head to the bottom row.",
        "Back to the left!",
        "End in the bottom right corner for the prize!"
    ];

    // Create a 10x10 punchboard grid
    for (let i = 0; i < 100; i++) {
        const punch = document.createElement('button');
        punch.classList.add('punch');
        punch.innerText = "Push";
        
        // Highlight the starting position
        if (i === randomStart) {
            punch.classList.add('starting');
        }
        
        punch.addEventListener('click', () => handlePunch(i, punch));
        gameBoard.appendChild(punch);
    }

    // Initialize clues and ultimate prize
    ultimatePrizeLocation = prizeOrder[prizeOrder.length - 1];
    clues = [...prizeOrder];
    updateClue();
    updateMoves();
}

// Corrected logic for handling the punch and advancing to the next clue
function handlePunch(index, punchElement) {
    console.log("handlePunch called with index:", index); // This should log every time a punch is clicked
    if (isPaused) return;

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

// Display the next clue
function updateClue() {
    clueDisplay.innerText = `Clue: ${cluesText[currentClueIndex]}`;
}

// Timer functionality with pause capability
function updateTimer() {
    if (!isPaused) {
        timer = Math.floor((Date.now() - startTime) / 1000);
        timerDisplay.innerText = `Time: ${timer} seconds`;
    }
}

function updateMoves() {
    movesDisplay.innerText = `Moves: ${moves}`;
}

// Winning the game and saving the score
function gameWon() {
    clearInterval(gameInterval);
    clueDisplay.innerText = "Congratulations! You've found the ultimate prize!";
    saveScore();
    displayLeaderboard();
}

// Saving the score and updating the leaderboard
function saveScore() {
    const scores = JSON.parse(localStorage.getItem('rallyeScores') || '[]');
    scores.push({ time: timer, moves });
    scores.sort((a, b) => a.time - b.time || a.moves - b.moves);
    localStorage.setItem('rallyeScores', JSON.stringify(scores.slice(0, 3))); // Keep top 3
}

// Displaying the leaderboard
function displayLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('rallyeScores') || '[]');
    leaderboard.innerHTML = "";
    scores.forEach((score, index) => {
        const li = document.createElement('li');
        li.innerText = `#${index + 1} - Time: ${score.time}s, Moves: ${score.moves}`;
        leaderboard.appendChild(li);
    });
}

// Pause functionality
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

setupGame(); // Initialize the game on load
displayLeaderboard();
