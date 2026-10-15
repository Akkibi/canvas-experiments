export const FONT = '"Cal Sans", sans-serif';

export const toRad = (deg) => (deg * Math.PI) / 180;

export const polar = (x, y, radius, angle) => ({
  x: x + radius * Math.cos(angle),
  y: y + radius * Math.sin(angle),
});

const arcPoints = (x, y, radius, startAngle, endAngle, step, clockwise) => {
  const points = [];
  if (clockwise) {
    for (let a = startAngle; a < endAngle; a += step) points.push(polar(x, y, radius, a));
  } else {
    for (let a = endAngle; a > startAngle; a -= step) points.push(polar(x, y, radius, a));
  }
  return points;
};

const ANCHOR = { left: 0, top: 0, center: 0.5, right: 1, bottom: 1 };

export const anchorOrigin = (item, width, height) => ({
  x: width * ANCHOR[item.anchorX] + item.x,
  y: height * ANCHOR[item.anchorY] + item.y,
});

export const circlePoints = (x, y, radius, precision) => {
  const step = Math.min(precision, Math.PI / 2);
  const points = [];
  for (let a = 0; a < Math.PI * 2; a += step) points.push(polar(x, y, radius, a));
  return points;
};

export const shapeAngles = (shape, frame) => {
  const wobble = Math.sin(frame / shape.wobbleSpeed) * shape.wobbleAmount;
  const center = toRad(shape.centerAngle);
  const amplitude = toRad(shape.amplitudeAngle);
  return { first: center - amplitude + wobble, second: center + amplitude - wobble };
};

export const shapeLayout = (shape, width, height, frame) => ({
  shape,
  ...anchorOrigin(shape, width, height),
  ...shapeAngles(shape, frame),
});

export const shapePoints = (shape, x, y, first, second, precision) => {
  const { radius, borderRadius } = shape;
  const start = polar(x, y, radius, first);
  const end = polar(x, y, radius, second);
  return [
    ...arcPoints(x, y, radius + borderRadius, first, second, precision / 4, false),
    ...arcPoints(start.x, start.y, borderRadius, Math.PI + first, Math.PI * 2 + first, precision, false),
    ...arcPoints(x, y, radius - borderRadius, first, second, precision / 4, true),
    ...arcPoints(end.x, end.y, borderRadius, second, Math.PI + second, precision, false),
  ];
};

export const circlePositions = (shape, x, y, first, second) => {
  const { circleCount, radius, borderRadius, circleInset } = shape;
  const angleDiff = (second - first) / (circleCount - 1);
  const circleRadius = Math.max(borderRadius - circleInset, 0);
  return Array.from({ length: circleCount }, (_, i) => ({
    key: `${shape.id}:${i}`,
    ...polar(x, y, radius, first + angleDiff * i),
    radius: circleRadius,
  }));
};

export const fitText = (ctx, text, radius) => {
  let size = radius * 0.9;
  ctx.font = `${size}px ${FONT}`;
  let width = ctx.measureText(text).width;
  const maxWidth = radius * 1.7;
  if (width > maxWidth) {
    size *= maxWidth / width;
    width = maxWidth;
    ctx.font = `${size}px ${FONT}`;
  }
  return { size, width };
};
