import { createTweaks } from "../shared/tweaks.js";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const mouse = { x: 0, y: 0 };

const params = {
  mode: "smear",
  width: 100,
  height: 100,
  pixelSize: 4,
  offset: 20,
  tapDistance: 1,
  showCoords: true,
};

const schema = {
  mode: { label: "mode", options: ["smear", "pixelate"] },
  width: { label: "width", min: 10, max: 600, step: 1 },
  height: { label: "height", min: 10, max: 600, step: 1 },
  pixelSize: { label: "pixel size", min: 1, max: 40, step: 1 },
  offset: { label: "brightness offset", min: -100, max: 100, step: 1 },
  tapDistance: { label: "tap distance", min: 1, max: 10, step: 1 },
  showCoords: { label: "show coords" },
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const background = new Image();
background.src = "./images/background.jpg";
background.onload = () => redraw();

const region = () => {
  const x = Math.round(mouse.x - params.width / 2);
  const y = Math.round(mouse.y - params.height / 2);
  return { x, y, w: Math.round(params.width), h: Math.round(params.height) };
};

const drawPixelate = () => {
  const { x, y, w, h } = region();
  const size = params.pixelSize;
  const img = ctx.getImageData(x, y, w, h);
  for (let px = 0; px < w; px += size) {
    for (let py = 0; py < h; py += size) {
      const i = (py * w + px) * 4;
      ctx.fillStyle = `rgb(${img.data[i]},${img.data[i + 1]},${img.data[i + 2]})`;
      ctx.fillRect(x + px, y + py, size, size);
    }
  }
};

const drawSmear = () => {
  const d = params.tapDistance;
  const pad = d * 2;
  const { x, y, w, h } = region();
  const ox = x - pad;
  const oy = y - pad;
  const bw = w + 1 + pad;
  const bh = h + 1 + pad;
  const img = ctx.getImageData(ox, oy, bw, bh);
  const data = img.data;
  const at = (px, py) => ((py - oy) * bw + (px - ox)) * 4;

  for (let px = x; px <= x + w; px++) {
    for (let py = y; py <= y + h; py++) {
      const i = at(px, py);
      const j = at(px - d, py - d);
      const k = at(px - 2 * d, py - 2 * d);
      for (let c = 0; c < 3; c++) {
        data[i + c] = (params.offset + data[i + c] + data[j + c] + data[k + c]) / 3;
      }
    }
  }
  ctx.putImageData(img, ox, oy);
};

function redraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, 0, 0);

  if (params.showCoords) {
    ctx.fillStyle = "#fff";
    ctx.font = '30px "Cal Sans", sans-serif';
    ctx.fillText(`(${mouse.x}, ${mouse.y})`, 10, 30);
  }

  if (params.mode === "pixelate") drawPixelate();
  else drawSmear();
}

createTweaks(params, schema, redraw);

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  redraw();
});

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  redraw();
});
