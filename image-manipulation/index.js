// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth / 4;
canvas.height = window.innerHeight / 4;

// create an offscreen canvas
const offscreenCanvas = document.createElement("canvas");
const offCtx = offscreenCanvas.getContext("2d");
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;

let time = 0;
let letter = "&";

const draw = () => {
  time += 0.01;
  // draw a rectangle on the offscreen canvas
  offCtx.fillStyle = "black";
  offCtx.fillRect(0, 0, canvas.width, canvas.height);

  // draw a letter on the offscreen canvas
  offCtx.font =
    Math.abs(canvas.height / 2 + (canvas.height / 4) * Math.sin(time)) +
    "px sans-serif";
  offCtx.textAlign = "center";
  offCtx.textBaseline = "middle";
  offCtx.fillStyle = "white";
  offCtx.fillText(letter, canvas.width / 2, canvas.height / 2);

  // get imageData from offscreen canvas
  const imageData = offCtx.getImageData(
    0,
    0,
    offscreenCanvas.width,
    offscreenCanvas.height
  );

  // blur the imageData

  // color shift the imageData
  let colorShift = 10;

  // loop through the imageData and invert the colors
  for (let y = 0; y < offscreenCanvas.height; y++) {
    for (let x = 0; x < offscreenCanvas.width; x++) {
      const count = (y * offscreenCanvas.width + x) * 4;
      if (y % 10 === 0 || x % 100 === 0) {
        // red
        imageData.data[count] = imageData.data[count];
        // green
        imageData.data[count + offscreenCanvas.width * 8] =
          imageData.data[count + 1];
        // blue
        imageData.data[count + offscreenCanvas.width * 16] =
          imageData.data[count + 2];
      } else {
        // set to transparent
        // red
        imageData.data[count] = 0;
        // green
        imageData.data[count + 1] = 0;
        // blue
        imageData.data[count + 2] = 0;
        // imageData.data[count + 3] = 0;
      }
    }
  }

  // draw the imageData to the visible canvas
  ctx.putImageData(imageData, 0, 0);

  // loop
  requestAnimationFrame(draw);
};

const resize = () => {
  // Set canvas dimensions
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  offscreenCanvas.width = canvas.width;
  offscreenCanvas.height = canvas.height;
};

window.addEventListener("resize", resize);

draw();

window.addEventListener("keydown", (e) => {
  letter = e.key.toUpperCase();
});
