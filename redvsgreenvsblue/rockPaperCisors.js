import { drawTriangle, drawLine, drawGrid, ctx } from "./draw.js";
import { win, lose } from "./anim.js";
// Set canvas dimensions
let height = window.innerHeight * 1;

const redRef = document.getElementById("red");
const greenRef = document.getElementById("green");
const blueRef = document.getElementById("blue");
const redBarRef = document.getElementById("redBar");
const blueBarRef = document.getElementById("blueBar");

const total = 100;
let bet = null;
let paused = true;

function h(y) {
  return (y / 100) * height;
}

window.addEventListener("mousemove", (event) => {
  const x = event.clientX;
  const y = event.clientY;
  triangles.forEach((triangle) => {
    const distance = Math.sqrt((triangle.x - x) ** 2 + (triangle.y - y) ** 2);
    if (distance < triangle.size * 10) {
      const angle = Math.atan2(y - triangle.y, x - triangle.x);
      triangle.angle = angle;
    }
  });
});

function radDiff(a, b) {
  return Math.min(
    (a - b + Math.PI) % (2 * Math.PI),
    (b - a + Math.PI) % (2 * Math.PI)
  );
}

const updateCount = () => {
  let redCount = 0;
  let greenCount = 0;
  let blueCount = 0;
  triangles.forEach((triangle) => {
    if (triangle.color === "#ff0000") {
      redCount++;
    } else if (triangle.color === "#00ff00") {
      greenCount++;
    } else if (triangle.color === "#0000ff") {
      blueCount++;
    }
  });
  redBarRef.style.width = (redCount / total) * 100 + "%";
  blueBarRef.style.width = (blueCount / total) * 100 + "%";
  redRef.innerText = redCount;
  greenRef.innerText = greenCount;
  blueRef.innerText = blueCount;
  if (bet == "red" && blueCount === 0 && greenCount === 0) {
    win();
    paused = true;
  } else if (bet == "green" && redCount === 0 && blueCount === 0) {
    win();
    paused = true;
  } else if (bet == "blue" && redCount === 0 && greenCount === 0) {
    win();
    paused = true;
  } else if (
    (blueCount === 0 && greenCount === 0) ||
    (redCount === 0 && greenCount === 0) ||
    (redCount === 0 && blueCount === 0)
  ) {
    lose();
    paused = true;
  }
};

// create array of random triangles
const triangles = [];

export function fillArray() {
  triangles.length = 0;
  for (let i = 0; i < total / 3; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const angle = Math.random() * Math.PI * 2;
    const size = h(2);
    const color = "#ff0000";
    const speed = 3;
    triangles.push({ x, y, angle, speed, size, color });
  }
  for (let i = 0; i < total / 3; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const angle = Math.random() * Math.PI * 2;
    const size = h(2);
    const color = "#0000ff";
    const speed = 3;
    triangles.push({ x, y, angle, speed, size, color });
  }
  for (let i = 0; i < total / 3; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const angle = Math.random() * Math.PI * 2;
    const size = h(2);
    const color = "#00ff00";
    const speed = 3;
    triangles.push({ x, y, angle, speed, size, color });
  }
}
fillArray();

export function setBet(color) {
  bet = color;
}

function updateTriangles() {
  triangles.forEach((triangle) => {
    triangle.x += Math.cos(triangle.angle) * triangle.speed;
    triangle.y += Math.sin(triangle.angle) * triangle.speed;
    triangle.speed *= 0.8;

    if (triangle.x < 0) {
      triangle.x = canvas.width;
    }
    if (triangle.x > canvas.width) {
      triangle.x = 0;
    }
    if (triangle.y < 0) {
      triangle.y = canvas.height;
    }
    if (triangle.y > canvas.height) {
      triangle.y = 0;
    }
    triangles.forEach((otherTriangle) => {
      if (otherTriangle === triangle) return;
      const distance = Math.sqrt(
        (triangle.x - otherTriangle.x) ** 2 +
          (triangle.y - otherTriangle.y) ** 2
      );
      if (otherTriangle.color === triangle.color) {
        if (distance < h(10)) {
          triangle.angle += radDiff(triangle.angle, otherTriangle.angle) / 100;
        }
        if (distance < h(10)) {
          drawLine(
            triangle.x,
            triangle.y,
            otherTriangle.x,
            otherTriangle.y,
            triangle.color
          );
        }
        triangle.speed *= 1.1;
        triangle.speed = Math.min(triangle.speed, 5);
        triangle.speed = Math.max(triangle.speed, 0.01);
      }
      if (
        triangle.color === "#ff0000" &&
        otherTriangle.color === "#00ff00" &&
        distance < h(2)
      ) {
        triangle.color = "#00ff00";
        triangle.angle = radDiff(triangle.angle, otherTriangle.angle) / 2;
        updateCount();
      } else if (
        triangle.color === "#00ff00" &&
        otherTriangle.color === "#0000ff" &&
        distance < h(2)
      ) {
        triangle.color = "#0000ff";
        triangle.angle = radDiff(triangle.angle, otherTriangle.angle) / 2;
        updateCount();
      } else if (
        triangle.color === "#0000ff" &&
        otherTriangle.color === "#ff0000" &&
        distance < h(2)
      ) {
        triangle.color = "#ff0000";
        triangle.angle = radDiff(triangle.angle, otherTriangle.angle) / 2;
        updateCount();
      }
    });
  });
}

function drawTriangles() {
  triangles.forEach((triangle) => {
    drawTriangle(
      triangle.x,
      triangle.y,
      triangle.angle,
      0,
      triangle.size,
      triangle.color
    );
  });
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    pause();
  }
});
const pauseRef = document.getElementById("pause");
pauseRef.addEventListener("click", pause);

export function pause() {
  paused = !paused;
  if (!paused) {
    animate();
    pauseRef.classList.add("selected");
  } else {
    pauseRef.classList.remove("selected");
  }
}
let lastFrameTime = 0;
const fpsInterval = 1000 / 48;
function animate(timestamp) {
  if (!timestamp) {
    requestAnimationFrame(animate);
  }
  const deltaTime = timestamp - lastFrameTime;
  if (deltaTime > fpsInterval) {
    lastFrameTime = timestamp;
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fill();
    drawGrid();
    updateTriangles();
    drawTriangles();
  }
  if (!paused) {
    requestAnimationFrame(animate);
  }
}
