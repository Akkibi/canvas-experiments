// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const size = 100;

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

const render = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.strokeStyle = "white";
  dessineCercle(canvas.width / 2, 0, 0, size);
};

render();
window.addEventListener("resize", render);
