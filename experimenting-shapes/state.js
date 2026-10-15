import { INITIAL_PARAMS, INITIAL_CIRCLES, INITIAL_SHAPES } from "./defaults.js";
import { SHAPE_CONTROLS, CIRCLE_CONTROLS, STYLE_GROUPS } from "./controls.js";

export const params = { ...INITIAL_PARAMS };

let nextShapeId = 1;
let nextCircleId = 1;
export const shapes = INITIAL_SHAPES.map((shape) => ({ ...shape, id: nextShapeId++ }));
export const circles = INITIAL_CIRCLES.map((circle) => ({ ...circle, id: nextCircleId++ }));
export const texts = new Map();

let onItemsChange = () => {};
export const setItemsListener = (fn) => {
  onItemsChange = fn;
};

const addShape = () => {
  const last = shapes[shapes.length - 1] ?? INITIAL_SHAPES[0];
  shapes.push({ ...last, id: nextShapeId++, radius: Math.max(50, Math.round(last.radius * 0.8)) });
  onItemsChange();
};

const removeShape = (shape) => {
  shapes.splice(shapes.indexOf(shape), 1);
  for (const key of [...texts.keys()]) {
    if (key.startsWith(`${shape.id}:`)) texts.delete(key);
  }
  onItemsChange();
};

const addCircle = () => {
  const last = circles[circles.length - 1] ?? INITIAL_CIRCLES[0];
  circles.push({ ...last, id: nextCircleId++, radius: Math.max(10, Math.round(last.radius * 0.6)) });
  onItemsChange();
};

const removeCircle = (circle) => {
  circles.splice(circles.indexOf(circle), 1);
  texts.delete(`c${circle.id}`);
  onItemsChange();
};

const STYLE_KEYS = STYLE_GROUPS.flatMap((group) => Object.keys(SHAPE_CONTROLS[group]));
const styleState = { source: shapes[0].id, target: 0 };
let styleClipboard = null;

const copyStyle = () => {
  const source = shapes.find((shape) => shape.id === styleState.source);
  if (source) styleClipboard = Object.fromEntries(STYLE_KEYS.map((key) => [key, source[key]]));
};

const pasteStyle = () => {
  if (!styleClipboard) {
    alert("Copy a shape style first.");
    return;
  }
  const targets = styleState.target
    ? shapes.filter((shape) => shape.id === styleState.target)
    : shapes.filter((shape) => shape.id !== styleState.source);
  targets.forEach((shape) => Object.assign(shape, styleClipboard));
  onItemsChange();
};

const importState = { json: "" };

const toHex8 = (value, fallback) =>
  typeof fallback === "string" && /^#[0-9a-f]{8}$/i.test(fallback) && /^#[0-9a-f]{6}$/i.test(value)
    ? `${value}ff`
    : value;

const pickKnown = (raw, base) => {
  const picked = { ...base };
  for (const key of Object.keys(base)) {
    if (typeof raw?.[key] === typeof base[key]) picked[key] = toHex8(raw[key], base[key]);
  }
  return picked;
};

const legacyCircle = (p) =>
  p && ("centerRadius" in p || "centerColor" in p || "centerTextColor" in p)
    ? { radius: p.centerRadius, color: p.centerColor, textColor: p.centerTextColor }
    : null;

