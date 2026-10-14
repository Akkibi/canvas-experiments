import { SimplexNoise } from "./simplexNoise.js";
import { createTweaks } from "../shared/tweaks.js";

const params = {
  renderScale: 1,
  radiusInset: 100,
  noiseScale: 400,
  noiseAmount: 20,
  timeSpeed: 0.1,
  bandWidth: 10,
  bandR: 0.56,
  bandG: 0.6,
  bandB: 0.64,
};

const schema = {
  renderScale: { label: "render scale", min: 0.25, max: 1, step: 0.05 },
  radiusInset: { label: "radius inset", min: 0, max: 400, step: 1 },
  noiseScale: { label: "noise scale", min: 50, max: 1000, step: 10 },
  noiseAmount: { label: "noise amount", min: 0, max: 100, step: 1 },
  timeSpeed: { label: "time speed", min: 0, max: 0.5, step: 0.01 },
  bandWidth: { label: "band sharpness", min: 1, max: 30, step: 0.5 },
  bandR: { label: "red band", min: 0, max: 1, step: 0.01 },
  bandG: { label: "green band", min: 0, max: 1, step: 0.01 },
  bandB: { label: "blue band", min: 0, max: 1, step: 0.01 },
};

const simplexX = new SimplexNoise(0);
const simplexY = new SimplexNoise(1);

// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth * params.renderScale;
canvas.height = window.innerHeight * params.renderScale;

let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

ctx.strokeStyle = "white";

function initImageData() {
  for (let i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] = 0;
    imageData.data[i + 1] = 0;
    imageData.data[i + 2] = 0;
    imageData.data[i + 3] = 255;
  }
}

function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r: r * 255, g: g * 255, b: b * 255 };
}

function drawCircleWave(originX, originY, r, time) {
  const startPosition = { x: originX - r, y: originY - r };
  let count = 0;
  for (let x = 0; x < r * 2; x++) {
    for (let y = 0; y < r * 2; y++) {
      count++;
      // if (count % 13 === 0) continue;
      const distance = Math.sqrt((x - r) ** 2 + (y - r) ** 2);
      if (distance > r) continue;

      const pixel = (y * canvas.width + x) * 4;

      const noiseX = simplexX.noise(x / params.noiseScale, time);
      const noiseY = simplexY.noise(y / params.noiseScale, time);

      const color = {
        r: 255 - Math.abs((distance / r - params.bandR) * params.bandWidth * 255),
        g: 255 - Math.abs((distance / r - params.bandG) * params.bandWidth * 255),
        b: 255 - Math.abs((distance / r - params.bandB) * params.bandWidth * 255),
      };

      const newPointColor = {
        r: Math.max(
          0,
          Math.min(255, color.r + (((noiseX + noiseY) * distance) / r) * params.noiseAmount)
        ),
        g: Math.max(
          0,
          Math.min(255, color.g + (((noiseY + noiseX) * distance) / r) * params.noiseAmount)
        ),
        b: Math.max(
          0,
          Math.min(255, color.b + (((noiseX + noiseY) * distance) / r) * params.noiseAmount)
        ),
      };

      imageData.data[pixel] = newPointColor.r;
      imageData.data[pixel + 1] = newPointColor.g;
      imageData.data[pixel + 2] = newPointColor.b;
    }
  }
  ctx.putImageData(imageData, startPosition.x, startPosition.y);
}

initImageData();

let time = 0;
function animate() {
  time += params.timeSpeed;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCircleWave(
    canvas.width / 2,
    canvas.height / 2,
    Math.max(10, Math.min(canvas.width, canvas.height) / 2 - params.radiusInset * params.renderScale),
    time
  );
  requestAnimationFrame(animate);
}

const resize = () => {
  canvas.width = window.innerWidth * params.renderScale;
  canvas.height = window.innerHeight * params.renderScale;
  imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "white";
  initImageData();
};

animate();
createTweaks(params, schema, () => {
  if (canvas.width !== Math.floor(window.innerWidth * params.renderScale)) resize();
});

window.addEventListener("resize", resize);
