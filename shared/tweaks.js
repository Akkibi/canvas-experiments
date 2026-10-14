import React, { useEffect } from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import { Leva, useControls, button } from "https://esm.sh/leva@0.10.0?deps=react@18.3.1,react-dom@18.3.1";

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

const buildConfig = (params, schema) =>
  Object.fromEntries(
    Object.entries(schema).map(([key, def]) => [
      def.action ? def.label : key,
      def.action
        ? button(def.action)
        : typeof params[key] === "number"
        ? { value: params[key], min: def.min, max: def.max, step: def.step, label: def.label }
        : { value: params[key], label: def.label },
    ]),
  );

export const createTweaks = (params, schema, onChange) => {
  const Panel = () => {
    const values = useControls(buildConfig(params, schema));
    useEffect(() => {
      Object.assign(params, values);
      onChange();
    }, [values]);
    return React.createElement(Leva, { theme, titleBar: { title: "Tweaks" } });
  };

  const host = document.createElement("div");
  host.id = "tweaks";
  document.body.appendChild(host);
  createRoot(host).render(React.createElement(Panel));
};
