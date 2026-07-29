// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const offCtxText = document.createElement("canvas").getContext("2d");
const offCtxWave = document.createElement("canvas").getContext("2d");
const offCtxComposition = document.createElement("canvas").getContext("2d");
// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// offscreen canvas
offCtxText.canvas.width = canvas.width;
offCtxText.canvas.height = canvas.height;
offCtxWave.canvas.width = canvas.width;
offCtxWave.canvas.height = canvas.height;
offCtxComposition.canvas.width = canvas.width;
offCtxComposition.canvas.height = canvas.height;

// image data
let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
let offImageDataText = offCtxText.getImageData(
  0,
  0,
  canvas.width,
  canvas.height
);
let offImageDataWave = offCtxWave.getImageData(
  0,
  0,
  canvas.width,
  canvas.height
);
let offImageDataComposition = offCtxComposition.getImageData(
  0,
  0,
  canvas.width,
  canvas.height
);

// Set the wave properties
const waveX = canvas.width / 2;
const waveY = canvas.height;
const waveSpeed = 0.3;
const waveFrequency = 0.4;
const waveAmplitude = 4;
let time = 0;

function drawText() {
  offCtxText.fillStyle = "red";
  offCtxText.textBaseline = "middle";
  offCtxText.textAlign = "center";
  offCtxText.font = "bold " + canvas.width / 5 + "px Arial";
  offCtxText.filter = "blur(2px)";
  offCtxText.fillText("AKIRA", canvas.width / 2, canvas.height / 2);
  offImageDataText = offCtxText.getImageData(0, 0, canvas.width, canvas.height);
}

function distortOffCtx() {
  offImageDataComposition = offCtxComposition.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );
  let count = 0;
  let data = 0;
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      // DrawWave
      const dx = x - waveX;
      const dy = y - waveY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const pixelIndex = (x + y * canvas.width) * 4;
      const wave = Math.sin(
        (distance * waveFrequency - time * waveSpeed) / waveAmplitude
      );
      const waveAjusted = (wave * 0.2 + 0.8) * (100 / distance) * 255;
      offImageDataWave.data[pixelIndex] = waveAjusted;

      // DrawText with wave offset
      let textDisplaced = 0;
      if (y > canvas.height / 3 && y < (canvas.height / 3) * 2) {
        const angle = Math.atan2(dy, dx);
        const offsetX = (Math.cos(angle) * waveAjusted) / (waveFrequency * 4);
        const offsetY = (Math.sin(angle) * waveAjusted) / (waveFrequency * 4);

        const newX = x - Math.round(offsetX);
        const newY = y - Math.round(offsetY);

        const newPixelIndex = (newX + newY * canvas.width) * 4;

        textDisplaced = offImageDataText.data[newPixelIndex + 3];
        // if (offImageDataText.data[newPixelIndex + 3] !== 0) {
        //   offImageDataComposition.data[pixelIndex] =
        //     offImageDataText.data[newPixelIndex + 3];
        // }
      }

      // Add color and compose
      imageData.data[pixelIndex] = waveAjusted + textDisplaced / 2;
      imageData.data[pixelIndex + 1] = 128 + waveAjusted - textDisplaced / 2;
      imageData.data[pixelIndex + 2] = 255 - textDisplaced / 1.25;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function initImageData() {
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      const pixelIndex = (x + y * canvas.width) * 4;
      imageData.data[pixelIndex] = 0;
      imageData.data[pixelIndex + 1] = 0;
      imageData.data[pixelIndex + 2] = 255;
      imageData.data[pixelIndex + 3] = 255;
    }
  }
}

drawText();
initImageData();
distortOffCtx();

function test(image) {
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      const pixelIndex = (x + y * canvas.width) * 4;
      if (image.data[pixelIndex + 3] > 50) {
        imageData.data[pixelIndex] = image.data[pixelIndex];
        imageData.data[pixelIndex + 1] = image.data[pixelIndex + 1];
        imageData.data[pixelIndex + 2] = image.data[pixelIndex + 2];
        imageData.data[pixelIndex + 3] = image.data[pixelIndex + 3];
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function draw() {
  if (time % 2 === 0) {
    time += 4;
    distortOffCtx();
  }
  requestAnimationFrame(draw);
}

draw();
