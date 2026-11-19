// Fixed scenes for screenshots: ?shot=cover draws one exported cover full-frame;
// ?shot=editor shows the editor with photos loaded. window.__shotReady is set once painted.
// Query params: size (square|portrait|wide|story), layout, grade, title, subtitle,
// tagline, preset (one-click poster preset), photos (comma list of sample ids,
// fills panels in order), photo (one sample for all panels).
import { applyPreset } from './presets.js';

export async function runShot(shot, query, ctx) {
  const { state, library, applySize, redraw } = ctx;
  if (query.get('preset')) applyPreset(state, library, query.get('preset'));
  if (query.get('layout')) state.layout = query.get('layout');
  if (query.get('grade')) state.grade = query.get('grade');
  if (query.get('ink') !== null) state.ink = Number(query.get('ink'));
  if (query.get('title')) state.title = query.get('title');
  if (query.get('subtitle')) state.subtitle = query.get('subtitle');
  if (query.get('tagline')) state.tagline = query.get('tagline');
  const photos = query.get('photos');
  if (photos) {
    const ids = photos.split(',');
    state.panels.forEach((p, i) => {
      const id = ids[i % ids.length];
      p.photo = id;
      p.img = library[id] ?? null;
      // Reset framing: the boot default tunes panel 5 (oy +0.28) for the
      // collage9 center panel — it must not leak into other layouts, where
      // it would push the photo down inside its clipped panel rect.
      p.zoom = 1; p.ox = 0; p.oy = 0;
    });
  } else if (query.get('photo')) {
    const id = query.get('photo');
    state.panels.forEach((p) => { p.photo = id; p.img = library[id] ?? null; p.zoom = 1; p.ox = 0; p.oy = 0; });
  }
  if (query.get('size')) { state.size = query.get('size'); applySize(); }
  if (shot === 'cover') document.body.classList.add('shot-cover');
  await document.fonts.ready;
  redraw();
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  window.__shotReady = true;
}
