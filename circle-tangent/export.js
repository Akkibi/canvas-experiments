import { hullPath, linkGeometry, tangentLines } from "./geometry.js";

const f = (n) => +n.toFixed(2);

export const buildSvg = (params, circles, links, width, height) => {
  const out = [];
  const circle = (c, r, fill, opacity = 1) =>
    out.push(
      `<circle cx="${f(c.x)}" cy="${f(c.y)}" r="${f(r)}" fill="${fill}" fill-opacity="${opacity}"/>`,
    );

  out.push(`<rect width="${width}" height="${height}" fill="#000"/>`);
  for (const c of circles) circle(c, c.radius, params.circleColor, params.circleOpacity);

  const geoms = links.map(([a, b]) => linkGeometry(a, b)).filter(Boolean);

  for (const g of geoms) {
    if (params.fillLinks) {
      out.push(
        `<path d="${hullPath(g, params.linkGap)}" fill="${params.linkColor}" fill-opacity="${params.fillOpacity}"/>`,
      );
    }
    if (params.showLines) {
      for (const [x1, y1, x2, y2] of tangentLines(g, params.linkGap)) {
        out.push(
          `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${params.linkColor}" stroke-width="${params.lineWidth}"/>`,
        );
      }
    }
  }

  if (params.inner) {
    for (const c of circles) {
      if (c.radius - params.innerInset > 0) circle(c, c.radius - params.innerInset, params.innerColor);
    }
    if (params.fillLinks) {
      for (const g of geoms) {
        const d = hullPath(g, params.linkGap, params.innerInset);
        if (d) out.push(`<path d="${d}" fill="${params.innerColor}"/>`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n${out.join("\n")}\n</svg>\n`;
};

export const downloadSvg = (svg) => {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "circle-tangent.svg" });
  a.click();
  URL.revokeObjectURL(url);
};
