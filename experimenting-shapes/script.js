import { createTweaks } from "../shared/tweaks.js";
import { params, shapes, circles, texts, buildSchema, isCollapsed, setItemsListener } from "./state.js";
import { fitText, anchorOrigin, circlePoints, shapeLayout, shapePoints, circlePositions } from "./geometry.js";
import { buildSvg, downloadSvg, copyParameters } from "./export.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let hitCircles = [];
let selectedKey = null;
let now = 0;

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

const drawLabel = (key, x, y, radius, color) => {
  const text = texts.get(key) ?? "";
  const selected = key === selectedKey;
  if ((!text && !selected) || radius <= 0) return;
  const { size, width } = fitText(ctx, text, radius);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
  if (!selected) return;
  drawCircle(x, y, radius + 3, color, 2);
  if (Math.floor(now / 500) % 2 === 0) ctx.fillRect(x + width / 2 + 2, y - size / 2, 2, size);
};

const drawPolygonCircle = (x, y, radius, color) => {
  circlePoints(x, y, radius, params.precision).forEach((p, i) => {
    if (i) ctx.lineTo(p.x, p.y);
    else {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }
  });
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
};

const drawLabeledCircle = (key, x, y, radius, color, textColor, polygon = false) => {
  if (polygon) drawPolygonCircle(x, y, radius, color);
  else drawCircle(x, y, radius, color);
  hitCircles.push({ key, x, y, radius });
  drawLabel(key, x, y, radius, textColor);
};

const addPath = ({ shape, x, y, first, second }) => {
  shapePoints(shape, x, y, first, second, params.precision).forEach((p, i) => {
    if (i) ctx.lineTo(p.x, p.y);
    else ctx.moveTo(p.x, p.y);
  });
  ctx.closePath();
};

const tracePath = (layout) => {
  ctx.beginPath();
  addPath(layout);
};

const drawOutline = (layout) => {
  const { shape } = layout;
  if (!shape.outline) return;
  ctx.save();
  ctx.beginPath();
  if (shape.outlineSide === "outset") ctx.rect(0, 0, canvas.width, canvas.height);
  addPath(layout);
  ctx.clip("evenodd");
  tracePath(layout);
  ctx.strokeStyle = shape.outlineColor;
  ctx.lineWidth = shape.outlineWidth * 2;
  ctx.stroke();
  ctx.restore();
};

const drawFullShape = (layout) => {
  const { shape, x, y, first, second } = layout;
  tracePath(layout);
  if (shape.fill) {
    ctx.fillStyle = shape.fillColor;
    ctx.fill();
  }
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.lineWidth;
  ctx.stroke();
  for (const c of circlePositions(shape, x, y, first, second)) {
    drawLabeledCircle(c.key, c.x, c.y, c.radius, shape.circleColor, shape.textColor);
  }
};

const clicks = [];

const drawClicks = () => {
  for (let i = clicks.length - 1; i >= 0; i--) {
    const click = clicks[i];
    drawCircle(
      click.x,
      click.y,
      click.size,
      `hsla(180deg, 100%, ${100 - click.size}%, ${0.5 - click.size * 0.015})`,
      4,
    );
    click.size += 3.5;
    if (click.size > 50) clicks.splice(i, 1);
  }
};

let framecount = 0;
let lastFrameTime = 0;

const animate = (timestamp) => {
  requestAnimationFrame(animate);
  if (timestamp - lastFrameTime <= 1000 / params.fps) return;
  lastFrameTime = timestamp;
  now = timestamp;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hitCircles = [];
  if (!params.paused) framecount++;

  const layouts = shapes.map((shape) => shapeLayout(shape, canvas.width, canvas.height, framecount));
  circles.forEach((circle) => {
    const { x, y } = anchorOrigin(circle, canvas.width, canvas.height);
    drawLabeledCircle(`c${circle.id}`, x, y, circle.radius, circle.color, circle.textColor, true);
  });
  layouts.forEach(drawOutline);
  layouts.forEach(drawFullShape);
  drawClicks();
};

const isPanelEvent = (e) => e.target.closest?.("#tweaks, input, textarea");

window.addEventListener("click", (e) => {
  if (isPanelEvent(e)) return;
  clicks.push({ x: e.clientX, y: e.clientY, size: 10 });
  const hit = hitCircles.findLast(
    (c) => Math.hypot(e.clientX - c.x, e.clientY - c.y) <= c.radius,
  );
  if (!hit) {
    selectedKey = null;
  } else if (texts.has(hit.key)) {
    texts.delete(hit.key);
    selectedKey = null;
  } else {
    selectedKey = hit.key;
  }
});

window.addEventListener("keydown", (e) => {
  if (!selectedKey || isPanelEvent(e) || e.ctrlKey || e.metaKey || e.altKey) return;
  const text = texts.get(selectedKey) ?? "";
  if (e.key === "Escape" || e.key === "Enter") {
    selectedKey = null;
  } else if (e.key === "Backspace") {
    if (text.length > 1) texts.set(selectedKey, text.slice(0, -1));
    else texts.delete(selectedKey);
  } else if (e.key.length === 1) {
    texts.set(selectedKey, text + e.key);
  } else {
    return;
  }
  e.preventDefault();
});

const actions = {
  exportSvg: () => downloadSvg(buildSvg(ctx, canvas.width, canvas.height, framecount)),
  copyParameters,
};
const tweaks = createTweaks(params, buildSchema(actions), () => {}, isCollapsed);
setItemsListener(() => tweaks.refresh(buildSchema(actions), isCollapsed));
requestAnimationFrame(animate);

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
