const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreE1 = document.getElementById("score");
const bestE1 = document.getElementById("snake-best");
const stateE1 = document.getElementById("state");

const CELL = 24;
const COLS = canvas.width/CELL; //480 / 24 = 20
const ROWS = canvas.height/CELL;
const TICKS_MS = 110; //A cobra se move 1 célula a cada 110ms.

const STATES = {
    READY: "PRONTO",
    PLAYING: "JOGANDO",
    PAUSED: "PAUSE",
    OVER: "GAME OVER"
};

// x, y - Posicionar o objeto
// w, h - Definir o tamanho do personagem
// vx - Define a velocidade Horizontal

const player = {x: 40, y: 160, w: 32, h: 32, vx: 10, vy: 10};

let state = STATES.READY;
let snake = []
let dir = {x:1, y:0}
let nextDir = {x: 1, y: 0}
let food = {x: 10, y: 10}
let score = 0;
let acc = 0 //Acumulador de tempo
let last = 0; // Marca a posição do quadro anterior
let best = localStorage.getItem("snake-best") || 0;

const obstacles = [
    // Estante / caixa superior
    { x: 5, y: 4 },
    { x: 6, y: 4 },
    { x: 7, y: 4 },
    // Móvel da direita
    { x: 15, y: 5 },
    { x: 15, y: 6 },
    { x: 15, y: 7 },
    // Caixas do centro
    { x: 10, y: 9 },
    { x: 10, y: 10 },
    // Mesa inferior esquerda
    { x: 3, y: 12 },
    { x: 4, y: 12 },
    // Móvel inferior
    { x: 16, y: 12 },
    { x: 17, y: 12 }
];

function reset(){
    const midX = Math.floor(COLS/2);
    const midY = Math.floor(ROWS/2);

    snake = [
        {x: midX, y: midY},
        {x: midX - 1, y: midY},
        {x: midX - 2, y: midY}
    ];

    dir = {x:1, y: 0};
    nextDir = {x:1, y:0};
    score = 0;
    state = STATES.READY;
    spawnApple();
    state = STATES.READY;
    stateE1.textContent = state;
}

function isOccupied(x, y) {
    if (
        snake.some(segment =>
            segment.x === x &&
            segment.y === y
        )
    ) {
        return true;
    }
    if (
        obstacles.some(obstacle =>
            obstacle.x === x &&
            obstacle.y === y
        )
    ) {
        return true;
    }
    return false;
}

function spawnApple(){
    let validPosition = false;
    while (!validPosition){
        food = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS)
        }
    }   validPosition = !isOccupied(food.x, food.y);
    //Função some() retornar 'True' se algum segmento da Snake ocupar determinada céluls.
}

function setDirection(x, y) {
    if (
        dir.x + x === 0 &&
        dir.y + y === 0
    ) {
        return;
    }
    nextDir = {
        x: x,
        y: y
    };
}

window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (
        [
            "arrowup",
            "arrowdown",
            "arrowleft",
            "arrowright",
            " "
        ].includes(key)
    ) {
        e.preventDefault();
    }
    if (key === "arrowup" || key === "w") {
        setDirection(0, -1);
    }
    if (key === "arrowdown" || key === "s") {
        setDirection(0, 1);
    }
    if (key === "arrowleft" || key === "a") {
        setDirection(-1, 0);
    }
    if (key === "arrowright" || key === "d") {
        setDirection(1, 0);
    }
    if (key === " ") {
        if (state === STATES.PLAYING) {
            state = STATES.PAUSED;
        } else if (
            state === STATES.PAUSED ||
            state === STATES.READY
        ) {
            state = STATES.PLAYING;
        }
        stateEl.textContent = state;
    }
    if (key === "r") {
        reset();
    }
    // Primeiro movimento tira do pronto
    if (
        state === STATES.READY &&
        ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key))
        {
        state = STATES.PLAYING;
        stateEl.textContent = state;
    }
});

function hitObstacle(x, y) {

    return obstacles.some(obstacle =>
        obstacle.x === x &&
        obstacle.y === y
    );
}

