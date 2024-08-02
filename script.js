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
let powerUpActive = false;
let powerUpTimer = 0;

const player = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#3498db",
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
    difficulty: aiDifficulties[0] // Start with the easiest difficulty
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speed: 4,
    dx: 4,
    dy: 4,
    color: "#fff",
    trail: []
};

const powerUp = {
    x: Math.random() * (canvas.width - 2 * powerUpRadius) + powerUpRadius,
    y: Math.random() * (canvas.height - 2 * powerUpRadius) + powerUpRadius,
    radius: powerUpRadius,
    color: "#f1c40f",
    active: true
};

let isPaused = false;
let isGameOver = false;
let difficulty = 1;

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

function drawText(text, x, y, color) {
    context.fillStyle = color;
    context.font = "32px Arial";
    context.fillText(text, x, y);
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
        if (ball.trail.length > 10) {
            ball.trail.shift();
        }

        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.dy *= -1;
        }

        if (ball.x + ball.radius > canvas.width) {
            player.score++;
            resetBall();
        }

        if (ball.x - ball.radius < 0) {
            ai.score++;
            resetBall();
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

        movePaddle(player);
        movePaddle(ai);

        if (player.score === maxScore || ai.score === maxScore) {
            isGameOver = true;
        }

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
    powerUpTimer = Date.now();
    player.color = "#2ecc71"; // Change color to indicate power-up
    player.dy *= 2; // Increase paddle speed
}

function deactivatePowerUp(player) {
    player.powerUp = false;
    player.color = "#3498db"; // Revert color
    player.dy /= 2; // Revert paddle speed
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);

    for (let i = 0; i < ball.trail.length; i++) {
        const alpha = i / ball.trail.length;
        drawCircle(ball.trail[i].x, ball.trail[i].y, ball.radius, `rgba(255, 255, 255, ${alpha})`);
    }

    drawCircle(ball.x, ball.y, ball.radius, ball.color);

    if (powerUp.active) {
        drawCircle(powerUp.x, powerUp.y, powerUp.radius, powerUp.color);
    }

    drawText(player.score, canvas.width / 4, canvas.height / 5, "#fff");
    drawText(ai.score, 3 * canvas.width / 4, canvas.height / 5, "#fff");

    if (isGameOver) {
        drawText("Game Over", canvas.width / 2 - 80, canvas.height / 2, "#fff");
        drawText("Press R to Restart", canvas.width / 2 - 120, canvas.height / 2 + 40, "#fff");
    }
}

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener("mousemove", function (event) {
    let rect = canvas.getBoundingClientRect();
    player.y = event.clientY - rect.top - player.height / 2;
});

document.getElementById("pauseButton").addEventListener("click", function () {
    isPaused = true;
    document.getElementById("pauseButton").style.display = "none";
    document.getElementById("resumeButton").style.display = "inline";
});

document.getElementById("resumeButton").addEventListener("click", function () {
    isPaused = false;
    document.getElementById("resumeButton").style.display = "none";
    document.getElementById("pauseButton").style.display = "inline";
});

document.addEventListener("keydown", function (event) {
    if (event.key === "r" || event.key === "R") {
        if (isGameOver) {
            player.score = 0;
            ai.score = 0;
            isGameOver = false;
            resetBall();
        }
    } else if (event.key === "1") {
        difficulty = 1;
        ai.difficulty = aiDifficulties[0];
    } else if (event.key === "2") {
        difficulty = 2;
        ai.difficulty = aiDifficulties[1];
    } else if (event.key === "3") {
        difficulty = 3;
        ai.difficulty = aiDifficulties[2];
    } else if (event.key === "4") {
        difficulty = 4;
        ai.difficulty = aiDifficulties[3];
    } else if (event.key === "5") {
        difficulty = 5;
        ai.difficulty = aiDifficulties[4];
    }
});

resetBall();
resetPowerUp();
gameLoop();