const applyParameters = () => {
  let data;
  try {
    data = JSON.parse(importState.json);
  } catch (error) {
    alert(`Invalid JSON: ${error.message}`);
    return;
  }
  Object.assign(params, pickKnown(data.params, params));

  const rawCircles = Array.isArray(data.circles) ? data.circles : [legacyCircle(data.params)].filter(Boolean);
  const rawShapes = Array.isArray(data.shapes) ? data.shapes : null;
  const keyMap = new Map();

  if (rawCircles.length) {
    const imported = rawCircles.map((raw, i) => {
      const circle = { ...pickKnown(raw, INITIAL_CIRCLES[0]), id: nextCircleId++ };
      keyMap.set(`c${raw.id ?? i + 1}`, `c${circle.id}`);
      if (i === 0) keyMap.set("center", `c${circle.id}`);
      return circle;
    });
    circles.splice(0, circles.length, ...imported);
  }
  if (rawShapes) {
    const imported = rawShapes.map((raw, i) => {
      const shape = { ...pickKnown(raw, INITIAL_SHAPES[0]), id: nextShapeId++ };
      keyMap.set(`s${raw.id ?? i + 1}`, `s${shape.id}`);
      return shape;
    });
    shapes.splice(0, shapes.length, ...imported);
  }

  const isCircleKey = (key) => key === "center" || key.startsWith("c");
  const kept = [...texts].filter(([key]) => (isCircleKey(key) ? !rawCircles.length : !rawShapes));
  texts.clear();
  kept.forEach(([key, text]) => texts.set(key, text));
  for (const [key, text] of Object.entries(data.texts ?? {})) {
    const [owner, index] = key.split(":");
    const mapped = keyMap.get(isCircleKey(key) ? key : `s${owner}`);
    if (mapped) texts.set(isCircleKey(key) ? mapped : `${mapped.slice(1)}:${index}`, text);
  }
  onItemsChange();
};

const itemControls = (schema, item, id, root, controls) => {
  for (const [group, entries] of Object.entries(controls)) {
    for (const [prop, def] of Object.entries(entries)) {
      schema[`${id}_${prop}`] = { ...def, prop, target: item, folder: group ? `${root}/${group}` : root };
    }
  }
};

const styleOptions = (withAll) => {
  const options = Object.fromEntries(shapes.map((shape, i) => [`Shape ${i + 1}`, shape.id]));
  return withAll ? { "all others": 0, ...options } : options;
};

export const buildSchema = ({ copyParameters, exportSvg }) => {
  if (!shapes.some((shape) => shape.id === styleState.source)) styleState.source = shapes[0]?.id ?? 0;
  if (styleState.target && !shapes.some((shape) => shape.id === styleState.target)) styleState.target = 0;

  const schema = {
    paused: { folder: "Playback", label: "paused" },
    fps: { folder: "Playback", label: "fps", min: 1, max: 120, step: 1 },
    precision: { folder: "Playback", label: "precision (rad)", min: 0.005, max: 1, step: 0.005 },
  };
  circles.forEach((circle, i) => {
    const root = `Circle ${i + 1}`;
    schema[`c${circle.id}_remove`] = { label: `remove circle ${i + 1}`, action: () => removeCircle(circle), folder: root };
    itemControls(schema, circle, `c${circle.id}`, root, CIRCLE_CONTROLS);
  });
  schema.addCircle = { label: "+ add circle", action: addCircle };
  shapes.forEach((shape, i) => {
    const root = `Shape ${i + 1}`;
    schema[`s${shape.id}_remove`] = { label: `remove shape ${i + 1}`, action: () => removeShape(shape), folder: root };
    itemControls(schema, shape, `s${shape.id}`, root, SHAPE_CONTROLS);
  });
  schema.addShape = { label: "+ add shape", action: addShape };
  schema.importJson = { folder: "Import", label: "parameters", rows: 6, target: importState, prop: "json" };
  schema.applyImport = { folder: "Import", label: "apply", action: applyParameters };
  schema.copyParameters = { folder: "Import", label: "copy current parameters", action: copyParameters };
  schema.styleSource = { folder: "Import/Style", label: "source", options: styleOptions(false), target: styleState, prop: "source" };
  schema.copyStyle = { folder: "Import/Style", label: "copy style", action: copyStyle };
  schema.styleTarget = { folder: "Import/Style", label: "target", options: styleOptions(true), target: styleState, prop: "target" };
  schema.pasteStyle = { folder: "Import/Style", label: "paste style", action: pasteStyle };
  schema.exportSvg = { folder: "Export", label: "export SVG", action: exportSvg };
  return schema;
};

export const isCollapsed = (path) => {
  const [root, sub] = path.split("/");
  if (/^Shape \d+$/.test(root)) return sub ? true : root !== `Shape ${shapes.length}`;
  return false;
};
