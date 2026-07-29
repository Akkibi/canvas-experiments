import { drawShape, drawCircle, drawCircles } from "./utils.js";

// Get the canvas element
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
console.log(isMobile ? "You are on Mobile" : "You are on Desktop");

const precision = 0.25;
let dragging = false;

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Draw a circle
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// Loop
let paused = false;
let lastFrameTime = 0;
const fpsInterval = 1000 / 48;

const radius = isMobile ? 300 : 600;
const firstAngle = -Math.PI + Math.PI / 3;
const secondAngle = -Math.PI / 3;
// drawShape(
//   centerX,
//   canvas.height + radius / 1.25,
//   30,
//   radius,
//   -Math.PI + Math.PI / 3,
//   -Math.PI / 3,
//   "blue",
// 2
// );

// dragging
const pointsData = [{ x: centerX, y: canvas.height, length: 0 }];

const getLength = (x1, y1, x2, y2) => {
  const segmentLength = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  return segmentLength;
};

const drawDrag = () => {
  let length = 0;
  pointsData.forEach((point, index) => {
    length += point.length;
    console.log(point.length);
    ctx.beginPath();
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.rect(point.x - length, point.y - length, length, length);
    }
    ctx.fillStyle = "blue";
    ctx.fill();
  });
};

const clicks = [];

window.addEventListener("mousedown", (e) => {
  pointsData.length = 0;
  dragging = true;
  const x = e.clientX;
  const y = e.clientY;
  const oldpos = pointsData[pointsData.length - 1];

  pointsData.push({ x: x, y: y, length: 0 });
  clicks.push({ x, y, size: 10 });
  console.log(clicks);
});
window.addEventListener("mouseup", (e) => {
  dragging = false;
});

window.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  const x = e.clientX;
  const y = e.clientY;

  let length = 0;
  pointsData.forEach((pos, index) => {
    if (index === 0) return;
    const oldx = pointsData[index - 1].x;
    const oldy = pointsData[index - 1].y;
    const x = pointsData[index].x;
    const y = pointsData[index].y;
    length += getLength(oldx, oldy, x, y);
  });
  if (pointsData.length > 100) {
    return;
  }
  if (pointsData.length === 0) {
    pointsData.push({ x: x, y: y });
  }
  pointsData.push({ x: x, y: y });
});

let framecount = 0;
function animate(timestamp) {
  if (!timestamp) {
    requestAnimationFrame(animate);
  }
  const deltaTime = timestamp - lastFrameTime;
  if (deltaTime > fpsInterval) {
    lastFrameTime = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //// ctx.beginPath();
    //// ctx.rect(0, 0, canvas.width, canvas.height);
    //// ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    //// ctx.fill();
    // update time stuffs
    framecount++;
    drawCircle(centerX, canvas.height, 100, "blue");

    // drag
    drawDrag();

    // click
    clicks.forEach((click, index) => {
      drawCircle(
        click.x,
        click.y,
        click.size,
        "hsla(180deg, 100%, " +
          (100 - click.size) +
          "%, " +
          (0.5 - click.size * 0.015) +
          ")",
        4
      );
      click.size += 3.5;
      if (click.size > 50) {
        clicks.splice(index, 1);
      }
    });
    // end
  }
  if (!paused) {
    requestAnimationFrame(animate);
  }
}

animate();
