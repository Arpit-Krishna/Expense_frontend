# Expensify design system

The source of truth for how Expensify looks and moves. Tokens live in `src/index.css`; the mark lives in `src/brand/`.

## Brand idea

**The gullak.** Most Indian households saved their first coins in a clay money pot. Expensify is the grown-up version: salary comes in, fixed payments go out, and whatever is left is put aside. The mark is a terracotta gullak taking a coin, which is the one action the app exists to encourage.

- Tagline: "Know where every rupee goes."
- Voice: plain, calm, rupee-first. No hype, no exclamation marks, no finance jargon.
- Logo method: product action (a coin going in) drawn as a single silhouette, with the slot as the only detail. It survives at 16px because it is only a pot and a circle.

## Atmosphere

A calm, warm-paper ledger. Dense enough for daily money checks, quiet enough that the one alert that matters stands out.

| Dial | Value | Meaning |
| --- | --- | --- |
| Design variance | 4 / 10 | Mostly aligned grids; one asymmetric hero on the dashboard and the split auth screen |
| Motion intensity | 3 / 10 | Rise-in on load, the gullak loader, nothing ambient |
| Visual density | 6 / 10 | Card-based, tabular numbers, room to breathe on mobile |

## Colour

Warm monochrome plus one brand accent. Every colour is a CSS variable, so dark mode is a variable swap in `.dark`.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--canvas` | `#F7F6F3` | `#111110` | Page background (warm paper) |
| `--surface` | `#FFFFFF` | `#191918` | Cards, inputs, menus |
| `--subtle` | `#F1F0EC` | `#222220` | Hover fills, skeletons, tracks |
| `--line` | `#E8E6E1` | `#2A2A28` | Hairline borders and dividers |
| `--ink` | `#1A1A19` | `#EDECE8` | Text, primary buttons, the coin |
| `--muted` | `#74726D` | `#9B9994` | Secondary text |
| `--clay` | `#C0643A` | `#D98159` | **Brand accent.** Logo, loader, splash, avatar |
| `--clay-deep` | `#6E3219` | `#7A3A1E` | The gullak slot |
| `--ok` | `#4F8A5F` | `#6AA878` | Budget on track |
| `--warn` | `#C98A1B` | `#D9A13C` | 80% of a limit reached |
| `--bad` | `#C4534F` | `#D86B66` | Over a limit, destructive actions |

Rules:
- Clay is the only accent and belongs to brand moments. Never use it for data, charts, progress bars or status, because it sits too close to warn and bad.
- Status colours (ok, warn, bad) are reserved for budget state. They are never decoration.
- Primary actions are ink, not clay. The brand should never compete with a button.
- No pure black, no neon, no purple or blue gradients, no glows.

## Typography

| Use | Font | Setting |
| --- | --- | --- |
| UI, page titles, numbers | Geist | Titles 600, tracking -0.035em; body 400/500 |
| Amounts | Geist, tabular figures | `.amount`, so columns of rupees line up |
| Code-like values | Geist Mono | Rarely used |
| Brand moments only | Instrument Serif | The wordmark, the auth headline, the splash |

The serif is a brand voice, not a UI font. Dashboards, forms and tables stay in Geist.

## Logo and icons

- `src/brand/mark.js` holds the one geometry (64 unit grid). `markSvg()` draws it as a string for icons; `GullakMark.jsx` draws it with theme tokens; `loaderAnimation.js` animates the same shapes.
- App icons and the favicon: clay gullak with a cream coin on an ink tile. Maskable icons keep the mark inside the 80% safe zone.
- Regenerate PNG icons by rendering `markSvg()` in a headless browser at 192, 512, maskable 512 and apple-touch 180.
- Interface icons come from Phosphor (`src/lib/icons.js`). Never hand-draw UI icons; the gullak is the only custom drawing.

## Components

- **Card**: 12px radius, 1px `--line` border, white surface, no shadow.
- **Buttons**: primary ink, secondary outlined, ghost for quiet actions, danger for deletes. Press state scales to 0.98.
- **Inputs**: label above, error text below in `--bad-ink`, ink focus border with a soft ring.
- **Status badge**: small uppercase pill with a dot, tinted with the status soft colour.
- **Progress bar**: 6px track in `--subtle`, fill in the status colour, a tick marks the 80% line.
- **Loaders**:
  - Full page or section: the gullak Lottie (`GullakLoader` in `components/Spinner.jsx`), after a 180ms delay so fast loads never flash.
  - Lists: skeleton rows shaped like the content (`ListSkeleton`).
  - Inside buttons: the small inline ring (`InlineSpinner`).
  - App boot: the HTML splash in `index.html` (still mark with a CSS coin drop), faded out once React paints.

## Motion

- The loader story, 1.6s loop at 60fps: a coin spins down, slips into the slot, the pot squashes and settles, and a small clink flashes over the slot.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` for entrances; gravity easing for the coin.
- Page content rises 10px and fades in, staggered 60ms per block.
- `prefers-reduced-motion`: the loader shows the still mark, the splash coin does not move, and CSS animations collapse to 1ms.
- The Lottie player (`lottie-web` light build, no expressions, no eval) loads on demand. If it fails to load, the still mark stays.

## Layout

- Max width 72rem, 16px side padding on phones, 24px from `sm`.
- Sticky blurred header on desktop; bottom tab bar on phones with Add in the middle.
- Every page is one column on phones. No horizontal scroll at 360px.
- Touch targets are at least 40px.

## Anti-patterns

- No em-dashes in UI copy.
- No clay on data, and no second accent colour.
- No serif in tables, forms or page titles.
- No spinning rings for page loads; use the gullak or a skeleton.
- No emoji as icons, no hand-drawn UI icons, no stock illustrations.
- No expression-bodied `useEffect`. Brave and newer Chrome return a Promise from scroll calls, which React then runs as a cleanup and crashes. Always use block bodies.
