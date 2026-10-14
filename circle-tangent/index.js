// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

import { createTweaks } from "../shared/tweaks.js";
import { hullPath, linkGeometry, tangentLines } from "./geometry.js";
import { buildSvg, downloadSvg } from "./export.js";

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
  inner: false,
  innerInset: 4,
  innerColor: "#000000",
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
  inner: { label: "inner overlay" },
  innerInset: { label: "inner inset", min: 1, max: 40, step: 0.5 },
  innerColor: { label: "inner color" },
  exportSvg: {
    label: "export SVG",
    action: () =>
      downloadSvg(buildSvg(params, circleList, links, canvas.width, canvas.height)),
  },
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

const drawCircle = (circle, radius = circle.radius, color = params.circleColor, alpha = params.circleOpacity) => {
  if (radius <= 0) return;
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, radius, 0, Math.PI * 2);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.globalAlpha = 1;
};

const fillHull = (g, inset, color, alpha) => {
  const d = hullPath(g, params.linkGap, inset);
  if (!d) return;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fill(new Path2D(d));
  ctx.globalAlpha = 1;
};

const drawConnexions = (geoms) => {
  ctx.strokeStyle = params.linkColor;
  ctx.lineWidth = params.lineWidth;
  for (const g of geoms) {
    if (params.fillLinks) fillHull(g, 0, params.linkColor, params.fillOpacity);
    if (!params.showLines) continue;
    ctx.beginPath();
    for (const [x1, y1, x2, y2] of tangentLines(g, params.linkGap)) {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();
  }
};

const drawInner = (geoms) => {
  for (const c of circleList) drawCircle(c, c.radius - params.innerInset, params.innerColor, 1);
  if (!params.fillLinks) return;
  for (const g of geoms) fillHull(g, params.innerInset, params.innerColor, 1);
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
  const geoms = links.map(([a, b]) => linkGeometry(a, b)).filter(Boolean);
  drawConnexions(geoms);
  if (params.inner) drawInner(geoms);
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
