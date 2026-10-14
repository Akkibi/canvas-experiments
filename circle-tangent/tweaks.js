const STYLE = `
#tweaks{position:fixed;top:16px;right:16px;width:240px;font:12px ui-monospace,Menlo,Consolas,monospace;color:#c9f2d9;background:rgba(11,20,16,.85);border:1px solid #14301f;border-radius:6px;backdrop-filter:blur(6px);user-select:none}
#tweaks summary{cursor:pointer;padding:8px 12px;color:#39ff8f;letter-spacing:.08em;text-transform:uppercase;font-size:11px}
#tweaks .rows{padding:4px 12px 12px;display:grid;gap:8px}
#tweaks label{display:grid;grid-template-columns:1fr auto;gap:2px 8px;align-items:center}
#tweaks input[type=range]{grid-column:1/-1;width:100%;accent-color:#39ff8f;margin:0}
#tweaks input[type=checkbox]{accent-color:#39ff8f}
#tweaks input[type=color]{width:32px;height:20px;border:1px solid #14301f;background:none;padding:0}
#tweaks output{color:#6f9c82}
`;

export const createTweaks = (params, schema, onChange) => {
  const style = document.createElement("style");
  style.textContent = STYLE;
  document.head.appendChild(style);

  const root = document.createElement("details");
  root.id = "tweaks";
  root.open = true;
  root.innerHTML = `<summary>Tweaks</summary><div class="rows"></div>`;
  const rows = root.querySelector(".rows");

  for (const [key, def] of Object.entries(schema)) {
    const label = document.createElement("label");
    const out = document.createElement("output");
    const input = document.createElement("input");
    label.append(def.label, out);

    if (typeof params[key] === "boolean") {
      input.type = "checkbox";
      input.checked = params[key];
      out.remove();
      label.append(input);
    } else if (typeof params[key] === "string") {
      input.type = "color";
      input.value = params[key];
      out.remove();
      label.append(input);
    } else {
      Object.assign(input, { type: "range", min: def.min, max: def.max, step: def.step });
      input.value = params[key];
      out.textContent = params[key];
      label.append(input);
    }

    input.addEventListener("input", () => {
      params[key] =
        input.type === "checkbox" ? input.checked : input.type === "range" ? Number(input.value) : input.value;
      out.textContent = params[key];
      onChange();
    });
    rows.appendChild(label);
  }

  document.body.appendChild(root);
  return root;
};
