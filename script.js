const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;
const powerUpRadius = 15;

let player = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#00f",
    dy: 5,
    score: 0,
    powerUp: false
};

let ai = {
    x: canvas.width - 30,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#f00",
    dy: 3,
    score: 0
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballSize,
    dx: 4 * (Math.random() > 0.5 ? 1 : -1),
    dy: 4 * (Math.random() > 0.5 ? 1 : -1),
    speed: 4,
    color: "#fff",
    trail: []
};

let powerUp = {
    x: Math.random() * (canvas.width - 2 * powerUpRadius) + powerUpRadius,
    y: Math.random() * (canvas.height - 2 * powerUpRadius) + powerUpRadius,
    radius: powerUpRadius,
    color: "#0f0",
    active: true
};

let keys = {};
let isPaused = false;
let isGameOver = false;
let isTournamentMode = false;
let isSpectatorMode = false;
let aiEnabled = true;
let powerUpType = "speed";
let powerUpTimer = Date.now();
let powerUpDuration = 10000;
let speedBoost = false;
let speedBoostTimer = Date.now();
let difficultyIncrement = 0;
let aiDifficulties = [1, 1.5, 2, 2.5, 3];
let currentRound = 0;
let tournamentRounds = 5;
let playerWins = 0;
let aiWins = 0;
let totalGames = 0;
let soundEnabled = true;
let colorOptions = ["#00f", "#0f0", "#f00", "#ff0", "#0ff"];
let currentColorIndex = 0;

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(text, x, y);
}

