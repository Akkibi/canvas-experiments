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
  bendStiffness: 0.01,
  shearStiffness: 0.01,
  damping: 0.02,
  gravity: 0.1,
  bounce: 0.3,
  friction: 0.9,
  pinTopRow: false,
  substeps: 4,
  pointSize: 10,
  showLinks: true,
  showPoints: true,
  showImage: true,
  color: "#ffffff",
};

const schema = {
  density: { label: "spacing", min: 10, max: 100, step: 1 },
  rows: { label: "rows", min: 2, max: 30, step: 1 },
  columns: { label: "columns", min: 2, max: 30, step: 1 },
  startX: { label: "start x", min: 0, max: 800, step: 1 },
  startY: { label: "start y", min: 0, max: 800, step: 1 },
  stiffness: { label: "stiffness", min: 0, max: 0.2, step: 0.001 },
  bendStiffness: { label: "bend stiffness", min: 0, max: 0.1, step: 0.001 },
  shearStiffness: { label: "shear stiffness", min: 0, max: 0.1, step: 0.001 },
  damping: { label: "damping", min: 0, max: 0.2, step: 0.001 },
  gravity: { label: "gravity", min: -0.5, max: 0.5, step: 0.01 },
  bounce: { label: "bounce", min: 0, max: 1, step: 0.01 },
  friction: { label: "floor friction", min: 0, max: 1, step: 0.01 },
  pinTopRow: { label: "pin top row" },
  substeps: { label: "substeps", min: 1, max: 10, step: 1 },
  pointSize: { label: "point size", min: 2, max: 30, step: 1 },
  showLinks: { label: "show links" },
  showPoints: { label: "show points" },
  showImage: { label: "show image" },
  clearImage: { label: "clear image", action: () => (image = null) },
  copyParameters: {
    label: "copy parameters",
    action: () => navigator.clipboard.writeText(JSON.stringify(params, null, 2)),
  },
  color: { label: "color" },
};

let points = [];
let gridKey = "";
let image = null;
let dragged = null;
let dragVx = 0;
let dragVy = 0;

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

const spring = (a, b, rest = params.density, k = params.stiffness) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy) || 0.0001;
  const f = (distance - rest) * k;
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
      if (params.bendStiffness > 0) {
        const bend = params.density * 2;
        if (j + 2 < params.columns) spring(points[i][j], points[i][j + 2], bend, params.bendStiffness);
        if (i + 2 < params.rows) spring(points[i][j], points[i + 2][j], bend, params.bendStiffness);
      }
      if (params.shearStiffness > 0 && i + 1 < params.rows) {
        const diag = params.density * Math.SQRT2;
        if (j + 1 < params.columns) spring(points[i][j], points[i + 1][j + 1], diag, params.shearStiffness);
        if (j > 0) spring(points[i][j], points[i + 1][j - 1], diag, params.shearStiffness);
      }
    }
  }

  const damp = 1 - params.damping;
  const floor = canvas.height;
  const wall = canvas.width;
  points.forEach((row, i) => {
    row.forEach((p) => {
      if (p === dragged) {
        p.vx = 0;
        p.vy = 0;
        return;
      }
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

const drawTriangle = (p0, p1, p2, s0x, s0y, s1x, s1y, s2x, s2y) => {
  const cx = (p0.x + p1.x + p2.x) / 3;
  const cy = (p0.y + p1.y + p2.y) / 3;
  const grow = (p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return [p.x + (dx / len) * 0.6, p.y + (dy / len) * 0.6];
  };
  const du1x = s1x - s0x;
  const du1y = s1y - s0y;
  const du2x = s2x - s0x;
  const du2y = s2y - s0y;
  const d1x = p1.x - p0.x;
  const d1y = p1.y - p0.y;
  const d2x = p2.x - p0.x;
  const d2y = p2.y - p0.y;
  const det = du1x * du2y - du2x * du1y;
  const a = (d1x * du2y - d2x * du1y) / det;
  const c = (d2x * du1x - d1x * du2x) / det;
  const b = (d1y * du2y - d2y * du1y) / det;
  const d = (d2y * du1x - d1y * du2x) / det;
  ctx.save();
  ctx.beginPath();
  const g0 = grow(p0);
  const g1 = grow(p1);
  const g2 = grow(p2);
  ctx.moveTo(g0[0], g0[1]);
  ctx.lineTo(g1[0], g1[1]);
  ctx.lineTo(g2[0], g2[1]);
  ctx.closePath();
  ctx.clip();
  ctx.setTransform(a, b, c, d, p0.x - a * s0x - c * s0y, p0.y - b * s0x - d * s0y);
  ctx.drawImage(image, 0, 0);
  ctx.restore();
};

const drawImageMesh = () => {
  const cw = image.width / (params.columns - 1);
  const ch = image.height / (params.rows - 1);
  for (let i = 0; i < params.rows - 1; i++) {
    for (let j = 0; j < params.columns - 1; j++) {
      const tl = points[i][j];
      const tr = points[i][j + 1];
      const bl = points[i + 1][j];
      const br = points[i + 1][j + 1];
      const x0 = j * cw;
      const y0 = i * ch;
      drawTriangle(tl, tr, bl, x0, y0, x0 + cw, y0, x0, y0 + ch);
      drawTriangle(tr, br, bl, x0 + cw, y0, x0 + cw, y0 + ch, x0, y0 + ch);
    }
  }
};

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (image && params.showImage) drawImageMesh();
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
  if (params.showPoints) points.forEach((row) => row.forEach((p) => ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s)));
};

const animate = () => {
  for (let i = 0; i < params.substeps; i++) step();
  draw();
  requestAnimationFrame(animate);
};

const isBackground = (e) => e.target === document.body || e.target === document.documentElement || e.target === canvas;

window.addEventListener("pointerdown", (e) => {
  if (!isBackground(e)) return;
  const reach = Math.max(params.pointSize, 24);
  let best = null;
  let bestDist = reach;
  points.forEach((row) =>
    row.forEach((p) => {
      const d = Math.hypot(p.x - e.clientX, p.y - e.clientY);
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }),
  );
  if (!best) return;
  dragged = best;
  dragVx = 0;
  dragVy = 0;
  best.x = e.clientX;
  best.y = e.clientY;
});

window.addEventListener("pointermove", (e) => {
  if (!dragged) return;
  dragVx = (e.clientX - dragged.x) / params.substeps;
  dragVy = (e.clientY - dragged.y) / params.substeps;
  dragged.x = e.clientX;
  dragged.y = e.clientY;
});

window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = [...e.dataTransfer.files].find((f) => f.type.startsWith("image/"));
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    image = img;
    URL.revokeObjectURL(img.src);
  };
  img.src = URL.createObjectURL(file);
});

const release = () => {
  if (!dragged) return;
  dragged.vx = dragVx;
  dragged.vy = dragVy;
  dragged = null;
};
window.addEventListener("pointerup", release);
window.addEventListener("pointercancel", release);

buildGrid();
createTweaks(params, schema, syncGrid);
animate();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
