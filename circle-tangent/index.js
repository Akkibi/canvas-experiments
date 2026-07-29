// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const circleList = [
  {
    x: canvas.width / 3,
    y: canvas.height / 3,
    radius: 50,
  },
  {
    x: (canvas.width / 3) * 2,
    y: (canvas.height / 3) * 2,
    radius: 50,
  },
];

const drawCircle = (circle) => {
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
};

const draw = () => {
  for (let circle of circleList) {
    drawCircle(circle);
  }
  drawConnexions();
};

draw();