function tick() {
    dir = nextDir;
    const head = {
        x: snake[0].x + dir.x,
        y: snake[0].y + dir.y
    };

    const hitWall =
        head.x < 0 ||
        head.y < 0 ||
        head.x >= COLS ||
        head.y >= ROWS;

    const hitBody = snake.some(segment =>
        segment.x === head.x &&
        segment.y === head.y
    );
    const hitBlock = hitObstacle(head.x, head.y);

    if (hitWall || hitBody || hitBlock) {
        state = STATES.OVER;
        stateEl.textContent = state;
        if (score > best) {
            best = score;
            localStorage.setItem("snake-best", String(best));
            bestEl.textContent = best;
        }return;
    }

    snake.unshift(head); // Criar uma nova cabeça

    if(head.x === food.x && head.y === food.y){
        score += 10;
        scoreE1.textContent = score;
        spawnApple(); // Comer a maçã, NÃO remove um pedaço da cauda.
    }else{
        snake.pop(); // Não comeu, fila continua.
    }
}

function update(dt) {
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    // Bater na parede esquerda ou direita? Inverte a direção do movimento
    if (player.x < 0 || player.x + player.w > canvas.width) {
        player.vx *= -1;
    }
    if (player.y < 0 || player.y + player.w > canvas.height) {
        player.vy *= -1;
    }
    // || é ou
}

function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(
        x * CELL + 1,
        y * CELL + 1,
        CELL - 2,
        CELL - 2
    );
}

function drawFloor() {
    ctx.fillStyle = "#0c0b0f";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            ctx.fillStyle =
                (x + y) % 2 === 0
                    ? "#121116"
                    : "#17151a";
            ctx.fillRect(
                x * CELL,
                y * CELL,
                CELL,
                CELL
            );
        }
    }

    ctx.strokeStyle = "#252128";
    ctx.lineWidth = 1;
    for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL, 0);
        ctx.lineTo(
            x * CELL,
            canvas.height
        );
        ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL);
        ctx.lineTo(
            canvas.width,
            y * CELL
        );
        ctx.stroke();
    }
}

function drawHouse() {
    ctx.fillStyle = "#29252c";
    ctx.fillRect(
        24,
        24,
        96,
        48
    );
    ctx.fillStyle = "#6e2038";
    ctx.fillRect(
        48,
        24,
        72,
        48
    );
    ctx.fillStyle = "#c9bcc2";
    ctx.fillRect(30, 30, 36, 22);
    ctx.fillStyle = "#282631";
    ctx.fillRect(
        168,
        24,
        96,
        48
    );
    ctx.fillStyle = "#101722";
    ctx.fillRect(
        174,
        30,
        84,
        36
    );
    ctx.fillStyle = "#d9cbd0";
    ctx.beginPath();
    ctx.arc(240, 45, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#302b31";
    ctx.fillRect(
        360,
        24,
        72,
        72
    );
    ctx.strokeStyle = "#6e5962";
    ctx.strokeRect(
        360,
        24,
        72,
        72
    );
    ctx.strokeStyle = "#17141a";
    ctx.beginPath();
    ctx.moveTo(396, 24);
    ctx.lineTo(396, 96);
    ctx.stroke();
    ctx.fillStyle = "#4d2634";
    ctx.fillRect(
        432,
        72,
        24,
        24
    );
    ctx.fillStyle = "#963d5c";
    ctx.beginPath();
    ctx.arc(444, 66, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5b2339";
    ctx.fillRect(
        312,
        288,
        120,
        48
    );
    ctx.strokeStyle = "#9c4863";
    ctx.strokeRect(
        316,
        292,
        112,
        40
    );
}

// Personagem, funções e aparência
function draw() {
    ctx.fillStyle = "#022c22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawCell(food.x, food.y, "#880808");
    snake.forEach((s, i) => drawCell(s.x, s.y, i === 0 ? "#22c55e" : "#4ade80"));

    if(state !== STATES.PLAYING){
        ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle ="#f8fafc"
        ctx.textAlign = "center";
        ctx.font = "bold, 28px Segoe UI";
        ctx.fillText(state, canvas.width / 2, canvas.height / 2);
        ctx.font = "16px Segoe UI";
        ctx.fillText(state === STATES.OVER ?
            "Pressione R para reiniciar" :
            "Pressione ESPAÇO para jogar", canvas.width / 2, canvas.height / 2 + 32);
    }
}
// Eu uso dt porque ele faz com que a velocidade de movimento seja a mesma independente da taxa de quadros do dispositivo.

function loop(ts) {
    const dt = ts - last; // ms = segundo
    last = ts;

    if(state === STATES.PLAYING){
        acc += dt;
        while(acc >= TICKS_MS){
            tick();
            acc -= TICKS_MS;
        }
    }
    draw()
    requestAnimationFrame(loop)
}  

reset()
requestAnimationFrame(loop) // Executar o primeiro disparo 