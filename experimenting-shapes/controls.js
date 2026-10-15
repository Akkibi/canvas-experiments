const alignOptions = (axis, names) =>
  names.map((name, i) => {
    const edge = [2, 8, 14][i];
    const bars = [
      [[3, 4, 9, 3], [3, 9, 5, 3]],
      [[3, 4, 10, 3], [5, 9, 6, 3]],
      [[4, 4, 9, 3], [8, 9, 5, 3]],
    ][i];
    const rects = [[edge - 1, 1, 2, 14], ...bars];
    const oriented = axis === "x" ? rects : rects.map(([x, y, w, h]) => [y, x, h, w]);
    return { value: name, label: name, rects: oriented };
  });

const SIDE_OPTIONS = [
  {
    value: "inset",
    label: "inset",
    rects: [[2, 2, 12, 1], [2, 13, 12, 1], [2, 3, 1, 10], [13, 3, 1, 10], [3, 3, 10, 2], [3, 11, 10, 2], [3, 5, 2, 6], [11, 5, 2, 6]],
  },
  {
    value: "outset",
    label: "outset",
    rects: [[5, 5, 6, 1], [5, 10, 6, 1], [5, 6, 1, 4], [10, 6, 1, 4], [2, 2, 12, 2], [2, 12, 12, 2], [2, 4, 2, 8], [12, 4, 2, 8]],
  },
];

const ANCHORS_X = alignOptions("x", ["left", "center", "right"]);
const ANCHORS_Y = alignOptions("y", ["top", "center", "bottom"]);

const POSITION_CONTROLS = {
  anchorX: { label: "anchor x", buttons: ANCHORS_X },
  anchorY: { label: "anchor y", buttons: ANCHORS_Y },
  x: { label: "x (px)", min: -2000, max: 2000, step: 1 },
  y: { label: "y (px)", min: -2000, max: 2000, step: 1 },
};

export const SHAPE_CONTROLS = {
  Position: POSITION_CONTROLS,
  Angles: {
    centerAngle: { label: "center angle (deg)", min: -360, max: 360, step: 0.5 },
    amplitudeAngle: { label: "amplitude angle (deg)", min: 0, max: 180, step: 0.5 },
  },
  Shape: {
    radius: { label: "radius", min: 50, max: 1500, step: 1 },
    borderRadius: { label: "border radius", min: 0, max: 200, step: 1 },
    lineWidth: { label: "line width", min: 0.5, max: 20, step: 0.5 },
    color: { label: "line color" },
  },
  Fill: {
    fill: { label: "fill" },
    fillColor: { label: "color" },
  },
  Outline: {
    outline: { label: "extra stroke" },
    outlineSide: { label: "side", buttons: SIDE_OPTIONS },
    outlineWidth: { label: "width", min: 0.5, max: 100, step: 0.5 },
    outlineColor: { label: "color" },
  },
  Wobble: {
    wobbleAmount: { label: "amount (rad)", min: 0, max: 1, step: 0.005 },
    wobbleSpeed: { label: "period (frames)", min: 10, max: 600, step: 1 },
  },
  Circles: {
    circleCount: { label: "count", min: 2, max: 40, step: 1 },
    circleInset: { label: "inset", min: -20, max: 60, step: 1 },
    circleColor: { label: "color" },
    textColor: { label: "text color" },
  },
};

export const CIRCLE_CONTROLS = {
  "": {
    radius: { label: "radius", min: 0, max: 1000, step: 1 },
    color: { label: "color" },
    textColor: { label: "text color" },
  },
  Position: POSITION_CONTROLS,
};

export const STYLE_GROUPS = ["Fill", "Outline", "Wobble", "Circles"];
