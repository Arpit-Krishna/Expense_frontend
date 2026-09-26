// Builds the Lottie JSON for the loading animation from the mark geometry, so the
// loader always matches the logo and can take the current theme's colours.
// Story (1.6s loop): a coin drops and spins, slips into the gullak, the pot
// squashes and settles, and a small clink flashes over the slot.
import { COIN, POT, SHADOW } from './mark.js';

const FRAMES = 96;
const SIZE = 80;
// The 64 grid sits low in an 80 box, leaving headroom for the falling coin.
const OFFSET = [8, 14];
const shift = ([x, y, z = 0]) => [x + OFFSET[0], y + OFFSET[1], z];
const still = (k) => ({ a: 0, k });
const EASE_OUT = { o: { x: 0.2, y: 0 }, i: { x: 0.2, y: 1 } };
const EASE_IN_OUT = { o: { x: 0.45, y: 0 }, i: { x: 0.35, y: 1 } };
const GRAVITY = { o: { x: 0.55, y: 0 }, i: { x: 0.9, y: 0.75 } };

/** keys: [[frame, value, ease?], ...]; the ease shapes the move towards the next key. */
function anim(keys) {
  return {
    a: 1,
    k: keys.map(([t, s, ease = EASE_IN_OUT], n) => {
      const key = { t, s: Array.isArray(s) ? s : [s] };
      if (n < keys.length - 1) Object.assign(key, ease);
      return key;
    }),
  };
}

function rgba(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, 1];
}

const fill = (hex, opacity = 100) => ({ ty: 'fl', c: still(rgba(hex)), o: still(opacity), r: 1 });
const stroke = (hex, width, opacity = 100) => ({ ty: 'st', c: still(rgba(hex)), o: still(opacity), w: still(width), lc: 2, lj: 2 });
const ellipse = (cx, cy, w, h) => ({ ty: 'el', p: still([cx, cy]), s: still([w, h]), d: 1 });
const rect = ({ x, y, w, h, r }) => ({ ty: 'rc', p: still([x + w / 2, y + h / 2]), s: still([w, h]), r: still(r), d: 1 });
const path = (v, i, o) => ({ ty: 'sh', ks: still({ v, i, o, c: false }) });
const line = (from, to) => path([from, to], [[0, 0], [0, 0]], [[0, 0], [0, 0]]);

function group(nm, items) {
  return {
    ty: 'gr', nm,
    it: [...items, { ty: 'tr', p: still([0, 0]), a: still([0, 0]), s: still([100, 100]), r: still(0), o: still(100), sk: still(0), sa: still(0) }],
  };
}

function layer(ind, nm, shapes, { p = [32, 32], a = p, s = still([100, 100, 100]), o = still(100) } = {}) {
  return {
    ddd: 0, ind, ty: 4, nm, sr: 1, ao: 0, bm: 0, ip: 0, op: FRAMES, st: 0,
    ks: { o, r: still(0), p: p.a ? { ...p, k: p.k.map((key) => ({ ...key, s: shift(key.s) })) } : still(shift(p)), a: still([...a, 0]), s },
    shapes,
  };
}

/** colors: { pot, slot, coin, coinRing, clink } as hex strings. */
export function buildLoaderAnimation(colors) {
  const { body, neck, foot, slot } = POT;
  const base = [32, 57];

  // Squash and stretch, anchored at the foot so the pot stays on the ground.
  const potScale = anim([
    [0, [100, 100, 100]], [36, [100, 100, 100], EASE_OUT], [42, [107, 92, 100], EASE_IN_OUT],
    [52, [97, 104, 100], EASE_IN_OUT], [62, [101, 99, 100], EASE_IN_OUT], [70, [100, 100, 100]], [FRAMES, [100, 100, 100]],
  ]);

  const clink = layer(1, 'clink', [group('rays', [
    line([23, 15], [19.5, 11.5]), line([32, 11], [32, 6]), line([41, 15], [44.5, 11.5]),
    stroke(colors.clink, 2),
  ])], {
    p: [32, 19],
    s: anim([[0, [60, 60, 100]], [36, [60, 60, 100], EASE_OUT], [50, [115, 115, 100]], [FRAMES, [115, 115, 100]]]),
    o: anim([[0, 0], [36, 0, EASE_OUT], [41, 100], [52, 0], [FRAMES, 0]]),
  });

  const pot = layer(2, 'gullak', [
    group('slot', [rect(slot), fill(colors.slot)]),
    group('shine', [path([[18.5, 38], [26.5, 27]], [[0, 0], [-4.5, 1.5]], [[0, -6], [0, 0]]), stroke('#F7F6F3', 2.2, 35)]),
    group('neck', [rect(neck), fill(colors.pot)]),
    group('body', [ellipse(body.cx, body.cy, body.rx * 2, body.ry * 2), fill(colors.pot)]),
    group('foot', [rect(foot), fill(colors.pot)]),
  ], { p: base, s: potScale });

  const coin = layer(3, 'coin', [
    group('ring', [ellipse(COIN.cx, COIN.cy, COIN.ring * 2, COIN.ring * 2), stroke(colors.coinRing, 1.2, 35)]),
    group('face', [ellipse(COIN.cx, COIN.cy, COIN.r * 2, COIN.r * 2), fill(colors.coin)]),
  ], {
    a: [COIN.cx, COIN.cy],
    p: anim([[0, [32, -10, 0]], [6, [32, -10, 0], GRAVITY], [28, [32, COIN.cy, 0], { o: { x: 0.3, y: 0.3 }, i: { x: 0.7, y: 0.7 } }], [38, [32, 36, 0]], [FRAMES, [32, 36, 0]]]),
    s: anim([[0, [100, 100, 100]], [6, [100, 100, 100]], [17, [12, 100, 100]], [28, [100, 100, 100]], [FRAMES, [100, 100, 100]]]),
    o: anim([[0, 0], [10, 100], [38, 100], [39, 0], [FRAMES, 0]]),
  });

  const shadow = layer(4, 'shadow', [group('shadow', [ellipse(SHADOW.cx, SHADOW.cy, SHADOW.rx * 2, SHADOW.ry * 2), fill(colors.coin, 10)])], {
    p: [SHADOW.cx, SHADOW.cy],
    s: anim([[0, [100, 100, 100]], [36, [100, 100, 100], EASE_OUT], [42, [112, 100, 100]], [52, [94, 100, 100]], [62, [100, 100, 100]], [FRAMES, [100, 100, 100]]]),
  });

  return { v: '5.7.4', fr: 60, ip: 0, op: FRAMES, w: SIZE, h: SIZE, nm: 'Expensify gullak loader', ddd: 0, assets: [], layers: [clink, pot, coin, shadow] };
}
