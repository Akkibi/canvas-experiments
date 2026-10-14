// Based on React Bits (https://reactbits.dev) by David Haz. License: MIT + Commons Clause (may not be sold). Keep this notice.
import { cos, floor, screenCoordinate, screenSize, sin, sqrt, uint, vec2 } from "three/tsl";

export const pcg = (v) => {
  const state = v.mul(747796405).add(2891336453);
  const word = state.shiftRight(state.shiftRight(28).add(4)).bitXor(state).mul(277803737);
  return word.shiftRight(22).bitXor(word);
};

export const stochasticOffset = (seed, radius) => {
  const pixel = floor(screenCoordinate.x).toUint().add(floor(screenCoordinate.y).toUint().mul(uint(65536)));
  const base = pcg(pixel);
  const frame = seed.toUint();
  const n1 = pcg(base.add(frame.mul(uint(2)))).toFloat().mul(1 / 2 ** 32);
  const n2 = pcg(pcg(base).add(frame)).toFloat().mul(1 / 2 ** 32);
  const angle = n1.mul(Math.PI * 2);
  return vec2(cos(angle).mul(screenSize.y.div(screenSize.x)), sin(angle)).mul(sqrt(n2).mul(radius));
};
