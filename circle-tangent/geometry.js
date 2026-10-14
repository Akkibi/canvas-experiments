const TAU = Math.PI * 2;
const f = (n) => +n.toFixed(2);

export const linkGeometry = (a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= Math.abs(a.radius - b.radius)) return null;
  return {
    a,
    b,
    base: Math.atan2(dy, dx),
    offset: Math.acos((a.radius - b.radius) / dist),
  };
};

const point = (c, r, angle) => [c.x + Math.cos(angle) * r, c.y + Math.sin(angle) * r];

export const hullPath = ({ a, b, base, offset }, gap, inset = 0) => {
  const ra = a.radius + gap - inset;
  const rb = b.radius + gap - inset;
  if (ra <= 0 || rb <= 0) return null;
  const [x1, y1] = point(a, ra, base + offset);
  const [x2, y2] = point(a, ra, base - offset);
  const [x3, y3] = point(b, rb, base - offset);
  const [x4, y4] = point(b, rb, base + offset);
  const backLarge = offset < Math.PI / 2 ? 1 : 0;
  const frontLarge = offset > Math.PI / 2 ? 1 : 0;
  return (
    `M${f(x1)} ${f(y1)}A${f(ra)} ${f(ra)} 0 ${backLarge} 1 ${f(x2)} ${f(y2)}` +
    `L${f(x3)} ${f(y3)}A${f(rb)} ${f(rb)} 0 ${frontLarge} 1 ${f(x4)} ${f(y4)}Z`
  );
};

export const tangentLines = ({ a, b, base, offset }, gap) =>
  [1, -1].map((sign) => {
    const angle = base + sign * offset;
    return [...point(a, a.radius + gap, angle), ...point(b, b.radius + gap, angle)];
  });

export { TAU };
