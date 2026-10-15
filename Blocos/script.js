const canvas = document.getElementById("blocos");
const ctx = canvas.getContext("2d");

const paddle = {w: 86, h: 12, x: 197, y: 530, speed: 420};
const bola = {r: 7, x: 240, y: 500, vx: 180, vy: -240, launched: false};
const teclas = {};

let bricks = [];
let score = 0;
let lives = 3;
let running = false;

function construir(){

    bricks = [];
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#eb82f6"];

    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 8; col++) {
            bricks.push({
                x: 16 + col * 58, y: 40 + row * 28,
                w: 52, h: 20,
                color: colors[row],
                alive: true
            });
        }
    }
};

window.addEventListener( "keydown", (e) =>{
    teclas [e.key.toLowerCase()] = true
    if(e.conde  === "space"){
        e.preventDefault();
        running = true;
        bola.launched = true
    }

    if(e.key.toLowerCase() === "r") reset();
    }
);

window.addEventListener( "keyup", (e) => {
    teclas [e.key.toLowerCase()] = false
}
);

function reset(){

}
