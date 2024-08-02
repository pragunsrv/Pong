const canvas = document.getElementById("pongCanvas");
const context = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 10;
const maxScore = 10; // Set the maximum score to end the game

const player = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#3498db",
    dy: 5,
    score: 0
};

const ai = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#e74c3c",
    dy: 5,
    score: 0
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

let isPaused = false;
let isGameOver = false;

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
            ball.speed += 0.5;
        }

        if (ball.x + ball.radius > ai.x && ball.y > ai.y && ball.y < ai.y + ai.height) {
            ball.dx *= -1;
            ball.speed += 0.5;
        }

        ai.y += (ball.y - (ai.y + ai.height / 2)) * 0.1;

        movePaddle(player);
        movePaddle(ai);

        if (player.score === maxScore || ai.score === maxScore) {
            isGameOver = true;
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

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);

    for (let i = 0; i < ball.trail.length; i++) {
        const alpha = i / ball.trail.length;
        drawCircle(ball.trail[i].x, ball.trail[i].y, ball.radius, `rgba(255, 255, 255, ${alpha})`);
    }

    drawCircle(ball.x, ball.y, ball.radius, ball.color);
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
        }
    }
});

gameLoop();
