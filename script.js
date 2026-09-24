const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// x, y - Posicionar o objeto
// w, h - Definir o tamanho do personagem
// vx - Define a velocidade Horizontal

const player = {x: 40, y: 160, w: 32, h: 32, vx: 1000, vy: -500};

let last = 0; // Marca a posição do quadro anterior

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

// Personagem, funções e aparência
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(player.x + player.w / 2, player.y + player.h / 2, player.w / 2, 0, Math.PI * 2);

    ctx.fillStyle = "#867f";
    ctx.fill();

    ctx.fillStyle = "#fff"

    ctx.fillText(
        "O DeltaTime - dt independe da taxa de quadros", 12, 20);
}
// Eu uso dt porque ele faz com que a velocidade de movimento seja a mesma independente da taxa de quadros do dispositivo.

function loop(ts) {
    if (!last) last = ts;

    const dt = Math.min(
        0.05, (ts - last) / 1000); // ms = segundo
    last = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop); // Executar o primeiro disparo