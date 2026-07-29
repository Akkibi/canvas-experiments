export function laplacianSmoothing(coords, iterations = 1) {
  if (!Array.isArray(coords) || coords.length < 3) {
    throw new Error("Input must be an array of at least 3 coordinates.");
  }

  const smoothed = coords.map((coord) => ({ ...coord })); // Clone the original array

  for (let iter = 0; iter < iterations; iter++) {
    const tempCoords = smoothed.map((coord) => ({ ...coord })); // Create a temporary copy

    for (let i = 1; i < smoothed.length - 1; i++) {
      tempCoords[i].x =
        (smoothed[i - 1].x + smoothed[i].x + smoothed[i + 1].x) / 3;
      tempCoords[i].y =
        (smoothed[i - 1].y + smoothed[i].y + smoothed[i + 1].y) / 3;
    }

    smoothed.forEach((coord, index) => {
      if (index !== 0 && index !== smoothed.length - 1) {
        coord.x = tempCoords[index].x;
        coord.y = tempCoords[index].y;
      }
    });
  }

  return smoothed;
}

// Example usage
// const coordinates = [
//   { x: 0, y: 0 },
//   { x: 1, y: 1 },
//   { x: 2, y: 3 },
//   { x: 3, y: 5 },
//   { x: 4, y: 6 },
// ];

// const smoothedCoords = laplacianSmoothing(coordinates, 2);
// console.log(smoothedCoords);