function drawGradient() {
    let gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#000");
    gradient.addColorStop(1, "#444");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawAnimatedScore(score, x, y) {
    const scoreString = score.toString();
    ctx.fillStyle = "#fff";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText(scoreString, x, y);
}

function movePaddle(paddle) {
    if (paddle.y < 0) paddle.y = 0;
    if (paddle.y + paddle.height > canvas.height) paddle.y = canvas.height - paddle.height;
}

function update() {
    if (!isPaused) {
        // Move player paddle
        if (keys["ArrowUp"]) player.y -= player.dy;
        if (keys["ArrowDown"]) player.y += player.dy;
        
        movePaddle(player);

        // Move ball
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // Ball bounce
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.dy *= -1;
        }
        
        // Ball paddle collision
        if (ball.x - ball.radius < player.x + player.width && ball.y > player.y && ball.y < player.y + player.height) {
            ball.dx *= -1;
            ball.speed += 0.1;
            ball.color = `rgba(255, 255, 255, ${Math.random()})`;
        }

        if (ball.x + ball.radius > ai.x && ball.y > ai.y && ball.y < ai.y + ai.height) {
            ball.dx *= -1;
            ball.speed += 0.1;
            ball.color = `rgba(255, 255, 255, ${Math.random()})`;
        }

        if (powerUp.active && ball.x + ball.radius > powerUp.x && ball.x - ball.radius < powerUp.x + powerUp.radius &&
            ball.y + ball.radius > powerUp.y && ball.y - ball.radius < powerUp.y + powerUp.radius) {
            activatePowerUp(player);
            powerUp.active = false;
        }

        if (player.powerUp && Date.now() - powerUpTimer > powerUpDuration) {
            deactivatePowerUp(player);
        }

        if (speedBoost && Date.now() - speedBoostTimer > 5000) {
            ball.speed -= 2;
            speedBoost = false;
        }

        if (isTournamentMode) {
            totalGames = player.score + ai.score;
        }

        if (aiEnabled) {
            if (ball.y > ai.y + ai.height / 2) {
                ai.y += ai.dy * ai.difficulty;
            } else {
                ai.y -= ai.dy * ai.difficulty;
            }
            movePaddle(ai);
        }
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = 4 * (Math.random() > 0.5 ? 1 : -1);
}

function resetPowerUp() {
    powerUp.x = Math.random() * (canvas.width - 2 * powerUpRadius) + powerUpRadius;
    powerUp.y = Math.random() * (canvas.height - 2 * powerUpRadius) + powerUpRadius;
    powerUp.active = true;
}

function activatePowerUp(player) {
    if (powerUpType === "speed") {
        player.powerUp = true;
        speedBoost = true;
        speedBoostTimer = Date.now();
        ball.speed += 2;
    }
}

function deactivatePowerUp(player) {
    player.powerUp = false;
    speedBoost = false;
    ball.speed -= 2;
}

function draw() {
    drawGradient();
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
    if (powerUp.active) {
        drawCircle(powerUp.x, powerUp.y, powerUp.radius, powerUp.color);
    }
    drawAnimatedScore(player.score, canvas.width / 4, 30);
    drawAnimatedScore(ai.score, 3 * canvas.width / 4, 30);
}

function gameLoop() {
    if (!isPaused) {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

document.getElementById("pauseButton").addEventListener("click", () => {
    isPaused = true;
    document.getElementById("pauseButton").style.display = "none";
    document.getElementById("resumeButton").style.display = "block";
});

document.getElementById("resumeButton").addEventListener("click", () => {
    isPaused = false;
    document.getElementById("resumeButton").style.display = "none";
    document.getElementById("pauseButton").style.display = "block";
});

document.getElementById("startTournamentButton").addEventListener("click", () => {
    isTournamentMode = true;
    player.score = 0;
    ai.score = 0;
    resetBall();
    resetPowerUp();
});

document.getElementById("spectatorModeButton").addEventListener("click", () => {
    isSpectatorMode = !isSpectatorMode;
    if (isSpectatorMode) {
        document.getElementById("spectatorModeButton").textContent = "Spectator Mode: On";
    } else {
        document.getElementById("spectatorModeButton").textContent = "Spectator Mode: Off";
    }
});

document.getElementById("changeColorButton").addEventListener("click", () => {
    currentColorIndex = (currentColorIndex + 1) % colorOptions.length;
    player.color = colorOptions[currentColorIndex];
    ai.color = colorOptions[currentColorIndex];
});

document.getElementById("togglePowerUpButton").addEventListener("click", () => {
    powerUpType = powerUpType === "speed" ? "none" : "speed";
});

document.getElementById("speedBoostButton").addEventListener("click", () => {
    speedBoost = true;
    speedBoostTimer = Date.now();
    ball.speed += 2;
});

document.getElementById("difficultyIncreaseButton").addEventListener("click", () => {
    difficultyIncrement++;
    ai.difficulty = aiDifficulties[difficultyIncrement % aiDifficulties.length];
});

document.getElementById("resetGameButton").addEventListener("click", () => {
    player.score = 0;
    ai.score = 0;
    resetBall();
    resetPowerUp();
    isGameOver = false;
});

document.getElementById("toggleAIButton").addEventListener("click", () => {
    aiEnabled = !aiEnabled;
    document.getElementById("toggleAIButton").textContent = aiEnabled ? "Disable AI" : "Enable AI";
});

document.getElementById("showStatisticsButton").addEventListener("click", () => {
    document.getElementById("statistics").style.display = "block";
    document.getElementById("playerWins").textContent = playerWins;
    document.getElementById("aiWins").textContent = aiWins;
    document.getElementById("totalGames").textContent = totalGames;
});

document.getElementById("toggleSoundButton").addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    document.getElementById("toggleSoundButton").textContent = soundEnabled ? "Sound Off" : "Sound On";
});

document.getElementById("setCustomColorButton").addEventListener("click", () => {
    document.getElementById("customColorPicker").style.display = "block";
});

document.getElementById("applyPaddleColorButton").addEventListener("click", () => {
    const color = document.getElementById("paddleColor").value;
    player.color = color;
    ai.color = color;
});

document.getElementById("applyBallColorButton").addEventListener("click", () => {
    ball.color = document.getElementById("ballColor").value;
});

document.getElementById("applyPowerUpColorButton").addEventListener("click", () => {
    powerUp.color = document.getElementById("powerUpColor").value;
});

gameLoop();
