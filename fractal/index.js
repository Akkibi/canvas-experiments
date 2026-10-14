import { createTweaks } from "../shared/tweaks.js";

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const params = {
  size: 100,
  shape: "circle",
  sides: 4,
  rotateWithAngle: true,
  angleStep: 0.03,
  shrink: 0.997,
  offsetDivisor: 5,
  minRadius: 1,
  lineWidth: 1,
  color: "#ffffff",
  fill: false,
  fillOpacity: 0.1,
  startX: 0.5,
  startY: 0,
};

const schema = {
  size: { label: "start radius", min: 10, max: 400, step: 1 },
  shape: { label: "shape", options: ["circle", "polygon"] },
  sides: { label: "polygon sides", min: 3, max: 12, step: 1 },
  rotateWithAngle: { label: "rotate with angle" },
  angleStep: { label: "angle step", min: -0.2, max: 0.2, step: 0.001 },
  shrink: { label: "shrink", min: 0.98, max: 0.9995, step: 0.0001 },
  offsetDivisor: { label: "offset divisor", min: 1, max: 20, step: 0.1 },
  minRadius: { label: "min radius", min: 0.5, max: 20, step: 0.5 },
  lineWidth: { label: "line width", min: 0.5, max: 6, step: 0.5 },
  color: { label: "color" },
  fill: { label: "fill" },
  fillOpacity: { label: "fill opacity", min: 0, max: 1, step: 0.01 },
  startX: { label: "start x", min: 0, max: 1, step: 0.01 },
  startY: { label: "start y", min: 0, max: 1, step: 0.01 },
};

const drawShape = (x, y, radius, angle) => {
  ctx.beginPath();
  if (params.shape === "circle") {
    ctx.arc(x, y, radius, 0, Math.PI * 2);
  } else {
    const rot = params.rotateWithAngle ? angle : 0;
    for (let i = 0; i < params.sides; i++) {
      const a = rot + (i / params.sides) * Math.PI * 2;
      const px = x + Math.cos(a) * radius;
      const py = y + Math.sin(a) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }
  if (params.fill) {
    ctx.globalAlpha = params.fillOpacity;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.stroke();
};

const render = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.strokeStyle = params.color;
  ctx.fillStyle = params.color;
  ctx.lineWidth = params.lineWidth;

  let x = canvas.width * params.startX;
  let y = canvas.height * params.startY;
  let radius = params.size;
  let angle = 0;
  while (radius >= params.minRadius) {
    drawShape(x, y, radius, angle);
    angle += params.angleStep;
    x += (Math.cos(angle) * radius) / params.offsetDivisor;
    y += (Math.sin(angle) * radius) / params.offsetDivisor;
    radius *= params.shrink;
  }
};

createTweaks(params, schema, render);
window.addEventListener("resize", render);
