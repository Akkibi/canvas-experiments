// Get the canvas element
export const canvas = document.getElementById("canvas");
export const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth * 1 - 9;
canvas.height = window.innerHeight * 1 - 9;

export function drawLine(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color + "30";
  ctx.stroke();
}

// draw a triangle at the given x, y position, with the given angle, and size
export function drawTriangle(x, y, angle, speed, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(0, -size / 2);
  ctx.lineTo(size / 2, size / 2);
  ctx.lineTo(-size / 2, size / 2);
  ctx.closePath();
  if (color === "#00ff00") {
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#22c55e";
  }
  if (color === "#0000ff") {
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#3b82f6";
  }
  if (color === "#ff0000") {
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#ef4444";
  }
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawGrid() {
  for (let i = 0; i < canvas.width; i += 100) {
    drawLine(i, 0, i, canvas.height, "#555555");
  }
  for (let i = 0; i < canvas.height; i += 100) {
    drawLine(0, i, canvas.width, i, "#555555");
  }
}

drawGrid();
