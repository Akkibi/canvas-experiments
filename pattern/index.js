// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const size = 50;
const rows = canvas.width / size;
const cols = canvas.height / size;
const lineWidth = 3;
const linePerSquare = 4;
// draw a square
const drawSquare = (x, y, size, isRotated) => {
  // set rotate point to the center of the square

  ctx.save();
  if (isRotated) {
    ctx.translate(x + size, y);
    ctx.rotate((90 * Math.PI) / 180);
  } else {
    ctx.translate(x, y);
  }
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, size, size);

  // draw 3 lines

  for (let i = 1; i < linePerSquare + 1; i++) {
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth = lineWidth;
    ctx.moveTo(0, (i * size) / (linePerSquare + 1));
    ctx.lineTo(size, (i * size) / (linePerSquare + 1));
    ctx.stroke();
  }
  for (let i = 1; i < linePerSquare + 1; i++) {
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = lineWidth + 6;
    ctx.moveTo((i * size) / (linePerSquare + 1), 0);
    ctx.lineTo((i * size) / (linePerSquare + 1), size);
    ctx.stroke();
  }
  for (let i = 1; i < linePerSquare + 1; i++) {
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth = lineWidth;
    ctx.moveTo((i * size) / (linePerSquare + 1), 0);
    ctx.lineTo((i * size) / (linePerSquare + 1), size);
    ctx.stroke();
  }
  ctx.restore();
};

const drawSquareGrid = (rows, cols, size) => {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      drawSquare(i * size, j * size, size, (i + j) % 2 === 0);
    }
  }
};

drawSquareGrid(rows, cols, size);
