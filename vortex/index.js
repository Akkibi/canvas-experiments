import { createTweaks } from "../shared/tweaks.js";

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let centerX = canvas.width / 2;
let centerY = canvas.height / 2;

const params = {
  blackHoleRadius: 100,
  segments: 20,
  spawnEvery: 2,
  startSpeed: 0.01,
  speedGain: 0.0001,
  inwardFactor: 10,
  spinFactor: 0.5,
  opacityGain: 0.001,
  tailStep: 0.1,
  squash: 0.5,
  lineWidth: 1,
  color: "#ffffff",
  paused: false,
};

const SKIP_STEPS = 100;

const schema = {
  skip: { label: `skip ${SKIP_STEPS} steps`, action: () => skip(SKIP_STEPS) },
  paused: { label: "paused" },
  blackHoleRadius: { label: "black hole radius", min: 0, max: 400, step: 1 },
  segments: { label: "tail segments", min: 2, max: 60, step: 1 },
  spawnEvery: { label: "spawn every (frames)", min: 1, max: 20, step: 1 },
  startSpeed: { label: "start speed", min: 0.001, max: 0.2, step: 0.001 },
  speedGain: { label: "speed gain", min: 0, max: 0.002, step: 0.00001 },
  inwardFactor: { label: "inward factor", min: 1, max: 40, step: 0.5 },
  spinFactor: { label: "spin factor", min: 0, max: 2, step: 0.01 },
  opacityGain: { label: "fade-in rate", min: 0.0001, max: 0.05, step: 0.0001 },
  tailStep: { label: "tail step", min: 0, max: 1, step: 0.01 },
  squash: { label: "vertical squash", min: 0.1, max: 1.5, step: 0.01 },
  lineWidth: { label: "line width", min: 0.5, max: 6, step: 0.5 },
  color: { label: "color" },
};

const particles = [];
let frame = 0;

const generateParticle = () => {
  particles.push({
    distance: Math.hypot(centerX, centerY),
    speed: params.startSpeed,
    angle: Math.random() * 360,
    opacity: 0,
  });
};

const drawBlackHole = () => {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(Math.PI);
  ctx.beginPath();
  ctx.arc(0, 0, params.blackHoleRadius, 0, Math.PI);
  ctx.fillStyle = "#000";
  ctx.fill();
  ctx.restore();
};

const pointAt = (p, i) => {
  const a = p.angle - (p.speed * i) / 2;
  const d = i * params.tailStep;
  return [
    centerX + (p.distance + d) * Math.cos(a),
    centerY + (p.distance * params.squash + d) * Math.sin(a),
  ];
};

const drawParticles = () => {
  ctx.strokeStyle = params.color;
  ctx.lineWidth = params.lineWidth;
  for (const p of particles) {
    if (p.distance <= params.blackHoleRadius) continue;
    for (let i = 0; i < params.segments; i++) {
      const [x1, y1] = pointAt(p, i - 1);
      const [x2, y2] = pointAt(p, i);
      ctx.globalAlpha = (1 - i / params.segments) * p.opacity;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
};

const updateParticles = () => {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.opacity = Math.min(1, p.opacity + params.opacityGain);
    p.angle += p.speed * params.spinFactor;
    p.distance -= p.speed * params.inwardFactor;
    p.speed += params.speedGain;
    if (p.distance < params.blackHoleRadius) particles.splice(i, 1);
  }
};

const step = () => {
  frame++;
  updateParticles();
  if (frame % params.spawnEvery === 0) generateParticle();
};

const skip = (n) => {
  for (let i = 0; i < n; i++) step();
};

const draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawParticles();
  drawBlackHole();
};

const loop = () => {
  if (!params.paused) step();
  draw();
  requestAnimationFrame(loop);
};

generateParticle();
if (new URLSearchParams(location.search).has("thumb")) skip(4000);
createTweaks(params, schema, () => {});
loop();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
});
