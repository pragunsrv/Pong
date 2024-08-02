const canvas = document.getElementById("pongCanvas");
const context = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

const paddleWidth = 10;
const paddleHeight = 100;
const ballRadius = 10;

const player = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#fff",
    dy: 5,
    score: 0
};

const ai = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#fff",
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
    color: "#fff"
};

let isPaused = false;

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
    if (!isPaused) {
        ball.x += ball.dx;
        ball.y += ball.dy;

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
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = ball.speed * (Math.random() > 0.5 ? 1 : -1);
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
    drawText(player.score, canvas.width / 4, canvas.height / 5, "#fff");
    drawText(ai.score, 3 * canvas.width / 4, canvas.height / 5, "#fff");
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

gameLoop();
