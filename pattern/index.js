// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

import { createTweaks } from "../shared/tweaks.js";

const params = {
  size: 50,
  lineWidth: 3,
  linePerSquare: 4,
  gap: 6,
  lineColor: "#ffffff",
  bgColor: "#000000",
  alternate: true,
};

const schema = {
  size: { label: "square size", min: 10, max: 200, step: 1 },
  lineWidth: { label: "line width", min: 0.5, max: 12, step: 0.5 },
  linePerSquare: { label: "lines / square", min: 1, max: 12, step: 1 },
  gap: { label: "crossing gap", min: 0, max: 20, step: 0.5 },
  lineColor: { label: "line color" },
  bgColor: { label: "background" },
  alternate: { label: "alternate rotation" },
};
// draw a square
const drawSquare = (x, y, size, isRotated) => {
  const { lineWidth, linePerSquare } = params;
  // set rotate point to the center of the square

  ctx.save();
  if (isRotated) {
    ctx.translate(x + size, y);
    ctx.rotate((90 * Math.PI) / 180);
  } else {
    ctx.translate(x, y);
  }
  ctx.fillStyle = params.bgColor;
  ctx.fillRect(0, 0, size, size);

  // draw 3 lines

  for (let i = 1; i < linePerSquare + 1; i++) {
    ctx.beginPath();
    ctx.strokeStyle = params.lineColor;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(0, (i * size) / (linePerSquare + 1));
    ctx.lineTo(size, (i * size) / (linePerSquare + 1));
    ctx.stroke();
  }
  for (let i = 1; i < linePerSquare + 1; i++) {
    ctx.beginPath();
    ctx.strokeStyle = params.bgColor;
    ctx.lineWidth = lineWidth + params.gap;
    ctx.moveTo((i * size) / (linePerSquare + 1), 0);
    ctx.lineTo((i * size) / (linePerSquare + 1), size);
    ctx.stroke();
  }
  for (let i = 1; i < linePerSquare + 1; i++) {
    ctx.beginPath();
    ctx.strokeStyle = params.lineColor;
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
      drawSquare(i * size, j * size, size, params.alternate && (i + j) % 2 === 0);
    }
  }
};

const render = () => {
  const { size } = params;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawSquareGrid(canvas.width / size, canvas.height / size, size);
};

createTweaks(params, schema, render);
window.addEventListener("resize", render);
