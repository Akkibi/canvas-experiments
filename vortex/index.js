// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth / 1;
canvas.height = window.innerHeight / 1;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const blackHoleRadius = 100;

// create particles
const particles = [];

// generate random particles
const generateParticle = () => {
  particles.push({
    distance: Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2)),
    speed: 0.01,
    angle: Math.random() * 360,
    opacity: 0,
  });
};

// draw black hole
const drawBlackHole = () => {
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(Math.PI);
  ctx.beginPath();
  ctx.arc(0, 0, blackHoleRadius, 0, Math.PI);
  ctx.fillStyle = "rgba(0, 0, 0, 1)";
  ctx.fill();
  ctx.restore();
};

const segments = 20;

// draw particles
const drawParticles = () => {
  particles.forEach((particle) => {
    for (let i = 0; i < segments; i++) {
      if (particle.distance > blackHoleRadius) {
        ctx.beginPath();
        ctx.moveTo(
          centerX +
            (particle.distance + (i - 1) * 0.1) *
              Math.cos(particle.angle - (particle.speed * (i - 1)) / 2),
          centerY +
            (particle.distance / 2 + (i - 1) * 0.1) *
              Math.sin(particle.angle - (particle.speed * (i - 1)) / 2)
        );
        ctx.lineTo(
          centerX +
            (particle.distance + i * 0.1) *
              Math.cos(particle.angle - (particle.speed * i) / 2),
          centerY +
            (particle.distance / 2 + i * 0.1) *
              Math.sin(particle.angle - (particle.speed * i) / 2),
          2,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle =
          "rgba(255, 255, 255, " + (1 - i / segments) * particle.opacity + ")";
        ctx.strokewidth = 1;
        ctx.stroke();
      }
    }
  });
};

// update particles
const updateParticles = () => {
  particles.forEach((particle) => {
    if (particle.opacity < 1) {
      particle.opacity += 0.001;
    }
    particle.angle += particle.speed / 2;
    particle.distance -= particle.speed * 10;
    particle.speed += 0.0001;
    if (particle.distance < blackHoleRadius) {
      particles.splice(particles.indexOf(particle), 1);
    }
  });
};

// clear canvas
const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// draw
const draw = () => {
  clearCanvas();
  drawParticles();
  drawBlackHole();
  updateParticles();
};

let frame = 0;

// loop
const loop = () => {
  frame++;
  draw();
  if (frame % 2 === 0) {
    generateParticle();
  }
  requestAnimationFrame(loop);
};

generateParticle();
drawParticles();

console.log(particles);
loop();
