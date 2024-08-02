const canvas = document.getElementById("pongCanvas");
const context = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 10;
const maxScore = 10;
const powerUpRadius = 15;
const powerUpDuration = 5000; // 5 seconds
const aiDifficulties = [0.1, 0.2, 0.3, 0.4, 0.5]; // Different levels of difficulty
const colorOptions = ["#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6"]; // Paddle color options

let powerUpActive = false;
let powerUpTimer = 0;
let currentColorIndex = 0;

const player = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: colorOptions[currentColorIndex],
    dy: 5,
    score: 0,
    powerUp: false
};

const ai = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#e74c3c",
    dy: 5,
    score: 0,
    powerUp: false,
    difficulty: aiDifficulties[0]
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speed: 4,
    dx: 4,
    dy: 4,
    color: "#fff",
    trail: [],
    trailEffect: 0.1 // Trail effect intensity
};

const powerUp = {
    x: Math.random() * (canvas.width - 2 * powerUpRadius) + powerUpRadius,
    y: Math.random() * (canvas.height - 2 * powerUpRadius) + powerUpRadius,
    radius: powerUpRadius,
    color: "#f1c40f",
    active: true
};

const tournamentRounds = 3;
let currentRound = 0;
let isPaused = false;
let isGameOver = false;
let difficulty = 1;
let isTournamentMode = false;
let isSpectatorMode = false;

function drawRect(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
}

function drawText(text, x, y, color, fontSize = "32px") {
    context.fillStyle = color;
    context.font = `${fontSize} Arial`;
    context.fillText(text, x, y);
}

function drawGradient() {
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#2980b9");
    gradient.addColorStop(1, "#8e44ad");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawAnimatedScore(score, x, y) {
    context.font = "48px Arial";
    const scoreString = score.toString();
    const textWidth = context.measureText(scoreString).width;
    for (let i = 0; i < scoreString.length; i++) {
        context.fillStyle = `rgba(255, 255, 255, ${Math.sin(Date.now() / 500)})`;
        context.fillText(scoreString[i], x + i * (textWidth / scoreString.length), y);
    }
}

function movePaddle(paddle) {
    if (paddle.y < 0) {
        paddle.y = 0;
    } else if (paddle.y + paddle.height > canvas.height) {
        paddle.y = canvas.height - paddle.height;
    }
}

function update() {
    if (!isPaused && !isGameOver) {
        ball.x += ball.dx;
        ball.y += ball.dy;

        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 20) {
            ball.trail.shift();
        }

        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.dy *= -1;
        }

        if (ball.x + ball.radius > canvas.width) {
            player.score++;
            if (player.score >= maxScore) {
                if (currentRound < tournamentRounds - 1) {
                    currentRound++;
                    resetRound();
                } else {
                    isGameOver = true;
                }
            } else {
                resetBall();
            }
        }

        if (ball.x - ball.radius < 0) {
            ai.score++;
            if (ai.score >= maxScore) {
                if (currentRound < tournamentRounds - 1) {
                    currentRound++;
                    resetRound();
                } else {
                    isGameOver = true;
                }
            } else {
                resetBall();
            }
        }

        if (ball.x - ball.radius < player.x + player.width && ball.y > player.y && ball.y < player.y + player.height) {
            ball.dx *= -1;
            ball.speed += 0.5 * difficulty;
        }

        if (ball.x + ball.radius > ai.x && ball.y > ai.y && ball.y < ai.y + ai.height) {
            ball.dx *= -1;
            ball.speed += 0.5 * difficulty;
        }

        ai.y += (ball.y - (ai.y + ai.height / 2)) * ai.difficulty * difficulty;

        if (isSpectatorMode) {
            if (ball.x + ball.radius > spectatorAI.x && ball.y > spectatorAI.y && ball.y < spectatorAI.y + spectatorAI.height) {
                ball.dx *= -1;
                ball.speed += 0.5 * difficulty;
            }
        }

        movePaddle(player);
        movePaddle(ai);

        if (powerUp.active) {
            if (ball.x - ball.radius < powerUp.x + powerUp.radius && ball.x + ball.radius > powerUp.x - powerUp.radius &&
                ball.y - ball.radius < powerUp.y + powerUp.radius && ball.y + ball.radius > powerUp.y - powerUp.radius) {
                powerUp.active = false;
                activatePowerUp(player);
            }
        } else {
            if (Date.now() - powerUpTimer > 10000) { // New power-up every 10 seconds
                resetPowerUp();
            }
        }

        if (player.powerUp && Date.now() - powerUpTimer > powerUpDuration) {
            deactivatePowerUp(player);
        }

        // Adaptive AI Difficulty
        if (player.score > ai.score) {
            ai.difficulty = aiDifficulties[Math.min(player.score, aiDifficulties.length - 1)];
        } else {
            ai.difficulty = aiDifficulties[Math.min(ai.score, aiDifficulties.length - 1)];
        }
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.trail = [];
}

