# Type Garden

Type words and they grow into a garden. Plain HTML/CSS/JS drawn on a canvas, with no build step and no dependencies.

## Run locally
    npx serve .        # or: python3 -m http.server 8000

## Layout
- `index.html`: markup, font links, Tune panel skeleton
- `src/styles.css`: all styling
- `src/garden.js`: the `Garden` class (flowers, wind, seasons, weather, poster mode, exports)

## Where to extend
- New flower: add a method like `tulip()` and list it in `SPECIES` and `FLORA`
- New palette: append a row to `PAL` (`name, bg, flower, stem, line, type`)
- New season or weather: `GRADE`, `AUTO`, `weatherFront()`
- Settings: add a key to `DEF`, then a control in `buildTune()`
- New command in the ⌘K palette: add a line in `buildCmds()`
- New curated look: append to `LOOKS` (name, blurb, palette index, flora, font, season, weather)
- Icon: `favicon.svg` (black ground, red bloom, blue stem, typing caret)

## Deploy
Connected to Vercel through GitHub: every push to `main` deploys to production, and every branch or PR gets a preview URL.

Share links carry words, palette, flowers, typeface, season and weather in the URL hash.
