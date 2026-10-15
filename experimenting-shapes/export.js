import { params, shapes, circles, texts } from "./state.js";
import { FONT, fitText, anchorOrigin, circlePoints, shapeLayout, shapePoints, circlePositions } from "./geometry.js";

const num = (n) => +n.toFixed(2);
export const parseColor = (color) => {
  const hex = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(color);
  if (hex) return { hex: `#${hex[1]}`, alpha: hex[2] ? parseInt(hex[2], 16) / 255 : 1 };
  const rgb = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/i.exec(color);
  if (!rgb) return { hex: color, alpha: 1 };
  const channel = (v) => Math.round(+v).toString(16).padStart(2, "0");
  return { hex: `#${channel(rgb[1])}${channel(rgb[2])}${channel(rgb[3])}`, alpha: rgb[4] === undefined ? 1 : +rgb[4] };
};

const paint = (attr, color) => {
  const { hex, alpha } = parseColor(color);
  return alpha < 1 ? `${attr}="${hex}" ${attr}-opacity="${num(alpha)}"` : `${attr}="${hex}"`;
};

const escapeXml = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const buildSvg = (ctx, width, height, frame) => {
  const out = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="100%" height="100%" fill="#000"/>`,
  ];

  const polygon = (points) => points.map((p, i) => `${i ? "L" : "M"}${num(p.x)} ${num(p.y)}`).join("") + "Z";

  const circle = ({ key, x, y, radius }, fill, textColor, asPolygon = false) => {
    out.push(
      asPolygon
        ? `<path d="${polygon(circlePoints(x, y, radius, params.precision))}" ${paint("fill", fill)}/>`
        : `<circle cx="${num(x)}" cy="${num(y)}" r="${num(radius)}" ${paint("fill", fill)}/>`,
    );
    const text = texts.get(key);
    if (!text || radius <= 0) return;
    const { size } = fitText(ctx, text, radius);
    out.push(
      `<text x="${num(x)}" y="${num(y)}" font-size="${num(size)}" font-family="${FONT.replace(/"/g, "'")}" ${paint("fill", textColor)} text-anchor="middle" dominant-baseline="central">${escapeXml(text)}</text>`,
    );
  };

  const layouts = shapes.map((shape) => shapeLayout(shape, width, height, frame));
  const pathData = ({ shape, x, y, first, second }) => polygon(shapePoints(shape, x, y, first, second, params.precision));

  for (const item of circles) {
    const { x, y } = anchorOrigin(item, width, height);
    circle({ key: `c${item.id}`, x, y, radius: item.radius }, item.color, item.textColor, true);
  }

  for (const layout of layouts) {
    const { shape } = layout;
    if (!shape.outline) continue;
    const id = `outline-${shape.id}`;
    const clip = shape.outlineSide === "outset" ? `M0 0H${width}V${height}H0Z${pathData(layout)}` : pathData(layout);
    out.push(`<clipPath id="${id}"><path d="${clip}" clip-rule="evenodd"/></clipPath>`);
    out.push(
      `<path d="${pathData(layout)}" fill="none" ${paint("stroke", shape.outlineColor)} stroke-width="${shape.outlineWidth * 2}" clip-path="url(#${id})"/>`,
    );
  }
  for (const layout of layouts) {
    const { shape, x, y, first, second } = layout;
    const fill = shape.fill ? paint("fill", shape.fillColor) : 'fill="none"';
    out.push(`<path d="${pathData(layout)}" ${fill} ${paint("stroke", shape.color)} stroke-width="${shape.lineWidth}"/>`);
    for (const c of circlePositions(shape, x, y, first, second)) circle(c, shape.circleColor, shape.textColor);
  }
  out.push("</svg>");
  return out.join("\n");
};

export const downloadSvg = (svg) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  link.download = "experimenting-shapes.svg";
  link.click();
  URL.revokeObjectURL(link.href);
};

export const copyParameters = () =>
  navigator.clipboard.writeText(
    JSON.stringify({ params, circles, shapes, texts: Object.fromEntries(texts) }, null, 2),
  );
