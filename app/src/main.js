// Neon Coast — Poster Cover Studio, editor wiring: state, undo/redo, uploads, export, ?shot= scenes.
import { drawCover, layoutPanels, LAYOUTS, GRADES, SIZES } from './cover.js';
import { PRESETS, applyPreset } from './presets.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const status = document.getElementById('status');
const SAMPLES = ['car-palms', 'woman-car', 'man-rooftop', 'friends-neon', 'man-pier', 'skyline-dusk', 'pier', 'boulevard', 'harbour-night', 'beach-tower', 'diner-neon', 'motel-dusk', 'hero-woman-car', 'hero-woman-neon', 'hero-woman-heist', 'duo-convertible', 'duo-hood'];

const state = {
  layout: 'collage9', grade: 'ink', ink: 0.8, title: 'SUNSET DUO', subtitle: 'welcome to Leonida',
  tagline: 'TWO OUTLAWS. ONE SUNSET.',
  stars: '★★★★★', grain: true, vignette: true, size: 'square',
  panels: Array.from({ length: 9 }, () => ({ img: null, photo: null, zoom: 1, ox: 0, oy: 0 })),
};
let selectedPanel = 0;
let pendingPhoto = null; // sample id tapped while no panel was armed
const library = {}; // photo id -> Image
let undoStack = [], redoStack = [];

export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadLibrary() {
  for (const id of SAMPLES) {
    try { library[id] = await loadImage(`samples/${id}.jpg`); } catch { /* sample missing: skip */ }
  }
}

function snapshot() {
  return JSON.stringify({ ...state, panels: state.panels.map((p) => ({ photo: p.photo, zoom: p.zoom, ox: p.ox, oy: p.oy })) });
}
function pushUndo() { undoStack.push(snapshot()); if (undoStack.length > 40) undoStack.shift(); redoStack = []; }
function restore(json) {
  const s = JSON.parse(json);
  Object.assign(state, s);
  state.panels = s.panels.map((p) => ({ ...p, img: p.photo ? library[p.photo] ?? null : null }));
  syncControls();
  redraw();
}
function undo() { if (!undoStack.length) return; redoStack.push(snapshot()); restore(undoStack.pop()); }
function redo() { if (!redoStack.length) return; undoStack.push(snapshot()); restore(redoStack.pop()); }

function redraw() {
  drawCover(canvas, state);
  document.getElementById('panelLabel').textContent = `Panel ${selectedPanel + 1} of 9`;
  renderSlots();
}

function renderSlots() {
  const el = document.getElementById('slots');
  el.innerHTML = '';
  state.panels.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = i === selectedPanel ? 'sel' : '';
    b.title = `Panel ${i + 1}`;
    if (p.img) {
      const im = document.createElement('img');
      im.src = p.img.src;
      im.alt = `Panel ${i + 1}`;
      b.appendChild(im);
    } else b.textContent = `${i + 1}`;
    b.addEventListener('click', () => {
      selectedPanel = i;
      if (pendingPhoto) { placePhoto(pendingPhoto); pendingPhoto = null; }
      syncControls();
      redraw();
    });
    el.appendChild(b);
  });
}

function placePhoto(id) {
  pushUndo();
  const p = state.panels[selectedPanel];
  p.photo = id;
  p.img = library[id] ?? null;
  redraw();
}

function buildChips(el, items, current, onPick) {
  el.innerHTML = '';
  for (const [key, label] of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    if (key === current) b.classList.add('active');
    b.addEventListener('click', () => { pushUndo(); onPick(key); buildChips(el, items, key, onPick); redraw(); });
    el.appendChild(b);
  }
}

function syncControls() {
  const p = state.panels[selectedPanel];
  document.getElementById('zoom').value = p.zoom;
  document.getElementById('offX').value = p.ox;
  document.getElementById('offY').value = p.oy;
  document.getElementById('title').value = state.title;
  document.getElementById('subtitle').value = state.subtitle;
  document.getElementById('tagline').value = state.tagline;
  document.getElementById('stars').value = state.stars;
  document.getElementById('grain').checked = state.grain;
  document.getElementById('vignette').checked = state.vignette;
  document.getElementById('ink').value = state.ink ?? 0.8;
  buildChips(document.getElementById('layouts'), Object.entries(LAYOUTS).map(([k, v]) => [k, v.name]), state.layout, (k) => { state.layout = k; });
  buildChips(document.getElementById('grades'), Object.entries(GRADES).map(([k, v]) => [k, v.name]), state.grade, (k) => { state.grade = k; });
  buildChips(document.getElementById('sizes'), Object.entries(SIZES).map(([k, v]) => [k, v.name]), state.size, (k) => { state.size = k; applySize(); });
}

function applySize() {
  const s = SIZES[state.size];
  canvas.width = s.w;
  canvas.height = s.h;
  redraw();
}

function renderSamples() {
  const el = document.getElementById('samples');
  el.innerHTML = '';
  for (const id of SAMPLES) {
    if (!library[id]) continue;
    const im = document.createElement('img');
    im.src = library[id].src;
    im.alt = id;
    im.title = id;
    im.addEventListener('click', () => {
      el.querySelectorAll('img').forEach((x) => x.classList.remove('sel'));
      im.classList.add('sel');
      placePhoto(id);
      status.textContent = `${id} → panel ${selectedPanel + 1}`;
    });
    el.appendChild(im);
  }
}

