// Get the canvas element and its context
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// Set canvas dimensions
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// reject, bounce, wrap

const borderTypes = ["reject", "bounce", "wrap"];
let borders = 0;

const shapeTypes = ["circle", "triangle"];
let shapes = 0;

const buttonBorders = document.getElementById("buttonBorders");
buttonBorders.textContent = borderTypes[borders];

const changeBorders = () => {
  borders = (borders + 1) % borderTypes.length;
  buttonBorders.textContent = borderTypes[borders];
};

buttonBorders.addEventListener("click", changeBorders);

console.log(canvas.width);
// Function to draw a circle
function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}
// Function to draw a triangle
function drawTriangle(x, y, size, color, speedX, speedY) {
  const height = size * (Math.sqrt(3) / 2);
  const angle = Math.atan2(speedY, speedX);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(0, -height);
  ctx.lineTo(-size / 2, height / 2);
  ctx.lineTo(size / 2, height / 2);
  ctx.fillStyle = color;
  ctx.closePath();
  ctx.fill();
  ctx.rect(-2, 5, 4, 10);
  ctx.fill();

  ctx.restore();

  // ctx.save();
  // ctx.translate(x, y);
  // ctx.beginPath();
  // ctx.arc(0, 0, size, 0, Math.PI * 2, false);
  // ctx.arc(0, 0, size, 0, Math.PI * 2, false);
  // ctx.fillStyle = color;
  // ctx.fill();
  // ctx.restore();
}

// Draw a triangle in the center of the canvas
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const triangleSize = 20;
drawTriangle(centerX, centerY, triangleSize, "white");

// Create an array to store triangles
const triangles = [];

// Function to create a triangle with position and speed
function createTriangle(x, y, size, color, speedX, speedY) {
  return { x, y, size, color, speedX, speedY };
}

// Populate the array with triangles
for (let i = 0; i < 100; i++) {
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  const size = 20;
  const color = "hsl(" + Math.random() * 360 + ", 100%, 70%)";
  const speedX = (Math.random() - 0.5) * 2;
  const speedY = (Math.random() - 0.5) * 2;
  triangles.push(createTriangle(x, y, size, color, speedX, speedY));
}

// triangles.push(createTriangle(centerX, centerY, 20, "red", 10, 10));
// triangles.push(createTriangle(centerX, centerY, 20, "#5555FF", -10, 10));
// triangles.push(createTriangle(centerX, centerY, 20, "green", 10, -10));

// Function to update the position of triangles
function updateTriangles() {
  triangles.forEach((triangle) => {
    // Boids rules
    let alignment = { x: 0, y: 0 };
    let cohesion = { x: 0, y: 0 };
    let separation = { x: 0, y: 0 };
    let total = 0;

    triangles.forEach((other) => {
      if (other !== triangle) {
        const distance = Math.hypot(triangle.x - other.x, triangle.y - other.y);

        // Alignment: steer towards the average heading of local flockmates
        if (distance < 100 && distance > 50) {
          alignment.x += other.speedX * 0.01;
          alignment.y += other.speedY * 0.01;

          // Cohesion: steer to move toward the average position of local flockmates
          cohesion.x += other.x;
          cohesion.y += other.y;

          // Separation: steer to avoid crowding local flockmates
          if (distance < 200) {
            separation.x += triangle.x - other.x;
            separation.y += triangle.y - other.y;
          }

          total++;
        } else {
          if (distance < 50) {
            separation.x += triangle.x - other.x;
            separation.y += triangle.y - other.y;
          }
        }
      }
    });

    if (total > 0) {
      // Alignment
      alignment.x /= total;
      alignment.y /= total;
      const alignmentMag = Math.hypot(alignment.x, alignment.y);
      if (alignmentMag > 0) {
        alignment.x = (alignment.x / alignmentMag) * 0.05;
        alignment.y = (alignment.y / alignmentMag) * 0.05;
      }

      // Cohesion
      cohesion.x /= total;
      cohesion.y /= total;
      cohesion.x = (cohesion.x - triangle.x) * 0.0001;
      cohesion.y = (cohesion.y - triangle.y) * 0.0001;

      // Separation
      separation.x /= total;
      separation.y /= total;
      const separationMag = Math.hypot(separation.x, separation.y);
      if (separationMag > 0) {
        separation.x = (separation.x / separationMag) * 0.05;
        separation.y = (separation.y / separationMag) * 0.05;
      }

      // Apply the boids rules to the triangle's speed
      triangle.speedX += alignment.x + cohesion.x + separation.x;
      triangle.speedY += alignment.y + cohesion.y + separation.y;
    }

    triangle.speedX = Math.min(Math.max(triangle.speedX, -2), 2);
    triangle.speedY = Math.min(Math.max(triangle.speedY, -2), 2);
    // Update the position of the triangle
    triangle.x += triangle.speedX;
    triangle.y += triangle.speedY;

    // Check for collision with canvas edges and reverse speed if necessary
    switch (borderTypes[borders]) {
      case "reject":
        if (triangle.x < 100) triangle.speedX += 0.1;
        if (triangle.x > canvas.width - 100) triangle.speedX -= 0.1;
        if (triangle.y < 100) triangle.speedY += 0.1;
        if (triangle.y > canvas.height - 100) triangle.speedY -= 0.1;
        break;
      case "bounce":
        if (triangle.x < 0 || triangle.x > canvas.width) triangle.speedX *= -1;
        if (triangle.y < 0 || triangle.y > canvas.height) triangle.speedY *= -1;
        break;
      case "wrap":
        if (triangle.x < 0) triangle.x = canvas.width;
        if (triangle.x > canvas.width) triangle.x = 0;
        if (triangle.y < 0) triangle.y = canvas.height;
        if (triangle.y > canvas.height) triangle.y = 0;
        break;
    }
    // if (triangle.x < 0 || triangle.x > canvas.width) triangle.speedX *= -1;
    // if (triangle.y < 0 || triangle.y > canvas.height) triangle.speedY *= -1;
    // if (triangle.x < 0) triangle.x = canvas.width;
    // if (triangle.x > canvas.width) triangle.x = 0;
    // if (triangle.y < 0) triangle.y = canvas.height;
    // if (triangle.y > canvas.height) triangle.y = 0;
    // if (triangle.x < 100) triangle.speedX += 0.1;
    // if (triangle.x > canvas.width - 100) triangle.speedX -= 0.1;
    // if (triangle.y < 100) triangle.speedY += 0.1;
    // if (triangle.y > canvas.height - 100) triangle.speedY -= 0.1;
  });
}

// Update the animate function to draw all triangles
function animate() {
  console.log("animate");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw each triangle
  updateTriangles();
  triangles.forEach((triangle, index) => {
    drawTriangle(
      triangle.x,
      triangle.y,
      triangle.size,
      triangle.color,
      triangle.speedX,
      triangle.speedY
    );
  });
  // triangles.forEach((triangle) => {
  //   drawTriangle(
  //     triangle.x,
  //     triangle.y,
  //     triangle.size - 5,
  //     "black",
  //     triangle.speedX,
  //     triangle.speedY
  //   );
  // });

  requestAnimationFrame(animate);
}

animate();
