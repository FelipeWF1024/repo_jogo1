/**
 * Breakout Bits — colisão bola/raquete/tijolos.
 * Conceitos: vetor velocidade, reflexão, grid de tijolos, níveis.
 */

//Passo 1 — Mundo contínuo

const canvas = document.getElementById("blocos");
const ctx = canvas.getContext("2d");

const paddle = {w: 86, h: 12, x: 197, y: 530, speed: 420};
const ball = {x: 240, y: 500, r: 7, vx: 180, vy: -240,launched: false};

let bricks = [];
let score = 0;
let lives = 3;
let level = 1;
let running = false;
let gameWon = false;
let items = [];
let destroyedBricks = 0;
let paddleBoostTime = 0;
let normalPaddleWidth = 86;
let extraBalls = [];

const keys = {};

const rowPoints = [50, 40, 30, 20, 10];

const layouts = [

    // Nível 1 - Deserto
    [
        [0, 1, 2, 5, 6, 7],
        [0, 1, 2, 3, 4, 5, 6, 7],
        [1, 2, 3, 4, 5, 6],
        [2, 3, 4, 5],
        [1, 2, 5, 6]
    ],
    // Nível 2 - Pirâmide
    [
        [3, 4],
        [2, 3, 4, 5],
        [1, 2, 3, 4, 5, 6],
        [0, 1, 2, 3, 4, 5, 6, 7]
    ],
    // Nível 3 - Corredor
    [
        [0, 1, 6, 7],
        [0, 1, 6, 7],
        [0, 1, 6, 7],
        [0, 1, 6, 7],
        [0, 1, 6, 7]
    ],
    // Nível 4 - Cidade Copiada
    [
        [0, 1, 2, 3, 4, 5, 6, 7],
        [0, 1, 2, 5, 6, 7],
        [0, 1, 6, 7],
        [0, 1, 2, 5, 6, 7],
        [0, 1, 2, 3, 4, 5, 6, 7]
    ]
];

function buildBricks() {
    bricks = [];
    const layout = layouts[(level - 1) % layouts.length];
    for (let row = 0; row < layout.length; row++) {
        for (let col of layout[row]) {
            let armoredAmount = Math.min(2 + level, 8);
            let armored = bricks.filter(b => b.armored).length < armoredAmount;
            bricks.push({
                x: 16 + col * 58,
                y: 55 + row * 35,
                w: 52,
                h: 23,
                row: row,
                color: "#b9b1a0",
                alive: true,
                hp: armored ? 2 : 1,
                armored: armored
            });
        }
    }
}

function spawnItem(x, y) {
    const type = Math.random() < 0.5 ? "paddle" : "double";
    items.push({x: x, y: y, size: 16, speed: 150, type: type});
}
function updateItems(dt) {

    // Diminui o tempo do aumento da nave
    if (paddleBoostTime > 0) {

        paddleBoostTime -= dt;

        if (paddleBoostTime <= 0) {
            paddle.w = normalPaddleWidth;
        }
    }

    items.forEach((item, index) => {
        item.y += item.speed * dt;
    if ((item.y + item.size / 2 >= paddle.y && item.x >= paddle.x && 
            item.x <= paddle.x + paddle.w && item.y <= paddle.y + paddle.h) 
            || item.y > canvas.height){
            if (item.type === "paddle") {
                paddle.w = Math.min(
                    normalPaddleWidth + 40,
                    paddle.w + 40
                );
                paddleBoostTime = 8;
            } else if (item.type === "double") {
                const currentBalls = [ball, ...extraBalls];
                currentBalls.forEach((b) => {
                    extraBalls.push({x: b.x, y: b.y, r: b.r, vx: -b.vx, vy: b.vy});
                });
            }
            items.splice(index, 1);
            return;
        }
        if (item.y > canvas.height) {
            items.splice(index, 1);
        }
    });
}
function updateExtraBalls(dt) {
    extraBalls.forEach((b, index) => {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x - b.r < 0 || b.x + b.r > canvas.width) {
            b.vx *= -1;
        }
        if (b.y - b.r < 0) {
            b.vy *= -1;
        }
        if (
            b.vy > 0 && b.y + b.r >= paddle.y && b.x >= paddle.x && b.x <= paddle.x + paddle.w) {
            const hit = (b.x - (paddle.x + paddle.w / 2))
                        / (paddle.w / 2);
            b.vx = hit * 400;
            b.vy = -Math.abs(b.vy);
        }
        bricks.forEach((brick) => {
            if (brick.alive && b.x + b.r > brick.x && b.x - b.r < brick.x + brick.w &&
                b.y + b.r > brick.y && b.y - b.r < brick.y + brick.h) {
                brick.hp--;
                if (brick.hp <= 0) {
                    brick.alive = false;
                    score += rowPoints[brick.row];
                    destroyedBricks++;
                    if (destroyedBricks % 8 === 0) {
                        spawnItem(
                            brick.x + brick.w / 2,
                            brick.y
                        );
                    }
                }
                b.vy *= -1;
            }
        });
        if (b.y - b.r > canvas.height) {
            extraBalls.splice(index, 1);
        }
    });
}

