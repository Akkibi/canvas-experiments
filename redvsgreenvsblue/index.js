// Get the canvas element
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth * 1;
canvas.height = window.innerHeight * 1;

function w(x) {
  return (x / 100) * canvas.width;
}
function h(y) {
  return (y / 100) * canvas.height;
}

function log(value) {
  document.getElementById("log").innerHTML = value.toString();
}

function drawLine(x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.stroke();
}

// draw a triangle at the given x, y position, with the given angle, and size
function drawTriangle(x, y, angle, speed, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(0, -size / 2);
  ctx.lineTo(size / 2, size / 2);
  ctx.lineTo(-size / 2, size / 2);
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
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

function angleDiff(a, b) {
  return Math.min((a - b + 360) % 360, (b - a + 360) % 360);
}

function radDiff(a, b) {
  return Math.min(
    (a - b + Math.PI) % (2 * Math.PI),
    (b - a + Math.PI) % (2 * Math.PI)
  );
}

// create array of random triangles
const triangles = [];

for (let i = 0; i < 50; i++) {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  const angle = Math.random() * Math.PI * 2;
  const size = h(1.5);
  const color = "#ff0000";
  const speed = 3;
  triangles.push({ x, y, angle, speed, size, color });
}
for (let i = 0; i < 10; i++) {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  const angle = 1;
  const size = h(1.5);
  const color = "#0000aa";
  const speed = 3;
  triangles.push({ x, y, angle, speed, size, color });
}

function updateTriangles() {
  triangles.forEach((triangle) => {
    triangle.x += Math.cos(triangle.angle) * triangle.speed;
    triangle.y += Math.sin(triangle.angle) * triangle.speed;

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
    if (triangle.color === "#ff0000") {
      triangles.forEach((otherTriangle) => {
        if (triangle !== otherTriangle) {
          const distance = Math.sqrt(
            (triangle.x - otherTriangle.x) ** 2 +
              (triangle.y - otherTriangle.y) ** 2
          );
          const angleDiff = radDiff(triangle.angle, otherTriangle.angle);
          if (distance < triangle.size * 2) {
            //   triangle.angle -= angleDiff * 0.01;
            triangle.angle += 0.01;
          } else if (distance < triangle.size * 15) {
            triangle.angle += angleDiff * 0.001;
          }
          if (distance < triangle.size * 10) {
            drawLine(
              triangle.x,
              triangle.y,
              otherTriangle.x,
              otherTriangle.y,
              `hsla(0, 0%, 50%, ${1 - distance * 0.005})`
            );
          }
        }
      });
    }
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
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateTriangles();

  drawTriangles();
  // draw the triangles

  requestAnimationFrame(animate);
}

animate();
