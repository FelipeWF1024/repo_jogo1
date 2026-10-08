const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreE1 = document.getElementById("score");
const bestE1 = document.getElementById("snake-best");
const stateE1 = document.getElementById("state");
const mapE1 = document.getElementById("map");

const CELL = 24;
const COLS = canvas.width/CELL; //480 / 24 = 20
const ROWS = canvas.height/CELL;
let TICKS_MS = 150;
let currentMap = 1;

const STATES = {
    READY: "PRONTO",
    PLAYING: "JOGANDO",
    PAUSED: "PAUSE",
    OVER: "GAME OVER"
};

// x, y - Posicionar o objeto
// w, h - Definir o tamanho do personagem
// vx - Define a velocidade Horizontal

let state = STATES.READY;
let snake = []
let dir = {x:1, y:0}
let nextDir = {x: 1, y: 0}
let food = {x: 10, y: 10}
let score = 0;
let acc = 0 //Acumulador de tempo
let last = 0; // Marca a posição do quadro anterior
let best = localStorage.getItem("snake-best") || 0;
bestE1.textContent = best;

const map1Obstacles = [
    { x: 2, y: 2 },
    { x: 3, y: 2 },
    { x: 4, y: 2 },

    { x: 19, y: 2 },
    { x: 20, y: 2 },
    { x: 21, y: 2 },

    { x: 2, y: 5 },
    { x: 2, y: 6 },
    { x: 2, y: 7 },

    { x: 21, y: 5 },
    { x: 21, y: 6 },
    { x: 21, y: 7 },

    { x: 8, y: 4 },
    { x: 9, y: 4 },

    { x: 15, y: 5 },
    { x: 16, y: 5 },

    { x: 6, y: 8 },
    { x: 6, y: 9 },

    { x: 17, y: 8 },
    { x: 17, y: 9 },

    { x: 2, y: 11 },
    { x: 3, y: 11 },
    { x: 4, y: 11 },

    { x: 19, y: 11 },
    { x: 20, y: 11 },
    { x: 21, y: 11 },

    { x: 9, y: 12 },
    { x: 10, y: 12 },

    { x: 14, y: 12 },
    { x: 15, y: 12 }
];

const map2Obstacles = [
    { x: 2, y: 2 },
    { x: 3, y: 2 },
    { x: 4, y: 2 },
    { x: 5, y: 2 },
    { x: 2, y: 3 },
    { x: 3, y: 3 },
    { x: 4, y: 3 },
    { x: 5, y: 3 },
    { x: 2, y: 4 },
    { x: 3, y: 4 },
    { x: 4, y: 4 },
    { x: 5, y: 4 },
    { x: 2, y: 5 },
    { x: 3, y: 5 },
    { x: 4, y: 5 },
    { x: 5, y: 5 },

    { x: 18, y: 2 },
    { x: 19, y: 2 },
    { x: 20, y: 2 },
    { x: 21, y: 2 },
    { x: 18, y: 3 },
    { x: 19, y: 3 },
    { x: 20, y: 3 },
    { x: 21, y: 3 },
    { x: 18, y: 4 },
    { x: 19, y: 4 },
    { x: 20, y: 4 },
    { x: 21, y: 4 },
    { x: 18, y: 5 },
    { x: 19, y: 5 },
    { x: 20, y: 5 },
    { x: 21, y: 5 },

    { x: 2, y: 7 },
    { x: 3, y: 7 },
    { x: 4, y: 7 },
    { x: 2, y: 8 },
    { x: 3, y: 8 },
    { x: 4, y: 8 },
    { x: 2, y: 9 },
    { x: 3, y: 9 },
    { x: 4, y: 9 },

    { x: 19, y: 7 },
    { x: 20, y: 7 },
    { x: 21, y: 7 },
    { x: 19, y: 8 },
    { x: 20, y: 8 },
    { x: 21, y: 8 },
    { x: 19, y: 9 },
    { x: 20, y: 9 },
    { x: 21, y: 9 },

    { x: 5, y: 11 },
    { x: 6, y: 11 },
    { x: 7, y: 11 },
    { x: 8, y: 11 },
    { x: 5, y: 12 },
    { x: 6, y: 12 },
    { x: 7, y: 12 },
    { x: 8, y: 12 },
    { x: 5, y: 13 },
    { x: 6, y: 13 },
    { x: 7, y: 13 },
    { x: 8, y: 13 },

    { x: 15, y: 11 },
    { x: 16, y: 11 },
    { x: 17, y: 11 },
    { x: 18, y: 11 },
    { x: 15, y: 12 },
    { x: 16, y: 12 },
    { x: 17, y: 12 },
    { x: 18, y: 12 },
    { x: 15, y: 13 },
    { x: 16, y: 13 },
    { x: 17, y: 13 },
    { x: 18, y: 13 }
];

let obstacles = map1Obstacles;

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

function spawnApple() {
    let validPosition = false;
    while (!validPosition) {
        food = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS)
        };
        validPosition = !isOccupied(food.x, food.y);
    }
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