function resetPowerUp() {
    powerUp.x = Math.random() * (canvas.width - 2 * powerUpRadius) + powerUpRadius;
    powerUp.y = Math.random() * (canvas.height - 2 * powerUpRadius) + powerUpRadius;
    powerUp.active = true;
    powerUpTimer = Date.now();
}

function activatePowerUp(player) {
    player.powerUp = true;
    player.color = "#e67e22";
    powerUpTimer = Date.now();
}

function deactivatePowerUp(player) {
    player.powerUp = false;
    player.color = colorOptions[currentColorIndex];
}

function resetRound() {
    resetBall();
    resetPowerUp();
    ai.y = canvas.height / 2 - ai.height / 2;
    player.y = canvas.height / 2 - player.height / 2;
    isGameOver = false;
}

function render() {
    drawGradient();

    if (isSpectatorMode) {
        drawRect(spectatorAI.x, spectatorAI.y, spectatorAI.width, spectatorAI.height, spectatorAI.color);
    } else {
        drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    }

    drawRect(player.x, player.y, player.width, player.height, player.color);

    ball.trail.forEach((point, index) => {
        const opacity = 1 - (index / ball.trail.length);
        drawCircle(point.x, point.y, ball.radius, `rgba(255, 255, 255, ${opacity})`);
    });

    drawCircle(ball.x, ball.y, ball.radius, ball.color);

    if (powerUp.active) {
        drawCircle(powerUp.x, powerUp.y, powerUp.radius, powerUp.color);
    }

    drawAnimatedScore(player.score, canvas.width / 4, 50);
    drawAnimatedScore(ai.score, (3 * canvas.width) / 4, 50);
    drawText(`Round ${currentRound + 1} of ${tournamentRounds}`, canvas.width / 2, canvas.height - 50, "#fff");

    if (isGameOver) {
        drawText("Game Over! Press 'R' to Restart", canvas.width / 2, canvas.height / 2, "#fff");
    }
}

function gameLoop() {
    if (!isPaused) {
        update();
    }
    render();
    requestAnimationFrame(gameLoop);
}

function pauseGame() {
    isPaused = true;
    document.getElementById("pauseButton").style.display = "none";
    document.getElementById("resumeButton").style.display = "block";
}

function resumeGame() {
    isPaused = false;
    document.getElementById("pauseButton").style.display = "block";
    document.getElementById("resumeButton").style.display = "none";
}

function startTournament() {
    currentRound = 0;
    player.score = 0;
    ai.score = 0;
    resetRound();
    isTournamentMode = true;
    document.getElementById("startTournamentButton").style.display = "none";
}

function toggleSpectatorMode() {
    isSpectatorMode = !isSpectatorMode;
    document.getElementById("spectatorModeButton").textContent = isSpectatorMode ? "Player Mode" : "Spectator Mode";
    resetRound();
}

function changePaddleColor() {
    currentColorIndex = (currentColorIndex + 1) % colorOptions.length;
    player.color = colorOptions[currentColorIndex];
}

document.getElementById("pauseButton").addEventListener("click", pauseGame);
document.getElementById("resumeButton").addEventListener("click", resumeGame);
document.getElementById("startTournamentButton").addEventListener("click", startTournament);
document.getElementById("spectatorModeButton").addEventListener("click", toggleSpectatorMode);
document.getElementById("changeColorButton").addEventListener("click", changePaddleColor);

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
        player.y -= player.dy;
    } else if (e.key === "ArrowDown") {
        player.y += player.dy;
    } else if (e.key === "r" || e.key === "R") {
        if (isGameOver) {
            resetRound();
        }
    } else if (e.key >= "1" && e.key <= "5") {
        difficulty = aiDifficulties[e.key - 1];
    }
});

resetBall();
resetPowerUp();
gameLoop();
