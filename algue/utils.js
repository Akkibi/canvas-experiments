import { SimplexNoise } from "./simplexNoise.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const simplex = new SimplexNoise(2345);
console.log(simplex.noise(0.1, 0.2));
// Draw a circle
export const drawCircle = (x, y, radius, color, thickness, time) => {
  // simplex noise

  ctx.beginPath();
  // ctx.arc(x, y, radius, 0, 2 * Math.PI);
  for (let i = 0; i < Math.PI * 2; i += Math.PI / 40) {
    const dx = x + radius * Math.cos(i);
    const dy = y + radius * Math.sin(i);
    ctx.lineTo(
      dx + simplex.noise(dx / 600, time) * 5,
      dy + simplex.noise(dy / 600, time) * 5
    );
  }
  ctx.closePath();
  if (thickness !== -1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.stroke();
  } else {
    const gradient = ctx.createLinearGradient(x, y - radius, x, y + radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "black");
    ctx.fillStyle = gradient;
    ctx.fill();
  }
};

export const drawFlower = (x, y, radius, color, thickness, time) => {
  // simplex noise

  ctx.beginPath();
  // ctx.arc(x, y, radius, 0, 2 * Math.PI);
  for (let i = 0; i < Math.PI * 2; i += Math.PI / 40) {
    const dx = x + radius * 2 * Math.cos(i);
    const dy = y + radius * 0.5 * Math.sin(i);
    ctx.lineTo(
      dx + simplex.noise(dx / 600, time) * 5,
      dy + simplex.noise(dy / 600, time) * 5
    );
  }
  ctx.closePath();
  if (thickness !== -1) {
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.stroke();
  } else {
    const gradient = ctx.createLinearGradient(x, y - radius, x, y + radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "black");
    ctx.fillStyle = gradient;
    ctx.fill();
  }
};

// Draw an arc
export const drawArc = (
  x,
  y,
  radius,
  startAngle,
  endAngle,
  precision,
  clockwise
) => {
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
export const drawShape = (
  x,
  y,
  borderRadius,
  radius,
  firstAngle,
  secondAngle,
  color,
  width,
  precision
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
    false
  );
  drawArc(
    startPosition.x,
    startPosition.y,
    borderRadius,
    Math.PI + firstAngle,
    Math.PI * 2 + firstAngle,
    precision,
    false
  );
  drawArc(
    x,
    y,
    radius - borderRadius,
    firstAngle,
    secondAngle,
    precision / 4,
    true
  );
  drawArc(
    endPosition.x,
    endPosition.y,
    borderRadius,
    secondAngle,
    Math.PI + secondAngle,
    precision,
    false
  );
  ctx.closePath();
  ctx.stroke();
};

// draw circles
export const drawCircles = (
  x,
  y,
  borderRadius,
  radius,
  firstAngle,
  secondAngle,
  count
) => {
  const angleDiff = (secondAngle - firstAngle) / (count - 1);
  for (let i = 0; i < count; i++) {
    const dx = x + radius * Math.cos(firstAngle + angleDiff * i);
    const dy = y + radius * Math.sin(firstAngle + angleDiff * i);
    drawCircle(dx, dy, borderRadius - 5, "#aaaaff");
  }
};

export const getLength = (x1, y1, x2, y2) => {
  const segmentLength = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  return segmentLength;
};
