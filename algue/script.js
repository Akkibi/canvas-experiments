import { drawShape, drawCircle, drawCircles, getLength } from "./utils.js";
import { SimplexNoise } from "./simplexNoise.js";
import { laplacianSmoothing } from "./laplacian.js";

// laplacian smoothing
// const coordinates = [
//   { x: 0, y: 0 },
//   { x: 1, y: 1 },
//   { x: 2, y: 3 },
//   { x: 3, y: 5 },
//   { x: 4, y: 6 },
// ];
// const smoothedCoords = laplacianSmoothing(coordinates, 2);
// console.log(smoothedCoords);

// simplex noise
const simplex = new SimplexNoise(12345);
console.log(simplex.noise(0.1, 0.2));

// Get the canvas element
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const mode = "prod";

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
console.log(isMobile ? "You are on Mobile" : "You are on Desktop");

// Draw a circle
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

// Loop
let paused = false;
let lastFrameTime = 0;
const fpsInterval = 1000 / 48;
let framecount = 0;

// dragging
let dragging = false;
const pointsData = [];
const noiseAmount = 4;
const thickness = isMobile ? 2.5 : 5;

const updateReverse = () => {
  pointsData.forEach((data, index) => {
    if (data.reverse) {
      if (data.list.length > 0) {
        // console.log(pointsData[index].list);
        pointsData[index].list.splice(-1);
      } else {
        pointsData[index].reverse = false;
      }
    }
  });
};

const drawDrag = (time) => {
  let length;
  let lastPointWithOffset = { x: centerX, y: canvas.height };
  pointsData.forEach((item, count) => {
    const list = item.list;
    let lastPoint = { x: centerX, y: canvas.height };
    let smoothedList = [];
    if (list.length > 3) {
      smoothedList = laplacianSmoothing(list, 2);
    } else {
      smoothedList = list;
    }
    // first line
    length = list.length;
    ctx.beginPath();
    if (mode === "dev") {
      ctx.strokeStyle = "green";
      ctx.lineWidth = 2;
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(0, 128, 0, 0.75)");
      gradient.addColorStop(
        1,
        `hsl(${(count * 10 + 100) % 360}deg, 50%, ${
          ((count + 1) / (pointsData.length + 1)) * 50
        }%`
      );
      ctx.fillStyle = gradient;
    }
    ctx.moveTo(centerX, canvas.height);

    // repeat two times
    for (let i = 0; i < 2; i++) {
      let pointCount = 0;
      if (i === 1) {
        pointCount = smoothedList.length;
        smoothedList.reverse();
      }
      const offset = time + count * 1000;
      smoothedList.forEach((point, index) => {
        i === 1 ? pointCount-- : pointCount++;
        if (index !== 0) {
          const x =
            point.x +
            (simplex.noise(point.x / 800, offset) * pointCount) / noiseAmount;
          const y =
            point.y +
            (simplex.noise(point.y / 800, offset) * pointCount) / noiseAmount;
          const pointAngle = Math.atan2(y - lastPoint.y, x - lastPoint.x);
          const NewPoint = {
            x:
              x +
              Math.cos(pointAngle - Math.PI / 2) *
                Math.log(length - index) *
                thickness,
            thickness,
            y:
              y +
              Math.sin(pointAngle - Math.PI / 2) *
                Math.log(length - index) *
                thickness,
            thickness,
          };
          ctx.lineTo(NewPoint.x, NewPoint.y);

          lastPoint = {
            x: x,
            y: y,
          };
          lastPointWithOffset = NewPoint;
        }
      });
    }
    ctx.closePath();
    if (mode === "dev") {
      ctx.stroke();
      // red line
      ctx.beginPath();
      ctx.moveTo(centerX, canvas.height);
      ctx.strokeStyle = "red";
      ctx.lineWidth = 1;
      list.forEach((point, index) => {
        if (index !== 0) {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();
    } else {
      ctx.fill();
    }
  });
};

// Event listeners

const clickHandler = (x, y) => {
  console.log(getLength(centerX, canvas.height, x, y));
  if (getLength(centerX, canvas.height, x, y) > 150) {
    pointsData.forEach((data, index) => {
      if (data.list.length > 2) {
        const offset = framecount * 0.005 + index * 1000;
        console.log(data.list.slice(-1));
        const pointx = data.list.slice(-1)[0].x;
        const pointy = data.list.slice(-1)[0].y;
        const noisex =
          pointx +
          (simplex.noise(pointx / 800, offset) * data.list.length) /
            noiseAmount;
        const noisey =
          pointy +
          (simplex.noise(pointy / 800, offset) * data.list.length) /
            noiseAmount;
        // debug circle
        if (mode === "dev") {
          ctx.beginPath();
          ctx.arc(noisex, noisey, 50, 0, 2 * Math.PI);
          ctx.strokeStyle = "red";
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(pointx, pointy, 25, 0, 2 * Math.PI);
          ctx.strokeStyle = "white";
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, 2 * Math.PI);
          ctx.strokeStyle = "blue";
        }

        console.log(getLength(noisex, noisey, x, y) < 50);
        if (data.list.length > 1 && getLength(noisex, noisey, x, y) < 50) {
          console.log("reverse");
          data.reverse = true;
        }
      }
    });
    return;
  }
  dragging = true;
  // new point array
  pointsData.push({
    list: [
      {
        x: x,
        y: y,
      },
    ],
    reverse: false,
  });
};

const endClickHandler = () => {
  dragging = false;
};

const dragHandler = (x, y) => {
  if (!dragging) return;
  let totalLength = 0;
  let lastPoint = { x: centerX, y: canvas.height };
  const lastArray = pointsData[pointsData.length - 1];
  lastArray.list.forEach((point, index) => {
    if (index !== 0) {
      totalLength += getLength(point.x, point.y, lastPoint.x, lastPoint.y);
      lastPoint = point;
    }
  });
  if (totalLength > 1000) {
    dragging = false;
  } else {
    lastArray.list.push({
      x: x,
      y: y,
    });
  }
};

window.addEventListener("mouseup", endClickHandler);
window.addEventListener("mousedown", (e) => {
  clickHandler(e.clientX, e.clientY);
});
window.addEventListener("mousemove", (e) => {
  dragHandler(e.clientX, e.clientY);
});
window.addEventListener("touchstart", (e) => {
  clickHandler(e.touches[0].clientX, e.touches[0].clientY);
});
window.addEventListener("touchend", endClickHandler);
window.addEventListener("touchmove", (e) => {
  dragHandler(e.touches[0].clientX, e.touches[0].clientY);
});

function animate(timestamp) {
  if (!timestamp) {
    requestAnimationFrame(animate);
  }
  const deltaTime = timestamp - lastFrameTime;
  if (deltaTime > fpsInterval) {
    lastFrameTime = timestamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ctx.beginPath();
    // ctx.rect(0, 0, canvas.width, canvas.height);
    // ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    // ctx.fill();
    // update time stuffs
    framecount++;

    drawDrag(framecount * 0.005);
    updateReverse();
    drawCircle(
      centerX,
      canvas.height,
      isMobile ? 100 : 150,
      "#005500",
      -1,
      framecount * 0.005
    );
  }
  if (!paused) {
    requestAnimationFrame(animate);
  }
}

animate();