function changeMap(map) {
    currentMap = map;
    if (map === 1) {
        obstacles = map1Obstacles;
        TICKS_MS = 150;
    }
    if (map === 2) {
        obstacles = map2Obstacles;
        TICKS_MS = 180;
    }
    mapE1.textContent = currentMap;
    reset();
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
        stateE1.textContent = state;
    }
    if (key === "1") {
        changeMap(1);
    }
    if (key === "2") {
        changeMap(2);
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
        stateE1.textContent = state;
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
        stateE1.textContent = state;
        if (score > best) {
            best = score;
            localStorage.setItem("snake-best", String(best));
            bestE1.textContent = best;
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

    // || é ou

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
        488,
        160,
        24,
        24
    );
    ctx.fillStyle = "#963d5c";
    ctx.beginPath();
    ctx.arc(500, 150, 13, 0, Math.PI * 2);
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

function drawObstacles() {
    obstacles.forEach(obstacle => {
        const px = obstacle.x * CELL;
        const py = obstacle.y * CELL;
        ctx.fillStyle = "#050406";
        ctx.fillRect(
            px + 3,
            py + 4,
            CELL - 2,
            CELL - 2
        );
        ctx.fillStyle = "#3a3037";
        ctx.fillRect(
            px + 2,
            py + 2,
            CELL - 4,
            CELL - 4
        );
        ctx.strokeStyle = "#8d3450";
        ctx.lineWidth = 2;
        ctx.strokeRect(
            px + 3,
            py + 3,
            CELL - 6,
            CELL - 6
        );
        ctx.strokeStyle = "#61263a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(
            px + 7,
            py + 7
        );
        ctx.lineTo(
            px + CELL - 7,
            py + CELL - 7
        );
        ctx.moveTo(
            px + CELL - 7,
            py + 7
        );
        ctx.lineTo(
            px + 7,
            py + CELL - 7
        );
        ctx.stroke();
    });
}

function drawApple() {
    const cx = food.x * CELL + CELL / 2;
    const cy = food.y * CELL + CELL / 2 + 2;
    ctx.shadowColor = "#ff315d";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#c7284d";
    ctx.beginPath();
    ctx.arc(cx - 4, cy, 7, 0, Math.PI * 2);
    ctx.arc(cx + 4, cy, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "#6d432b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 7);
    ctx.lineTo(cx + 2, cy - 11);
    ctx.stroke();
    ctx.fillStyle = "#d45b79";
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy - 9, 4, 2, -0.4, 0, Math.PI * 2);
    ctx.fill();
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const px = segment.x * CELL;
        const py = segment.y * CELL;
        if (index === 0) {
            ctx.fillStyle = "#202026";
            ctx.fillRect( px + 2, py + 2, CELL - 4, CELL - 4);
            ctx.strokeStyle = "#b9365d";
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 3, py + 3, CELL - 6, CELL - 6);
            ctx.fillStyle = "#ef6686";
            if (dir.x !== 0) {
                const eyeX =
                    dir.x === 1
                        ? px + 17
                        : px + 7;
                ctx.fillRect(eyeX, py + 7 ,3, 3);
                ctx.fillRect(eyeX, py + 15, 3, 3);
            } else {
                const eyeY =
                    dir.y === 1
                        ? py + 17
                        : py + 7;
                ctx.fillRect(px + 7, eyeY, 3, 3);
                ctx.fillRect(px + 15, eyeY, 3, 3);
            }
        } else {
            ctx.fillStyle =
                index % 2 === 0
                    ? "#332d34"
                    : "#4a3540";
            ctx.fillRect(
                px + 2,
                py + 2,
                CELL - 4,
                CELL - 4
            );
            ctx.fillStyle = "#8e304d";
            ctx.fillRect(
                px + 4,
                py + 17,
                CELL - 8,
                3
            );
        }
    });
}

// Personagem, funções e aparência
function draw() {
    drawFloor();
    // drawHouse();
    drawObstacles();
    drawApple();
    drawSnake();
    if (state !== STATES.PLAYING) {
        ctx.fillStyle = "rgba(5, 4, 7, 0.72)";
        //ctx.fillRect(0, 0, canvas.width, canvas.height);
        //ctx.fillStyle = "#171219";
        //ctx.fillRect(105, 125, 270, 110);
        //ctx.strokeStyle = "#a52b50";
        //ctx.lineWidth = 2;
        //ctx.strokeRect(105, 125, 270, 110);
        ctx.textAlign = "center";
        ctx.fillStyle = "#ed6688";
        ctx.font = "bold 28px Segoe UI";
        ctx.fillText(
            state,
            canvas.width / 2,
            165
        );
        ctx.fillStyle = "#d0c2c8";
        ctx.font = "16px Segoe UI";
        if (state === STATES.OVER) {
            ctx.fillText(
                "Pressione R para reiniciar",
                canvas.width / 2,
                200
            );
        } else {
            ctx.fillText(
                "Pressione ESPAÇO para jogar",
                canvas.width / 2,
                200
            );
        }
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