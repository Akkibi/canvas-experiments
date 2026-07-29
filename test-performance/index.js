// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// Set the number of particles
const ParticleRate = 1;
let speedMultiplier = 1;
const particles = [];

const generateParticles = () => {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 1 + 1;
  const startDistance = (Math.random() * canvas.height) / 2;
  particles.push({
    startDistance: startDistance,
    speed: speed,
    angle: angle,
    color: 220,
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
    drawParticles(
      particle.oldPos.x - Math.cos(particle.angle) * 2,
      particle.oldPos.y - Math.sin(particle.angle) * 2,
      particle.newPos.x + Math.cos(particle.angle) * 2,
      particle.newPos.y + Math.sin(particle.angle) * 2,
      size + 2,
      "black"
    );
    particle.oldPos.x = particle.newPos.x;
    particle.oldPos.y = particle.newPos.y;
    particle.newPos.x +=
      Math.cos(particle.angle) * particle.speed * speedMultiplier;
    particle.newPos.y +=
      Math.sin(particle.angle) * particle.speed * speedMultiplier;
    particle.speed += 0.01 + (canvas.width - particle.startDistance) / 10000;
    if (particle.opacity < 1) {
      particle.opacity += 0.05;
    }
    drawParticles(
      particle.oldPos.x - Math.cos(particle.angle),
      particle.oldPos.y - Math.sin(particle.angle),
      particle.newPos.x + Math.cos(particle.angle),
      particle.newPos.y + Math.sin(particle.angle),
      size,
      "hsla(" +
        particle.color +
        "deg, 100%," +
        Math.abs(speedMultiplier * 2 + 50) +
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
  // if (speedMultiplier > 2) {
  //   for (let i = 0; i < speedMultiplier; i++) {
  //     generateParticles();
  //   }
  // } else {
  //   if (time % Math.round(1 / speedMultiplier) === 0) {
  //     generateParticles();
  //   }
  // }
  for (let i = 0; i < 5; i++) {
    generateParticles();
  }
  updateParticles();
  drawBorder();
  requestAnimationFrame(draw);
};

draw();

window.addEventListener("wheel", (e) => {
  speedMultiplier += e.deltaY / 1000;
  speedMultiplier = Math.max(0.1, speedMultiplier);
});
