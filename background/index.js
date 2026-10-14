import { OrthographicCamera, Scene, WebGPURenderer } from "three/webgpu";
import { createDarkVeil } from "./darkveil.js";

const RESOLUTION_SCALE = 0.5;

const canvas = document.getElementById("bg");
const renderer = new WebGPURenderer({ canvas, antialias: false });
await renderer.init();

const veil = createDarkVeil({
  hueShift: 0,
  speed: 0.4,
  warpAmount: 0.3,
  noiseIntensity: 0.015,
});

const scene = new Scene();
scene.add(veil.mesh);
const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

const resize = () => {
  const w = Math.max(1, Math.floor(window.innerWidth * RESOLUTION_SCALE));
  const h = Math.max(1, Math.floor(window.innerHeight * RESOLUTION_SCALE));
  renderer.setPixelRatio(1);
  renderer.setSize(w, h, false);
  veil.setSize(w, h);
};
resize();
window.addEventListener("resize", resize);

renderer.setAnimationLoop(() => {
  veil.update();
  renderer.render(scene, camera);
});
