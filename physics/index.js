// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// main variables
const density = 40;
const rows = 10;
const columns = 10;

const startPosition = { x: 100, y: 100 };

ctx.strokeStyle = "white";

// create matrix of points
const points = [];

// fill the matrix with points
const createPoints = (density, rows, columns) => {
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < columns; j++) {
      row.push({
        x: i * density + startPosition.x,
        y: j * density + startPosition.y,
        vx: 0,
        vy: 0,
      });
    }
    points.push(row);
  }
};

createPoints(density, rows, columns);

// draw the points
const drawPoints = () => {
  points.forEach((row) => {
    row.forEach((point) => {
      ctx.beginPath();
      ctx.rect(point.x - 5, point.y - 5, 10, 10);
      ctx.fillStyle = "white";
      ctx.fill();
    });
  });
};

// update the points
const updatePoints = () => {
  points.forEach((row, colIndex) => {
    row.forEach((point, rowIndex) => {
      point.x += point.vx;
      point.y += point.vy;

      // define surouding points
      const nextPoint = points[colIndex + 1] && points[colIndex + 1][rowIndex];
      const prevPoint = points[colIndex - 1] && points[colIndex - 1][rowIndex];
      const topPoint = points[colIndex] && points[colIndex][rowIndex - 1];
      const bottomPoint = points[colIndex] && points[colIndex][rowIndex + 1];
      const suroudingPoints = [nextPoint, prevPoint, topPoint, bottomPoint];

      suroudingPoints.forEach((suroudingPoint) => {
        if (suroudingPoint) {
          const dx = suroudingPoint.x - point.x;
          const dy = suroudingPoint.y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const force = 0.01;

          // calculate acceleration
          const ax = (dx / distance) * force;
          const ay = (dy / distance) * force;

          if (distance < density) {
            point.vx -= ax;
            point.vy -= ay;
          } else {
            point.vx += ax;
            point.vy += ay;
          }
        }
      });

      point.vy += 0.1;
      point.y = Math.min(point.y, canvas.height);
    });
  });
};

// animate
const animate = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPoints();
  updatePoints();
  requestAnimationFrame(animate);
};

animate();
