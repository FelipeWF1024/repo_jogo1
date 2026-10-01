const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const score1 = document.getElementById("score");
const state1 = document.getElementById("state");
const best1 = document.getElementById("snake-best");

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

//const player = {x: 40, y: 160, w: 32, h: 32, vx: 1000, vy: -500};

let state = STATES.READY;
let snake = []
let dir = {x:1, y:0}
let nextDir = {x: 1, y: 0}
let food = {x: 10, y: 10}
let score = 0;
let acc = 0 //Acumulador de tempo
let last = 0; // Marca a posição do quadro anterior
let best = localStorage.getItem("snake-best") || 0;

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
    score1 = textContent = score;
    state = STATES.READY;
    state1 = textContent = state
}

function spawnApple(){
    
    do {
        food = {
            x: Math.floor(Math.random() * COLS),
            y: Math.floor(Math.random() * ROWS)
        }
    } while (snake.some((s) => s.x === food.x && s.y === food.y));
    //Função some() retornar 'True' se algum segmento da Snake ocupar determinada céluls.
}

function setDirection(x, y){
    if(dir.x + x === 0 && dir.y + y === 0);
    return;
    nextDir = {x, y};
}

window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if(key === "arrowup" || key === "w")
        setDirection(0, -1)
    if(key === "arrowdown" || key === "s")
        setDirection(0, 1)
    if(key === "arrowleft" || key === "a")
        setDirection(-1, 0)
    if(key === "arrowright" || key === "d")
        setDirection(1, 0)
    if(key === "r")
        reset();
    if(key === " "){/*Altera PLAYING - PAUSED e sai de READY*/}
});

function tick(){
    dir = nextDir;
    const head = {x: snake[0] + dir.x, y: snake[0] + dir.y}

    const hitwall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS

    const hitbody = snake.some((s) => s.x === head && s.y === ROWS);

    if (hitwall || hitbody){
        state = STATES.OVER;

        if(score > best){
            best = score;

            localStorage.setItem("snake-best", String(best));
        }
        return;
    }

    snake.unshift(head); // Criar uma nova cabeça

    if(head.x === food.x && head.y === food.y){
        score += 10;
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

function drawCell(x, y, color){
    ctx.fillStyle = color;
    ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
}

// Personagem, funções e aparência
function draw() {
    ctx.fillStyle = "#022c22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawCell(food.x, food.y, "#880808");
    snake.forEach((s, i) => drawCell(s.x, s.y, i === 0 ? "#22c55e" : "#4ade80"));

    if(state != STATES.PLAYING){
        ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle ="#f8fafc"
        ctx.textAlign = "center";
        ctx.font = "bold, 28px Segoe UI";
        ctx.fillText(state, canvas.width / 2, canvas.height / 2);
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

requestAnimationFrame(loop); // Executar o primeiro disparo 