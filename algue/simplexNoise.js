// export class SimplexNoise {
//   constructor(seed = 0) {
//     this.gradients = [
//       [1, 1, 0],
//       [-1, 1, 0],
//       [1, -1, 0],
//       [-1, -1, 0],
//       [1, 0, 1],
//       [-1, 0, 1],
//       [1, 0, -1],
//       [-1, 0, -1],
//       [0, 1, 1],
//       [0, -1, 1],
//       [0, 1, -1],
//       [0, -1, -1],
//     ]; // Gradient directions for 3D

//     this.permutationTable = this.buildPermutationTable(seed);
//   }

//   buildPermutationTable(seed) {
//     const tableSize = 256;
//     const table = Array.from({ length: tableSize }, (_, i) => i);
//     const random = this.seededRandom(seed);

//     for (let i = table.length - 1; i > 0; i--) {
//       const j = Math.floor(random() * (i + 1));
//       [table[i], table[j]] = [table[j], table[i]];
//     }

//     return table.concat(table); // Double the table for wrap-around
//   }

//   seededRandom(seed) {
//     let value = seed & 0x7fffffff;
//     return () => {
//       value = (value * 48271) % 0x7fffffff;
//       return (value & 0x7fffffff) / 0x7fffffff;
//     };
//   }

//   dotGradient(hash, x, y, z) {
//     const gradient = this.gradients[hash % this.gradients.length];
//     return gradient[0] * x + gradient[1] * y + gradient[2] * z;
//   }

//   fade(t) {
//     return t * t * t * (t * (t * 6 - 15) + 10);
//   }

//   noise(x, y, z) {
//     const p = this.permutationTable;

//     const s = (x + y + z) / 3; // Skew factor for 3D
//     const i = Math.floor(x + s);
//     const j = Math.floor(y + s);
//     const k = Math.floor(z + s);

//     const t = (i + j + k) * (1 / 6); // Unskew factor for 3D
//     const X0 = i - t;
//     const Y0 = j - t;
//     const Z0 = k - t;

//     const x0 = x - X0;
//     const y0 = y - Y0;
//     const z0 = z - Z0;

//     let i1, j1, k1; // Offsets for second corner of simplex
//     let i2, j2, k2; // Offsets for third corner of simplex

//     if (x0 >= y0) {
//       if (y0 >= z0) {
//         i1 = 1;
//         j1 = 0;
//         k1 = 0;
//         i2 = 1;
//         j2 = 1;
//         k2 = 0;
//       } else if (x0 >= z0) {
//         i1 = 1;
//         j1 = 0;
//         k1 = 0;
//         i2 = 1;
//         j2 = 0;
//         k2 = 1;
//       } else {
//         i1 = 0;
//         j1 = 0;
//         k1 = 1;
//         i2 = 1;
//         j2 = 0;
//         k2 = 1;
//       }
//     } else {
//       if (y0 < z0) {
//         i1 = 0;
//         j1 = 0;
//         k1 = 1;
//         i2 = 0;
//         j2 = 1;
//         k2 = 1;
//       } else if (x0 < z0) {
//         i1 = 0;
//         j1 = 1;
//         k1 = 0;
//         i2 = 0;
//         j2 = 1;
//         k2 = 1;
//       } else {
//         i1 = 0;
//         j1 = 1;
//         k1 = 0;
//         i2 = 1;
//         j2 = 1;
//         k2 = 0;
//       }
//     }

//     const x1 = x0 - i1 + 1 / 6;
//     const y1 = y0 - j1 + 1 / 6;
//     const z1 = z0 - k1 + 1 / 6;
//     const x2 = x0 - i2 + 2 / 6;
//     const y2 = y0 - j2 + 2 / 6;
//     const z2 = z0 - k2 + 2 / 6;
//     const x3 = x0 - 1 + 3 / 6;
//     const y3 = y0 - 1 + 3 / 6;
//     const z3 = z0 - 1 + 3 / 6;

//     const ii = i & 255;
//     const jj = j & 255;
//     const kk = k & 255;

