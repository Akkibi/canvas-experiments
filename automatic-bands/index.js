import { laplacianSmoothing } from "./laplacian.js";

// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const linewidth = 20;
const rotationSpeed = 0.5;
const linePerSquare = 4;
const lineSpeed = 10;

const maxLines = 50;
// draw a square
const linesTable = [];

function startLine() {
  // only start at edges
  const randomSide = Math.floor(Math.random() * 4);

  const startPosition = {
    x:
      randomSide === 0
        ? 0
        : randomSide === 2
        ? canvas.width
        : Math.random() * canvas.width,
    y:
      randomSide === 1
        ? 0
        : randomSide === 3
        ? canvas.height
        : Math.random() * canvas.height,
  };

  linesTable.push([
    {
      x: startPosition.x,
      y: startPosition.y,
      angle:
        Math.atan2(
          canvas.height / 2 - startPosition.y,
          canvas.width / 2 - startPosition.x
        ) +
        (Math.random() - 0.5) * Math.PI,
    },
  ]);
}

function addSegment() {
  const position = linesTable[linesTable.length - 1];
  const lastPosition = position[position.length - 1];
  const newX = lastPosition.x + Math.cos(lastPosition.angle) * lineSpeed;
  const newY = lastPosition.y + Math.sin(lastPosition.angle) * lineSpeed;

  linesTable[linesTable.length - 1].push({
    x: newX,
    y: newY,
    angle: lastPosition.angle + (Math.random() - 0.5) * rotationSpeed,
  });
  if (newX < 0 || newX > canvas.width || newY < 0 || newY > canvas.height) {
    if (linesTable.length > maxLines) {
      linesTable.shift();
    }
    startLine();
  }
}

function drawLine(index) {
  const rawArray = linesTable[index];
  var array = [];
  if (rawArray.length > 3) {
    array = laplacianSmoothing(rawArray, 4);
  } else {
    array = rawArray;
  }

  // black
  ctx.beginPath();
  ctx.lineWidth = linewidth + 10;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
  ctx.moveTo(array[0].x, array[0].y + linewidth / 3);
  for (let i = 1; i < array.length; i++) {
    ctx.lineTo(array[i].x, array[i].y + linewidth / 3);
  }
  ctx.stroke();
  // white
  ctx.beginPath();
  ctx.lineWidth = linewidth;
  ctx.strokeStyle =
    "rgb(" +
    (170 * index) / maxLines +
    ", " +
    (255 * index) / maxLines +
    ", " +
    (200 * index) / maxLines +
    ")";
  ctx.moveTo(array[0].x, array[0].y);
  for (let i = 1; i < array.length; i++) {
    ctx.lineTo(array[i].x, array[i].y);
  }
  ctx.stroke();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < linesTable.length; i++) {
    drawLine(i);
  }
}

startLine();

for (let i = 0; i < maxLines * lineSpeed * 5; i++) {
  addSegment();
}

function drawBorders() {
  ctx.beginPath();
  ctx.lineWidth = linewidth * 2;
  ctx.strokeStyle = "white";
  ctx.moveTo(0, 0);
  ctx.lineTo(canvas.width, 0);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.lineTo(0, 0);
  ctx.stroke();
}

function animate() {
  addSegment();
  addSegment();
  addSegment();
  addSegment();
  addSegment();
  addSegment();
  draw();
  drawBorders();
  requestAnimationFrame(animate);
}

animate();
