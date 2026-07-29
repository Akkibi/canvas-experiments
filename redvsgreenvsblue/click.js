// Get the canvas element
const canvas = document.getElementById("canvas-click");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isloopRunning = false;
const sparkles = [];

const drawLine = ({ x, y, dx, dy, opacity, tint }) => {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + dx, y + dy);
  ctx.lineWidth = tint + 0.5;
  ctx.strokeStyle = "hsla(50, 100%," + opacity * 100 + "%, " + opacity + ")";
  ctx.stroke();
};

const updateSparkle = (sparkle, index) => {
  drawLine(sparkle);
  sparkle.y += sparkle.dy;
  sparkle.x += sparkle.dx;
  sparkle.dy += 0.5;
  sparkle.opacity -= 0.02;
  if (
    sparkle.y > canvas.height ||
    sparkle.x > canvas.width ||
    sparkle.width < 0 ||
    sparkle.opacity < 0
  ) {
    sparkles.splice(index, 1);
    // console.log(sparkles);
  }
};

// animation loop
let lastFrameTime = 0;
const fpsInterval = 1000 / 59;
const animate = (timestamp) => {
  if (!timestamp) {
    requestAnimationFrame(animate);
  }
  const deltaTime = timestamp - lastFrameTime;
  if (deltaTime > fpsInterval) {
    lastFrameTime = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    isloopRunning = true;

    sparkles.forEach((sparkle, index) => {
      updateSparkle(sparkle, index);
    });
    if (sparkles.length === 0) {
      isloopRunning = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      console.log("no more sparkles");
    }
  }
  if (isloopRunning) {
    requestAnimationFrame(animate);
  }
};
// const animate = (timestamp) => {
//   console.log("animate");
//   if (!lastFrameTime) lastFrameTime = timestamp;
//   const elapsed = timestamp - lastFrameTime;

//   if (elapsed > fpsInterval) {
//     lastFrameTime = timestamp - (elapsed % fpsInterval);
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     isloopRunning = true;

//     sparkles.forEach((sparkle, index) => {
//       updateSparkle(sparkle, index);
//     });

//     if (sparkles.length === 0) {
//       isloopRunning = false;
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//     }
//   }

//   if (isloopRunning) {
//     requestAnimationFrame(animate);
//   }
// };
const click = (event) => {
  for (let i = 0; i < 10; i++) {
    const x = event.clientX;
    const y = event.clientY;
    const random = Math.random();
    const dx = Math.random() * i ** 2 - i ** 2 / 2;
    const dy = Math.random() * i ** 2 - i ** 2 / 2;
    const tint = Math.random();
    const sparkle = { x, y, dx, dy, opacity: 1, tint };
    sparkles.push(sparkle);
  }
  console.log(sparkles);
  if (!isloopRunning) {
    animate();
    isloopRunning = true;
  }
};

window.addEventListener("click", click);
