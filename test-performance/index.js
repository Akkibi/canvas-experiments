import { createTweaks } from "../shared/tweaks.js";

// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let centerX = canvas.width / 2;
let centerY = canvas.height / 2;

const params = {
  particlesPerFrame: 5,
  speedMultiplier: 1,
  acceleration: 0.01,
  hue: 220,
  stretchRate: 0.06,
  maxStretch: 40,
  releaseLerp: 0.08,
};

const schema = {
  particlesPerFrame: { label: "particles / frame", min: 1, max: 50, step: 1 },
  speedMultiplier: { label: "speed", min: 0.1, max: 10, step: 0.1 },
  acceleration: { label: "acceleration", min: 0, max: 0.1, step: 0.001 },
  hue: { label: "hue", min: 0, max: 360, step: 1 },
  stretchRate: { label: "space stretch rate", min: 0.01, max: 0.3, step: 0.01 },
  maxStretch: { label: "max stretch", min: 1, max: 200, step: 1 },
  releaseLerp: { label: "release lerp", min: 0.01, max: 0.5, step: 0.01 },
};

let stretch = 1;
let spaceDown = false;
const particles = [];

const generateParticles = () => {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 1 + 1;
  const startDistance = (Math.random() * canvas.height) / 2;
  particles.push({
    startDistance: startDistance,
    speed: speed,
    angle: angle,
    color: params.hue,
    opacity: 0,
    oldPos: {
      x: centerX + Math.cos(angle) * startDistance,
      y: centerY + Math.sin(angle) * startDistance,
    },
    newPos: {
      x: centerX + Math.cos(angle) * startDistance * speed,
      y: centerY + Math.sin(angle) * startDistance * speed,
    },
  });
};

const drawParticles = (oldx, oldy, x, y, size, color) => {
  ctx.beginPath();
  ctx.moveTo(oldx, oldy);
  ctx.lineTo(x, y);
  ctx.lineWidth = size;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.closePath();
};

const updateParticles = () => {
  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    const distance = Math.sqrt(
      (particle.newPos.x - centerX) ** 2 + (particle.newPos.y - centerY) ** 2
    );
    const size = (distance / (canvas.height / 2)) * 2 + 1;
    const tail =
      (particle.speed * params.speedMultiplier) * (stretch - 1);
    drawParticles(
      particle.oldPos.x - Math.cos(particle.angle) * (2 + tail),
      particle.oldPos.y - Math.sin(particle.angle) * (2 + tail),
      particle.newPos.x + Math.cos(particle.angle) * 2,
      particle.newPos.y + Math.sin(particle.angle) * 2,
      size + 2,
      "black"
    );
    particle.oldPos.x = particle.newPos.x;
    particle.oldPos.y = particle.newPos.y;
    particle.newPos.x +=
      Math.cos(particle.angle) * particle.speed * params.speedMultiplier;
    particle.newPos.y +=
      Math.sin(particle.angle) * particle.speed * params.speedMultiplier;
    particle.speed += params.acceleration + (canvas.width - particle.startDistance) / 10000;
    if (particle.opacity < 1) {
      particle.opacity += 0.05;
    }
    drawParticles(
      particle.oldPos.x - Math.cos(particle.angle) * (1 + tail),
      particle.oldPos.y - Math.sin(particle.angle) * (1 + tail),
      particle.newPos.x + Math.cos(particle.angle),
      particle.newPos.y + Math.sin(particle.angle),
      size,
      "hsla(" +
        particle.color +
        "deg, 100%," +
        Math.abs(params.speedMultiplier * 2 + 50) +
        "%, " +
        particle.opacity +
        ")"
      // "white",
    );
    if (
      particle.oldPos.x < 0 ||
      particle.oldPos.x > canvas.width ||
      particle.oldPos.y < 0 ||
      particle.oldPos.y > canvas.height
    ) {
      particles.splice(i, 1);
      i--;
    }
  }
};

let time = 0;

const drawBorder = () => {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(canvas.width, 0);
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.lineTo(0, 0);
  ctx.lineWidth = 10;
  ctx.strokeStyle = "black";
  ctx.stroke();
  ctx.closePath();
};

const draw = () => {
  time++;
  // if (params.speedMultiplier > 2) {
  //   for (let i = 0; i < params.speedMultiplier; i++) {
  //     generateParticles();
  //   }
  // } else {
  //   if (time % Math.round(1 / params.speedMultiplier) === 0) {
  //     generateParticles();
  //   }
  // }
  stretch = spaceDown
    ? Math.min(params.maxStretch, stretch * (1 + params.stretchRate))
    : stretch + (1 - stretch) * params.releaseLerp;
  for (let i = 0; i < params.particlesPerFrame; i++) {
    generateParticles();
  }
  updateParticles();
  drawBorder();
  requestAnimationFrame(draw);
};

draw();

const isTyping = (e) => e.target instanceof HTMLElement && e.target.matches("input, textarea");

window.addEventListener("keydown", (e) => {
  if (e.code !== "Space" || isTyping(e)) return;
  e.preventDefault();
  spaceDown = true;
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Space") spaceDown = false;
});

createTweaks(params, schema, () => {});

window.addEventListener("wheel", (e) => {
  params.speedMultiplier += e.deltaY / 1000;
  params.speedMultiplier = Math.max(0.1, params.speedMultiplier);
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  centerX = canvas.width / 2;
  centerY = canvas.height / 2;
});