window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.code === "Space") {
        e.preventDefault();
        if (!gameWon && lives > 0) {
            running = true;
            ball.launched = true;
        }
    }
    if (e.key.toLowerCase() === "r") {
        reset();
    }
});
window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    paddle.x = e.clientX - rect.left - paddle.w / 2;
    paddle.x = Math.max(
        8,
        Math.min(canvas.width - paddle.w - 8, paddle.x)
    );
});

function resetBall() {
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddle.y - 14;
    ball.vx = 180 * (Math.random() > 0.5 ? 1 : -1);
    ball.vy = -540;
    ball.launched = false;
}

function reset() {
    score = 0;
    lives = 3;
    level = 1;
    running = false;
    gameWon = false;
    items = [];
    extraBalls = [];
    destroyedBricks = 0;
    paddleBoostTime = 0;
    normalPaddleWidth = 86;
    paddle.w = 86;
    paddle.x = 197;
    buildBricks();
    resetBall();
}

function collideBrick(b) {
    return (
        ball.x + ball.r > b.x &&
        ball.x - ball.r < b.x + b.w &&
        ball.y + ball.r > b.y &&
        ball.y - ball.r < b.y + b.h
    );
}

function update(dt) {
    if (keys["arrowleft"] || keys["a"]) {
        paddle.x -= paddle.speed * dt;
    }
    if (keys["arrowright"] || keys["d"]) {
        paddle.x += paddle.speed * dt;
    }
    paddle.x = Math.max(
        8,
        Math.min(canvas.width - paddle.w - 8, paddle.x)
    );

    if (!ball.launched) {
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddle.y - 14;
        return;
    }
    if (!running || lives <= 0 || gameWon) return;
    const oldX = ball.x;
    const oldY = ball.y;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    if (ball.x - ball.r < 0) {
        ball.x = ball.r;
        ball.vx = Math.abs(ball.vx);
    }
    if (ball.x + ball.r > canvas.width) {
        ball.x = canvas.width - ball.r;
        ball.vx = -Math.abs(ball.vx);
    }
    if (ball.y - ball.r < 0) {
        ball.y = ball.r;
        ball.vy = Math.abs(ball.vy);
    }
    if (ball.y - ball.r > canvas.height) {
        lives--;
        if (lives <= 0) {
            running = false;
            return;
        }
        resetBall();
        return;
    }
    if (
        ball.vy > 0 &&
        ball.y + ball.r >= paddle.y &&
        ball.y - ball.r <= paddle.y + paddle.h &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.w
    ) {
        const hit = (ball.x - (paddle.x + paddle.w / 2))
                    / (paddle.w / 2);
        const speed = 560;
        ball.vx = hit * 400;
        ball.vy = -Math.sqrt(
            speed * speed - ball.vx * ball.vx
        );
        ball.y = paddle.y - ball.r;
    }
    bricks.forEach((b) => {
        if (b.alive && collideBrick(b)) {
            if (oldY + ball.r <= b.y ||
                oldY - ball.r >= b.y + b.h) {
                ball.vy *= -1;
            } else {
                ball.vx *= -1;
            }
            b.hp--;
            if (b.hp <= 0) {
            b.alive = false;
            score += rowPoints[b.row];
            destroyedBricks++;
            if (destroyedBricks % 8 === 0) {
                spawnItem(b.x + b.w / 2, b.y);
            }
            } else {
                b.color = "#756d60";
            }
        }
    });
    if (bricks.every((b) => !b.alive)) {
        level++;
        paddle.w = Math.max(50, paddle.w - 8);
        paddle.x = Math.min(
            paddle.x,
            canvas.width - paddle.w - 8
        );
        buildBricks();
        resetBall();
        running = false;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#202020";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#39352e";
    ctx.lineWidth = 1;
    ctx.strokeRect(8, 35, canvas.width - 16, 475);
    ctx.fillStyle = "#ded6c5";
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.fillStyle = "#8c8578";
    ctx.fillRect(paddle.x + 10, paddle.y + 3, paddle.w - 20, 3);
    ctx.beginPath();
    ctx.fillStyle = "#f0eadb";
    ctx.shadowColor = "#e8e1d3";
    ctx.shadowBlur = 12;
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    bricks.forEach((b) => {
        if (!b.alive) return;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = "#e1d8c7";
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = "#39352e";
        ctx.fillRect(b.x + 12, b.y + 8, 5, 5);
        ctx.fillRect(b.x + 35, b.y + 8, 5, 5);
        if (b.hp === 2) {
            ctx.fillStyle = "#e0a84f";
            ctx.fillRect(b.x + 22, b.y + 3, 8, 3);
        }
        extraBalls.forEach((b) => {
    ctx.beginPath();
    ctx.fillStyle = "#f0eadb";
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
});

items.forEach((item) => {
    ctx.fillStyle = item.type === "paddle"
        ? "#d8c49a"
        : "#9bb6c9";
    ctx.fillRect(
        item.x - item.size / 2,
        item.y - item.size / 2,
        item.size,
        item.size
    );
    ctx.fillStyle = "#202020";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(item.type === "paddle" ? "P" : "2", item.x, item.y + 4);
    ctx.textAlign = "left";
});
    });

    ctx.fillStyle = "#ded6c5";
    ctx.font = "14px Georgia";
    ctx.fillText("SCORE: " + score, 16, 22);
    ctx.fillText("LIVES: " + lives, 190, 22);
    ctx.fillText("LEVEL: " + level, 370, 22);

    ctx.font = "11px Georgia";
    ctx.fillStyle = "#a69e8e";

    ctx.fillText("UNIT: 2B", 16, 525);
    ctx.fillText("YoRHa COMBAT SYSTEM", 310, 525);

    if (!running && lives > 0 && !gameWon) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#e8e1d3";
        ctx.font = "bold 20px Georgia";
        ctx.fillText(
            "PRESS SPACE TO START",
            canvas.width / 2,
            canvas.height / 2
        );
        ctx.textAlign = "left";
    }

    if (lives <= 0) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#d9c7a0";
        ctx.font = "bold 24px Georgia";
        ctx.fillText(
            "YOU LOST",
            canvas.width / 2,
            canvas.height / 2
        );
        ctx.font = "14px Georgia";
        ctx.fillText(
            "PRESS R TO RESTART",
            canvas.width / 2,
            canvas.height / 2 + 30
        );
        ctx.textAlign = "left";
    }
}

let last = 0;

function loop(ts) {
    if (!last) last = ts;
    const dt = Math.min(0.033, (ts - last) / 1000);
    last = ts;
    update(dt);
    updateItems(dt);
    updateExtraBalls(dt);
    draw();
    requestAnimationFrame(loop);
}

reset();
requestAnimationFrame(loop);