// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const size = 100;
const rows = canvas.width / size;
const cols = canvas.height / size;
const lineWidth = 3;
const linePerSquare = 4;
// draw a square

ctx.strokeStyle = "white";

function cercle(x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

// recursive circle

function dessineCercle(x, y, angle, rayon) {
  if (rayon < 1) return;
  cercle(x, y, rayon);
  angle += 0.03;
  dessineCercle(
    x + (Math.cos(angle) * rayon) / 5,
    y + (Math.sin(angle) * rayon) / 5,
    angle,
    rayon * 0.997
  );
}

let angle = 0;
dessineCercle(canvas.width / 2, 0, angle, size);
