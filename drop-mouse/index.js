// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const buttonsList = document.querySelectorAll(".btn");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// offscreen canvas buffer
const buffer = document.createElement("canvas");
const bufferCtx = buffer.getContext("2d");
buffer.width = canvas.height * 0.08;
buffer.height = canvas.height * 0.08;
bufferCtx // draw a blured circle on the buffer
  .beginPath();
bufferCtx.arc(
  buffer.width / 2,
  buffer.height / 2,
  buffer.height / 4,
  0,
  2 * Math.PI,
);
bufferCtx.fillStyle = "white";
bufferCtx.fill();
bufferCtx.filter = `blur(${buffer.height / 8}px)`;
bufferCtx.globalCompositeOperation = "source-over";
bufferCtx.drawImage(buffer, 0, 0);

// draw the buffer on the canvas
ctx.drawImage(buffer, 0, 0, buffer.width, buffer.height);

document.body.onscroll = (e) => {
  console.log(e.target.scrollingElement.scrollTop);
};

const drawButtons = () => {
  buttonsList.forEach((button) => {
    const size = { x: button.offsetWidth, y: button.offsetHeight };
    console.log(size);
    console.log(button.getBoundingClientRect());
    ctx.beginPath();
    ctx.rect(
      button.getBoundingClientRect().x,
      button.getBoundingClientRect().y,
      size.x,
      size.y,
    );
    ctx.fillStyle = "blue";
    ctx.filter = "blur(15px)";
    ctx.fill();
  });
};

window.addEventListener("mousemove", (e) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    buffer,
    e.clientX - buffer.width / 2,
    e.clientY - buffer.height / 2,
    buffer.width,
    buffer.height,
  );
  console.log("hello");
  // drawButtons();
});

console.log("hello wolrd");