function renderPresets() {
  const el = document.getElementById('presets');
  if (!el) return;
  el.innerHTML = '';
  for (const [key, p] of Object.entries(PRESETS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = p.label;
    b.addEventListener('click', () => {
      pushUndo();
      applyPreset(state, library, key);
      syncControls();
      redraw();
      status.textContent = `Preset “${p.label}” applied — a finished poster in one tap.`;
    });
    el.appendChild(b);
  }
}

function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function exportSize(key) {
  const s = SIZES[key];
  const off = document.createElement('canvas');
  off.width = s.w;
  off.height = s.h;
  drawCover(off, state);
  off.toBlob((blob) => {
    if (!blob) return;
    download(blob, `neon-coast-cover-${s.w}x${s.h}.png`);
    status.textContent = `Saved neon-coast-cover-${s.w}x${s.h}.png`;
  }, 'image/png');
}

// ---- events ----
document.getElementById('undo').addEventListener('click', undo);
document.getElementById('redo').addEventListener('click', redo);
document.getElementById('shuffle').addEventListener('click', () => {
  pushUndo();
  const ids = Object.keys(library);
  state.panels.forEach((p) => { p.photo = ids[Math.floor(Math.random() * ids.length)]; p.img = library[p.photo]; });
  const grades = Object.keys(GRADES);
  state.grade = grades[Math.floor(Math.random() * grades.length)];
  syncControls();
  redraw();
  status.textContent = 'Shuffled photos and grade — tap Export when you like it.';
});
document.getElementById('fillAll').addEventListener('click', () => {
  const p = state.panels[selectedPanel];
  if (!p.photo) { status.textContent = 'Tap a sample into a panel first.'; return; }
  pushUndo();
  state.panels.forEach((q) => { q.photo = p.photo; q.img = p.img; });
  redraw();
  status.textContent = `All 9 panels now use ${p.photo}.`;
});
document.getElementById('upload').addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    const id = `up-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    library[id] = await loadImage(URL.createObjectURL(file));
    SAMPLES.push(id);
    placePhoto(id);
  }
  renderSamples();
  status.textContent = `${e.target.files.length} photo(s) added.`;
  e.target.value = '';
});
for (const [id, key] of [['zoom', 'zoom'], ['offX', 'ox'], ['offY', 'oy']]) {
  document.getElementById(id).addEventListener('input', (e) => {
    state.panels[selectedPanel][key] = Number(e.target.value);
    redraw();
  });
  document.getElementById(id).addEventListener('change', () => pushUndo());
}
document.getElementById('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
document.getElementById('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
document.getElementById('tagline').addEventListener('input', (e) => { state.tagline = e.target.value; redraw(); });
document.getElementById('stars').addEventListener('change', (e) => { state.stars = e.target.value; redraw(); });
document.getElementById('grain').addEventListener('change', (e) => { state.grain = e.target.checked; redraw(); });
document.getElementById('vignette').addEventListener('change', (e) => { state.vignette = e.target.checked; redraw(); });
document.getElementById('ink').addEventListener('input', (e) => { state.ink = Number(e.target.value); redraw(); });
document.getElementById('ink').addEventListener('change', () => pushUndo());
document.getElementById('export').addEventListener('click', () => exportSize(state.size));
document.getElementById('exportAll').addEventListener('click', () => {
  Object.keys(SIZES).forEach((k, i) => setTimeout(() => exportSize(k), i * 400));
  status.textContent = 'Exporting all 4 sizes…';
});
canvas.addEventListener('click', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * canvas.width;
  const y = ((e.clientY - r.top) / r.height) * canvas.height;
  const rects = layoutPanels(canvas.width, canvas.height, state.layout);
  const hit = rects.findIndex((rc) => x >= rc.x && x <= rc.x + rc.w && y >= rc.y && y <= rc.y + rc.h);
  if (hit >= 0 && hit < 9) { selectedPanel = hit; syncControls(); redraw(); }
});

// ---- boot ----
const query = new URLSearchParams(location.search);
const shot = query.get('shot');
await document.fonts.ready;
await loadLibrary();
// Default cover: 9-panel COLLAGE with the DUO in the center panel (largest)
// + Poster Ink grade — two original protagonists, generated with an image
// model — NOT GTA characters. All 8 surrounding panels are warm sunset
// shots (coherence pass); the center panel is framed oy +0.28 so both faces
// stay in the wide-short panel.
const defaults = ['hero-woman-neon', 'car-palms', 'hero-woman-car', 'man-rooftop', 'duo-convertible', 'woman-car', 'motel-dusk', 'duo-hood', 'hero-woman-heist'];
state.panels.forEach((p, i) => { p.photo = defaults[i]; p.img = library[defaults[i]] ?? null; });
state.panels[4].oy = 0.28;
renderSamples();
renderPresets();
syncControls();
if (shot) {
  await runShot(shot, query, { state, library, applySize, redraw, loadImage });
} else {
  redraw();
}
