# Neon Coast — Poster Cover Studio (v5 recorded)

[![make.fun](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/hqnsyhrn/gta6-cover-art-01-v5-recorded/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/hqnsyhrn/gta6-cover-art-01-v5-recorded/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline web app that turns any photos into a GTA 6-style poster, built for the
[make.fun bounty gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01).

This is the recorded rebuild of the v5 "GACOR" design: the default cover is a 9-panel
COLLAGE — the literal structure of the official GTA VI cover — with the DUO in the CENTER
panel (largest), a giant gradient title block across the bottom row, and a Poster Ink
halftone treatment over the whole collage so it reads as printed key art, not a photo
with text. The two protagonists (a woman in a pink blazer and a bearded man in a floral
shirt, generated with an image model — NOT GTA characters) sit in the middle of eight
warm sunset panels, all one coherent golden-hour shoot.

- **9-Panel Collage (default)**: duo photo in the center panel (largest), 8 sunset-graded panels around it, giant pink→yellow gradient title "SUNSET DUO" with a dark outline across the bottom row, starburst badge "SUMMER 2026", heat stars
- **Poster Ink grade**: halftone-dot + posterize treatment as a first-class grade control (with an Ink strength slider), default ON for the #1 collage
- **One-click poster presets**: Sunset Duo, Neon Harbour, Sunset Chase, Gold Hour, Vice Nights — each a DIFFERENT poster with its own hero, title and tagline
- **17 distinct sample photos** — no repeats in any default cover
- **7 layouts**: Poster Hero, 9-Panel Collage, 9-Panel Grid, Hero + 8, Hero + 3, Full-Bleed, Classic Poster
- **Multi-photo**: upload your own photos or use the 17 built-in samples; crop and position each panel
- **7 colour grades**: Poster Ink, Sunset, Neon Vice, Teal Night, Heat Wave, Gold Hour, Mono Noir
- **Bold lettering**: Anton title + Pacifico subtitle + tagline (all OFL, in `app/fonts/`), halftone title block on grid layouts
- **PNG export in 4 sizes**: 1080×1080, 1080×1350, 1920×1080 and 1080×1920 (story)
- **Undo / redo, shuffle, film grain and vignette** — everything runs offline in the browser; photos never leave your machine

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

## Entry

`main.ts` (Node 22) copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with the vendored make.fun library, as the kit's starter does:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

All art and lettering is original (Anton and Pacifico under the SIL Open Font License, in
`app/fonts/`). No Rockstar Games logo, artwork or fonts. Sample photos were made with an
image model.
