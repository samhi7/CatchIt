const gameContainer = document.getElementById('game-container');
const basket = document.getElementById('basket');
const scoreBoard = document.getElementById('score-board');
const livesBoard = document.getElementById('lives-board');
const hiscoreBoard = document.getElementById('hiscore-board');
const gameOverMessage = document.getElementById('game-over');

let score = 0;
let lives=3;
let hiscore = localStorage.getItem('hiscore') || 0;
hiscoreBoard.innerText = 'HighScore: ' + hiscore;
let fallingSpeed = 7;
let basketPosition = gameContainer.offsetWidth / 2 - basket.offsetWidth / 2;
let gameOver=false;
let fallingObjects=[];
let fallingObjectsInterval;

basket.style.left = basketPosition + 'px';


document.addEventListener('mousemove', (event) => {
    if(gameOver)return;
    const gameContainerRect = gameContainer.getBoundingClientRect();
    let newBasketPosition = event.clientX - gameContainerRect.left - basket.offsetWidth / 2;
    if (newBasketPosition < 0) newBasketPosition = 0;
    if (newBasketPosition + basket.offsetWidth > gameContainerRect.width)
        newBasketPosition = gameContainerRect.width - basket.offsetWidth;
    basket.style.left = newBasketPosition + 'px';
});

function createFallingObject() {
    if(gameOver)return;
    const fallingObject = document.createElement('div');
    const isBlackBall = Math.random() < 0.2; // 20% chance for a black ball
    if (isBlackBall) {
        fallingObject.classList.add('black-ball');
    } else {
        fallingObject.classList.add('falling-object');
    }

    fallingObject.style.left = Math.random() * (gameContainer.offsetWidth - 20) + 'px';
    fallingObject.style.top = '0px';
    gameContainer.appendChild(fallingObject);
    fallingObjects.push(fallingObject);
    let fallingInterval = setInterval(() => {
        if (gameOver) {
            clearInterval(fallingInterval); 
            return;
        }
        let topPosition = parseInt(window.getComputedStyle(fallingObject).getPropertyValue('top'));
        if (topPosition >= gameContainer.offsetHeight - basket.offsetHeight - 20) {
            let basketRect = basket.getBoundingClientRect();
            let fallingObjectRect = fallingObject.getBoundingClientRect();

            if (
                fallingObjectRect.left < basketRect.right &&
                fallingObjectRect.right > basketRect.left &&
                fallingObjectRect.bottom >= basketRect.top &&
                fallingObjectRect.top <= basketRect.bottom
            ) {
                if (fallingObject.classList.contains('black-ball')) {
                    lives--;
                    livesBoard.innerText='Lives: '+lives;
                    if (lives === 0) {
                        clearInterval(fallingInterval);
                        endGame();
                    }
                } else {
                    score++;
                    scoreBoard.innerText = 'Score: ' + score;

                    // Increase falling speed every 5 points
                    if (score % 5 === 0) fallingSpeed = Math.min(fallingSpeed + 2, 20);

                    // Update high score
                    if (score > hiscore) {
                        hiscore = score;
                        localStorage.setItem('hiscore', hiscore);
                        hiscoreBoard.innerText = 'HighScore: ' + hiscore;
                    }
                }
                gameContainer.removeChild(fallingObject);
            }
        } 
        if (topPosition >= gameContainer.offsetHeight) {
            clearInterval(fallingInterval);
            gameContainer.removeChild(fallingObject);
        } else {
            fallingObject.style.top = topPosition + fallingSpeed + 'px';
        }
    }, 50);
}

function endGame() {
    // Display Game Over message
    gameOver=true;
    clearInterval(fallingObjectsInterval);
    fallingObjects.forEach((object) => {
        if (gameContainer.contains(object)) {
            object.style.animationPlayState = 'paused'; // Freeze objects
        }// Pause animation (if any)
    });
    gameOverMessage.style.display = 'block';
    gameOverMessage.innerHTML = `
        <div>Game Over!</div>
        <button id="play-again"  onclick="resetGame()"> Play Again
        </button>
    `;
    gameOverMessage.style.position = 'absolute';
    gameOverMessage.style.top = '50%';
    gameOverMessage.style.left = '50%';
    gameOverMessage.style.transform = 'translate(-50%, -50%)';
    gameOverMessage.style.fontSize = '3rem';
    gameOverMessage.style.color = 'red';
    gameOverMessage.style.textAlign = 'center';

    const playAgainButton = document.getElementById('play-again');
    playAgainButton.addEventListener('click', resetGame);
}
function resetGame() {
    // Reset variables
    score = 0;
    lives=3;
    fallingSpeed = 7;
    gameOver = false;
    scoreBoard.innerText = 'Score: ' + score;

    // Remove all falling objects
    fallingObjects.forEach((object) => {
        if (gameContainer.contains(object)) {
            gameContainer.removeChild(object);
        }
    });
    fallingObjects = [];

    // Hide Game Over message
    gameOverMessage.style.display = 'none';

    // Restart creating falling objects
    fallingObjectsInterval = setInterval(createFallingObject, 1000);
}

// Start creating falling objects
fallingObjectsInterval = setInterval(createFallingObject, 1000);

// Handle window resize
window.addEventListener('resize', () => {
    gameContainer.style.width = 'calc(100vw - 20px)';
    gameContainer.style.height = 'calc(100vh - 20px)';
});
