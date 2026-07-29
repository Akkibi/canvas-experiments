// Get the canvas element
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
console.log(isMobile ? "You are on Mobile" : "You are on Desktop");

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

// Draw
const precision = 0.25;

const drawCircle = (x, y, radius, color, thickness) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.closePath();
  if (thickness) {
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.stroke();
  } else {
    ctx.fillStyle = color;
    ctx.fill();
  }
};

// Draw an arc
const drawArc = (x, y, radius, startAngle, endAngle, precision, clockwise) => {
  if (clockwise) {
    for (let i = startAngle; i < endAngle; i += precision) {
      const dx = x + radius * Math.cos(i);
      const dy = y + radius * Math.sin(i);
      ctx.lineTo(dx, dy);
    }
  } else {
    for (let i = endAngle; i > startAngle; i -= precision) {
      const dx = x + radius * Math.cos(i);
      const dy = y + radius * Math.sin(i);
      ctx.lineTo(dx, dy);
    }
  }
};

// draw a shape
const drawShape = (
  x,
  y,
  borderRadius,
  radius,
  firstAngle,
  secondAngle,
  color,
  width,
) => {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  const startPosition = {
    x: x + radius * Math.cos(firstAngle),
    y: y + radius * Math.sin(firstAngle),
  };
  const endPosition = {
    x: x + radius * Math.cos(secondAngle),
    y: y + radius * Math.sin(secondAngle),
  };
  drawArc(
    x,
    y,
    radius + borderRadius,
    firstAngle,
    secondAngle,
    precision / 4,
    false,
  );
  drawArc(
    startPosition.x,
    startPosition.y,
    borderRadius,
    Math.PI + firstAngle,
    Math.PI * 2 + firstAngle,
    precision,
    false,
  );
  drawArc(
    x,
    y,
    radius - borderRadius,
    firstAngle,
    secondAngle,
    precision / 4,
    true,
  );
  drawArc(
    endPosition.x,
    endPosition.y,
    borderRadius,
    secondAngle,
    Math.PI + secondAngle,
    precision,
    false,
  );
  ctx.closePath();
  ctx.stroke();
};

const drawCircles = (
  x,
  y,
  borderRadius,
  radius,
  firstAngle,
  secondAngle,
  count,
) => {
  const angleDiff = (secondAngle - firstAngle) / (count - 1);
  for (let i = 0; i < count; i++) {
    const dx = x + radius * Math.cos(firstAngle + angleDiff * i);
    const dy = y + radius * Math.sin(firstAngle + angleDiff * i);
    drawCircle(dx, dy, borderRadius - 5, "#aaaaff");
  }
};

const radius = isMobile ? 300 : 600;
const firstAngle = -Math.PI + Math.PI / 5;
const secondAngle = -Math.PI / 5;
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

const clicks = [];

window.addEventListener("click", (e) => {
  const x = e.clientX;
  const y = e.clientY;
  clicks.push({ x, y, size: 10 });
  console.log(clicks);
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
    drawShape(
      centerX,
      canvas.height + radius / (isMobile ? 1.5 : 1.3),
      30,
      radius,
      firstAngle + Math.sin(framecount / 100) * 0.05,
      secondAngle + Math.sin(-framecount / 100) * 0.05,
      "#aaaaff",
      2,
    );
    drawCircles(
      centerX,
      canvas.height + radius / (isMobile ? 1.5 : 1.3),
      30,
      radius,
      firstAngle + Math.sin(framecount / 100) * 0.05,
      secondAngle + Math.sin(-framecount / 100) * 0.05,
      4,
    );
    drawCircle(centerX, centerY, 100, "blue");

    //click
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
        4,
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