//     const g0 = p[ii + p[jj + p[kk]]];
//     const g1 = p[ii + i1 + p[jj + j1 + p[kk + k1]]];
//     const g2 = p[ii + i2 + p[jj + j2 + p[kk + k2]]];
//     const g3 = p[ii + 1 + p[jj + 1 + p[kk + 1]]];

//     const n0 = Math.max(0, 0.5 - x0 * x0 - y0 * y0 - z0 * z0);
//     const n1 = Math.max(0, 0.5 - x1 * x1 - y1 * y1 - z1 * z1);
//     const n2 = Math.max(0, 0.5 - x2 * x2 - y2 * y2 - z2 * z2);
//     const n3 = Math.max(0, 0.5 - x3 * x3 - y3 * y3 - z3 * z3);

//     const contribution0 = n0 * n0 * this.dotGradient(g0, x0, y0, z0);
//     const contribution1 = n1 * n1 * this.dotGradient(g1, x1, y1, z1);
//     const contribution2 = n2 * n2 * this.dotGradient(g2, x2, y2, z2);
//     const contribution3 = n3 * n3 * this.dotGradient(g3, x3, y3, z3);

//     return 32 * (contribution0 + contribution1 + contribution2 + contribution3);
//   }
// }

// // // Example usage:
// // const simplex = new SimplexNoise(12345);
// // console.log(simplex.noise(0.1, 0.2, 0.3));

export class SimplexNoise {
  constructor(seed = 0) {
    this.gradients = [
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ]; // Gradient directions for 2D

    this.permutationTable = this.buildPermutationTable(seed);
  }

  buildPermutationTable(seed) {
    const tableSize = 256;
    const table = Array.from({ length: tableSize }, (_, i) => i);
    const random = this.seededRandom(seed);

    for (let i = table.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [table[i], table[j]] = [table[j], table[i]];
    }

    return table.concat(table); // Double the table for wrap-around
  }

  seededRandom(seed) {
    let value = seed & 0x7fffffff;
    return () => {
      value = (value * 48271) % 0x7fffffff;
      return (value & 0x7fffffff) / 0x7fffffff;
    };
  }

  dotGradient(hash, x, y) {
    const gradient = this.gradients[hash % this.gradients.length];
    return gradient[0] * x + gradient[1] * y;
  }

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  noise(x, y) {
    const p = this.permutationTable;

    const s = ((x + y) * (Math.sqrt(3) - 1)) / 2; // Skew factor for 2D
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);

    const t = ((i + j) * (3 - Math.sqrt(3))) / 6; // Unskew factor for 2D
    const X0 = i - t;
    const Y0 = j - t;

    const x0 = x - X0;
    const y0 = y - Y0;

    let i1, j1; // Offsets for second corner of simplex
    if (x0 > y0) {
      i1 = 1;
      j1 = 0; // Lower triangle
    } else {
      i1 = 0;
      j1 = 1; // Upper triangle
    }

    const x1 = x0 - i1 + (3 - Math.sqrt(3)) / 6;
    const y1 = y0 - j1 + (3 - Math.sqrt(3)) / 6;
    const x2 = x0 - 1 + (3 - Math.sqrt(3)) / 3;
    const y2 = y0 - 1 + (3 - Math.sqrt(3)) / 3;

    const ii = i & 255;
    const jj = j & 255;

    const g0 = p[ii + p[jj]];
    const g1 = p[ii + i1 + p[jj + j1]];
    const g2 = p[ii + 1 + p[jj + 1]];

    const n0 = Math.max(0, 0.5 - x0 * x0 - y0 * y0);
    const n1 = Math.max(0, 0.5 - x1 * x1 - y1 * y1);
    const n2 = Math.max(0, 0.5 - x2 * x2 - y2 * y2);

    const contribution0 = n0 * n0 * this.dotGradient(g0, x0, y0);
    const contribution1 = n1 * n1 * this.dotGradient(g1, x1, y1);
    const contribution2 = n2 * n2 * this.dotGradient(g2, x2, y2);

    return 70 * (contribution0 + contribution1 + contribution2);
  }
}

// // Example usage:
// const simplex = new SimplexNoise(12345);
// console.log(simplex.noise(0.1, 0.2));
