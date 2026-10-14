// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const DEFAULT_RADIUS = 10;
const CLICK_THRESHOLD = 4;

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

const links = [[circleList[0], circleList[1]]];

let drag = null; // { start, from, pointer }

const drawCircle = (circle) => {
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
};

const drawTangents = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= Math.abs(a.radius - b.radius)) return;
  const base = Math.atan2(dy, dx);
  const offset = Math.acos((a.radius - b.radius) / dist);
  ctx.beginPath();
  for (const sign of [1, -1]) {
    const angle = base + sign * offset;
    ctx.moveTo(
      a.x + Math.cos(angle) * a.radius,
      a.y + Math.sin(angle) * a.radius,
    );
    ctx.lineTo(
      b.x + Math.cos(angle) * b.radius,
      b.y + Math.sin(angle) * b.radius,
    );
  }
  ctx.stroke();
};

const drawConnexions = () => {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  for (const [a, b] of links) {
    drawTangents(a, b);
  }
};

const dragRadius = () => {
  const d = Math.hypot(drag.pointer.x - drag.start.x, drag.pointer.y - drag.start.y);
  return d > CLICK_THRESHOLD ? d : DEFAULT_RADIUS;
};

const drawDrag = () => {
  if (!drag) return;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (drag.from) {
    ctx.moveTo(drag.from.x, drag.from.y);
    ctx.lineTo(drag.pointer.x, drag.pointer.y);
    const target = circleAt(drag.pointer);
    if (target && target !== drag.from) {
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius + 6, 0, Math.PI * 2);
    }
  } else {
    ctx.arc(drag.start.x, drag.start.y, dragRadius(), 0, Math.PI * 2);
  }
  ctx.stroke();
};

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let circle of circleList) {
    drawCircle(circle);
  }
  drawConnexions();
  drawDrag();
};

const circleAt = (p) => {
  for (let i = circleList.length - 1; i >= 0; i--) {
    const c = circleList[i];
    if (Math.hypot(p.x - c.x, p.y - c.y) <= c.radius) return c;
  }
  return null;
};

const hasLink = (a, b) =>
  links.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

const removeLinks = (circle) => {
  for (let i = links.length - 1; i >= 0; i--) {
    if (links[i].includes(circle)) links.splice(i, 1);
  }
};

const removeCircle = (circle) => {
  circleList.splice(circleList.indexOf(circle), 1);
};

const toPoint = (e) => ({ x: e.clientX, y: e.clientY });

window.addEventListener("pointerdown", (e) => {
  const p = toPoint(e);
  drag = { start: p, from: circleAt(p), pointer: p };
  draw();
});

window.addEventListener("pointermove", (e) => {
  if (!drag) return;
  drag.pointer = toPoint(e);
  draw();
});

window.addEventListener("pointerup", (e) => {
  if (!drag) return;
  drag.pointer = toPoint(e);
  const { start, from, pointer } = drag;

  if (!from) {
    circleList.push({ x: start.x, y: start.y, radius: dragRadius() });
  } else {
    const target = circleAt(pointer);
    if (target && target !== from) {
      if (!hasLink(from, target)) links.push([from, target]);
    } else if (target === from) {
      if (links.some((l) => l.includes(from))) removeLinks(from);
      else removeCircle(from);
    }
  }

  drag = null;
  draw();
});

window.addEventListener("resize", () => {
  const sx = window.innerWidth / canvas.width;
  const sy = window.innerHeight / canvas.height;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  for (const c of circleList) {
    c.x *= sx;
    c.y *= sy;
  }
  draw();
});

draw();
