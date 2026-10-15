import React from "https://esm.sh/react@18.3.1";
import { createPlugin, useInputContext, Components } from "https://esm.sh/leva@0.10.0/plugin?bundle=false&deps=react@18.3.1,react-dom@18.3.1";

const { Row, Label } = Components;
const h = React.createElement;

const buttonStyle = (active) => ({
  flex: 1,
  height: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  background: active ? "#39ff8f" : "#14301f",
  color: active ? "#000" : "#c9f2d9",
});

const Icon = ({ rects }) =>
  h(
    "svg",
    { width: 16, height: 16, viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": true },
    rects.map(([x, y, w, ht], i) => h("rect", { key: i, x, y, width: w, height: ht, rx: 0.5 })),
  );

const ButtonGroup = () => {
  const { label, value, onUpdate, settings } = useInputContext();
  return h(
    Row,
    { input: true },
    h(Label, null, label),
    h(
      "div",
      { role: "group", "aria-label": label, style: { display: "flex", gap: 4 } },
      settings.choices.map((option) =>
        h(
          "button",
          {
            key: option.value,
            type: "button",
            title: option.label,
            "aria-label": option.label,
            "aria-pressed": option.value === value,
            style: buttonStyle(option.value === value),
            onClick: () => onUpdate(option.value),
          },
          h(Icon, { rects: option.rects }),
        ),
      ),
    ),
  );
};

const plugins = new WeakMap();

const pluginFor = (choices) => {
  if (!plugins.has(choices)) {
    plugins.set(
      choices,
      createPlugin({
        normalize: (value) => ({ value, settings: { choices } }),
        component: ButtonGroup,
      }),
    );
  }
  return plugins.get(choices);
};

export const buttonGroup = ({ value, choices, label }) => pluginFor(choices)({ value, label });
