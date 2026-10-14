import { createTweaks } from "../shared/tweaks.js";

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const params = {
  density: 40,
  rows: 10,
  columns: 10,
  startX: 100,
  startY: 100,
  stiffness: 0.02,
  damping: 0.02,
  gravity: 0.1,
  bounce: 0.3,
  friction: 0.9,
  pinTopRow: false,
  substeps: 4,
  pointSize: 10,
  showLinks: true,
  color: "#ffffff",
};

const schema = {
  density: { label: "spacing", min: 10, max: 100, step: 1 },
  rows: { label: "rows", min: 2, max: 30, step: 1 },
  columns: { label: "columns", min: 2, max: 30, step: 1 },
  startX: { label: "start x", min: 0, max: 800, step: 1 },
  startY: { label: "start y", min: 0, max: 800, step: 1 },
  stiffness: { label: "stiffness", min: 0, max: 0.2, step: 0.001 },
  damping: { label: "damping", min: 0, max: 0.2, step: 0.001 },
  gravity: { label: "gravity", min: -0.5, max: 0.5, step: 0.01 },
  bounce: { label: "bounce", min: 0, max: 1, step: 0.01 },
  friction: { label: "floor friction", min: 0, max: 1, step: 0.01 },
  pinTopRow: { label: "pin top row" },
  substeps: { label: "substeps", min: 1, max: 10, step: 1 },
  pointSize: { label: "point size", min: 2, max: 30, step: 1 },
  showLinks: { label: "show links" },
  color: { label: "color" },
};

let points = [];
let gridKey = "";

const buildGrid = () => {
  points = [];
  for (let i = 0; i < params.rows; i++) {
    const row = [];
    for (let j = 0; j < params.columns; j++) {
      row.push({
        x: j * params.density + params.startX,
        y: i * params.density + params.startY,
        vx: 0,
        vy: 0,
      });
    }
    points.push(row);
  }
};

const syncGrid = () => {
  const key = [params.rows, params.columns, params.density, params.startX, params.startY].join();
  if (key === gridKey) return;
  gridKey = key;
  buildGrid();
};

const spring = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy) || 0.0001;
  const f = (distance - params.density) * params.stiffness;
  const fx = (dx / distance) * f;
  const fy = (dy / distance) * f;
  a.vx += fx;
  a.vy += fy;
  b.vx -= fx;
  b.vy -= fy;
};

const step = () => {
  for (let i = 0; i < params.rows; i++) {
    for (let j = 0; j < params.columns; j++) {
      if (j + 1 < params.columns) spring(points[i][j], points[i][j + 1]);
      if (i + 1 < params.rows) spring(points[i][j], points[i + 1][j]);
    }
  }

  const damp = 1 - params.damping;
  const floor = canvas.height;
  const wall = canvas.width;
  points.forEach((row, i) => {
    row.forEach((p) => {
      if (params.pinTopRow && i === 0) {
        p.vx = 0;
        p.vy = 0;
        return;
      }
      p.vy += params.gravity;
      p.vx *= damp;
      p.vy *= damp;
      p.x += p.vx;
      p.y += p.vy;
      if (p.y > floor) {
        p.y = floor;
        p.vy *= -params.bounce;
        p.vx *= params.friction;
      }
      if (p.x < 0 || p.x > wall) {
        p.x = Math.min(Math.max(p.x, 0), wall);
        p.vx *= -params.bounce;
      }
    });
  });
};

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = params.color;
  ctx.fillStyle = params.color;
  if (params.showLinks) {
    ctx.beginPath();
    for (let i = 0; i < params.rows; i++) {
      for (let j = 0; j < params.columns; j++) {
        const p = points[i][j];
        if (j + 1 < params.columns) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(points[i][j + 1].x, points[i][j + 1].y);
        }
        if (i + 1 < params.rows) {
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(points[i + 1][j].x, points[i + 1][j].y);
        }
      }
    }
    ctx.stroke();
  }
  const s = params.pointSize;
  points.forEach((row) => row.forEach((p) => ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s)));
};

const animate = () => {
  for (let i = 0; i < params.substeps; i++) step();
  draw();
  requestAnimationFrame(animate);
};

buildGrid();
createTweaks(params, schema, syncGrid);
animate();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
