// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

import { createTweaks } from "./tweaks.js";

const params = {
  defaultRadius: 10,
  clickThreshold: 4,
  circleColor: "#ffffff",
  circleOpacity: 1,
  linkColor: "#ffffff",
  showLines: true,
  lineWidth: 1,
  fillLinks: false,
  fillOpacity: 0.3,
  linkGap: 0,
};

const schema = {
  defaultRadius: { label: "default radius", min: 2, max: 60, step: 1 },
  clickThreshold: { label: "click threshold", min: 0, max: 20, step: 1 },
  circleColor: { label: "circle color" },
  circleOpacity: { label: "circle opacity", min: 0, max: 1, step: 0.01 },
  linkColor: { label: "link color" },
  showLines: { label: "tangent lines" },
  lineWidth: { label: "line width", min: 0.5, max: 8, step: 0.5 },
  fillLinks: { label: "fill links" },
  fillOpacity: { label: "fill opacity", min: 0, max: 1, step: 0.01 },
  linkGap: { label: "link gap", min: 0, max: 80, step: 1 },
};

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
  ctx.globalAlpha = params.circleOpacity;
  ctx.fillStyle = params.circleColor;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.closePath();
};

const drawTangents = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= Math.abs(a.radius - b.radius)) return;
  const ra = a.radius + params.linkGap;
  const rb = b.radius + params.linkGap;
  const base = Math.atan2(dy, dx);
  const offset = Math.acos((a.radius - b.radius) / dist);
  const TAU = Math.PI * 2;

  if (params.fillLinks) {
    ctx.beginPath();
    ctx.arc(a.x, a.y, ra, base + offset, base + TAU - offset);
    ctx.arc(b.x, b.y, rb, base - offset, base + offset);
    ctx.closePath();
    ctx.globalAlpha = params.fillOpacity;
    ctx.fillStyle = params.linkColor;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  if (!params.showLines) return;
  ctx.beginPath();
  for (const sign of [1, -1]) {
    const angle = base + sign * offset;
    ctx.moveTo(a.x + Math.cos(angle) * ra, a.y + Math.sin(angle) * ra);
    ctx.lineTo(b.x + Math.cos(angle) * rb, b.y + Math.sin(angle) * rb);
  }
  ctx.stroke();
};

const drawConnexions = () => {
  ctx.strokeStyle = params.linkColor;
  ctx.lineWidth = params.lineWidth;
  for (const [a, b] of links) {
    drawTangents(a, b);
  }
};

const dragRadius = () => {
  const d = Math.hypot(drag.pointer.x - drag.start.x, drag.pointer.y - drag.start.y);
  return d > params.clickThreshold ? d : params.defaultRadius;
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
  if (e.target.closest("#tweaks")) return;
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

createTweaks(params, schema, draw);
draw();
