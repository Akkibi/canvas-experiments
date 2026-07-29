import { SimplexNoise } from "./simplexNoise.js";

const simplexX = new SimplexNoise(0);
const simplexY = new SimplexNoise(1);

// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth / 1;
canvas.height = window.innerHeight / 1;

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

      const noiseX = simplexX.noise(x / 400, time);
      const noiseY = simplexY.noise(y / 400, time);

      const color = {
        r: 255 - Math.abs((distance / r - 0.56) * 10 * 255),
        g: 255 - Math.abs((distance / r - 0.6) * 10 * 255),
        b: 255 - Math.abs((distance / r - 0.64) * 10 * 255),
      };

      const newPointColor = {
        r: Math.max(
          0,
          Math.min(255, color.r + (((noiseX + noiseY) * distance) / r) * 20)
        ),
        g: Math.max(
          0,
          Math.min(255, color.g + (((noiseY + noiseX) * distance) / r) * 20)
        ),
        b: Math.max(
          0,
          Math.min(255, color.b + (((noiseX + noiseY) * distance) / r) * 20)
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
  time += 0.1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCircleWave(
    canvas.width / 2,
    canvas.height / 2,
    canvas.height / 2 - 100,
    time
  );
  requestAnimationFrame(animate);
}

animate();
