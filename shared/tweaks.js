import React, { useEffect, useRef, useState } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import { buttonGroup } from "./buttonGroup.js";
import { Leva, useControls, button, folder } from "https://esm.sh/leva@0.10.0?bundle=false&deps=react@18.3.1,react-dom@18.3.1";

const theme = {
  colors: {
    elevation1: "#0b1410",
    elevation2: "#060a08",
    elevation3: "#14301f",
    accent1: "#1f8a52",
    accent2: "#39ff8f",
    accent3: "#39ff8f",
    highlight1: "#6f9c82",
    highlight2: "#c9f2d9",
    highlight3: "#eafff2",
    vivid1: "#39ff8f",
  },
  fonts: { mono: '"Cal Sans", sans-serif', sans: '"Cal Sans", sans-serif' },
};

const HEX8 = /^#[0-9a-f]{8}$/i;
const channel = (n) => Math.round(n).toString(16).padStart(2, "0");

const hex8ToRgba = (hex) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
  a: +(parseInt(hex.slice(7, 9), 16) / 255).toFixed(3),
});

const rgbaToHex8 = ({ r, g, b, a }) => `#${channel(r)}${channel(g)}${channel(b)}${channel(a * 255)}`;

const toPanel = (value) => (typeof value === "string" && HEX8.test(value) ? hex8ToRgba(value) : value);
const fromPanel = (value) => (value && typeof value === "object" && "a" in value ? rgbaToHex8(value) : value);

const buildControl = (value, def) =>
  def.action
    ? button(def.action)
    : def.buttons
    ? buttonGroup({ value, choices: def.buttons, label: def.label })
    : def.options
    ? { value, options: def.options, label: def.label }
    : typeof value === "number"
    ? { value, min: def.min, max: def.max, step: def.step, label: def.label }
    : { value: toPanel(value), label: def.label, ...(def.rows ? { rows: def.rows } : {}) };

const emptyNode = () => new Map();

const toConfig = (node, path, collapsed) => {
  const config = {};
  for (const [name, entry] of node) {
    if (!entry.children) {
      config[name] = entry.control;
      continue;
    }
    const childPath = [...path, name];
    config[name] = folder(toConfig(entry.children, childPath, collapsed), {
      collapsed: collapsed(childPath.join("/")),
    });
  }
  return config;
};

const buildConfig = (params, schema, collapsed) => {
  const root = emptyNode();
  for (const [key, def] of Object.entries(schema)) {
    const value = (def.target ?? params)[def.prop ?? key];
    let node = root;
    for (const part of def.folder ? def.folder.split("/") : []) {
      if (!node.has(part)) node.set(part, { children: emptyNode() });
      node = node.get(part).children;
    }
    node.set(def.action ? def.label : key, { control: buildControl(value, def) });
  }
  return toConfig(root, [], collapsed);
};

export const createTweaks = (params, initialSchema, onChange, initialCollapsed = () => false) => {
  let schema = initialSchema;
  let collapsed = initialCollapsed;
  const listeners = new Set();

  const Panel = () => {
    const [version, setVersion] = useState(0);
    const skipNext = useRef(false);
    useEffect(() => {
      const bump = () => {
        skipNext.current = true;
        setVersion((v) => v + 1);
      };
      listeners.add(bump);
      return () => listeners.delete(bump);
    }, []);
    const [values, set] = useControls(() => buildConfig(params, schema, collapsed), [version]);
    useEffect(() => {
      if (!version) return;
      const current = {};
      for (const [key, def] of Object.entries(schema)) {
        if (!def.action) current[key] = toPanel((def.target ?? params)[def.prop ?? key]);
      }
      set(current);
    }, [version]);
    useEffect(() => {
      if (skipNext.current) {
        skipNext.current = false;
        return;
      }
      for (const [key, def] of Object.entries(schema)) {
        if (def.action || !(key in values)) continue;
        (def.target ?? params)[def.prop ?? key] = fromPanel(values[key]);
      }
      onChange(values, set);
    }, [values]);
    return React.createElement(Leva, {
      theme,
      titleBar: { title: "Tweaks" },
      hidden: new URLSearchParams(location.search).has("thumb"),
    });
  };

  const style = document.createElement("style");
  style.textContent = "#tweaks button { color: #000 !important; }";
  document.head.appendChild(style);

  const host = document.createElement("div");
  host.id = "tweaks";
  document.body.appendChild(host);
  createRoot(host).render(React.createElement(Panel));

  return {
    refresh: (nextSchema, nextCollapsed) => {
      schema = nextSchema;
      if (nextCollapsed) collapsed = nextCollapsed;
      listeners.forEach((notify) => notify());
    },
  };
};
