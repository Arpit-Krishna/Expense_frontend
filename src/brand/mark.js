// The Expensify mark: a gullak (clay money pot) taking a coin.
// One geometry, drawn on a 64 unit grid, feeds the SVG logo, the app icons and the Lottie loader.

export const BRAND = {
  clay: '#C0643A',
  clayDark: '#D98159',
  slot: '#6E3219',
  ink: '#1A1A19',
  cream: '#F7F6F3',
};

// Pot parts, all filled with the clay colour. Coordinates are in the 64 grid.
export const POT = {
  body: { cx: 32, cy: 40, rx: 19, ry: 16 },
  neck: { x: 21.5, y: 21, w: 21, h: 8, r: 3 },
  foot: { x: 24.5, y: 51, w: 15, h: 6, r: 2.5 },
  slot: { x: 23.5, y: 20.2, w: 17, h: 2.8, r: 1.4 },
  // Soft highlight on the left shoulder, so the pot reads as round clay.
  shine: 'M18.5 38 C18.5 32 22 28.5 26.5 27',
};

// Coin resting half inside the slot. Its lower half hides behind the neck.
export const COIN = { cx: 32, cy: 15, r: 7.5, ring: 4.6 };

export const SHADOW = { cx: 32, cy: 58.5, rx: 13, ry: 1.8 };

const rect = ({ x, y, w, h, r }, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;

/** Returns the mark as an SVG string. Pass tile to draw it on a rounded square. */
export function markSvg({ pot = BRAND.clay, slot = BRAND.slot, coin = BRAND.ink, coinRing = BRAND.cream, tile, tileRadius = 14, pad = 0 } = {}) {
  const { body } = POT;
  const inner = [
    `<circle cx="${COIN.cx}" cy="${COIN.cy}" r="${COIN.r}" fill="${coin}"/>`,
    `<circle cx="${COIN.cx}" cy="${COIN.cy}" r="${COIN.ring}" fill="none" stroke="${coinRing}" stroke-opacity="0.35" stroke-width="1.2"/>`,
    rect(POT.foot, pot),
    `<ellipse cx="${body.cx}" cy="${body.cy}" rx="${body.rx}" ry="${body.ry}" fill="${pot}"/>`,
    rect(POT.neck, pot),
    `<path d="${POT.shine}" fill="none" stroke="${BRAND.cream}" stroke-opacity="0.35" stroke-width="2.2" stroke-linecap="round"/>`,
    rect(POT.slot, slot),
  ].join('');
  const s = (64 - pad * 2) / 64;
  const g = pad ? `<g transform="translate(${pad} ${pad}) scale(${s})">${inner}</g>` : inner;
  const bg = tile ? `<rect width="64" height="64" rx="${tileRadius}" fill="${tile}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${bg}${g}</svg>`;
}
