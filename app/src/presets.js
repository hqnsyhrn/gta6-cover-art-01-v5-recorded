// One-click poster presets: each is a DIFFERENT poster — its own person-led
// hero photo, its own title and its own tagline (not just a grade swap on the
// same poster). Every preset uses DISTINCT photos; strip photos are bright
// daylight/sunset shots so the strip reads at thumbnail size.
// Shared by main.js (editor) and shots.js (?shot= scenes).
export const PRESETS = {
  'sunset-duo': {
    label: 'Sunset Duo', layout: 'collage9', grade: 'ink',
    title: 'SUNSET DUO', subtitle: 'welcome to Leonida',
    tagline: 'TWO OUTLAWS. ONE SUNSET.',
    // 9-panel collage, row-major; index 4 is the CENTER panel (largest) =
    // the duo. All 8 surrounding panels are warm sunset/golden-hour shots —
    // no daylight tower / neon skyline in the #1 collage (coherence pass).
    photos: ['hero-woman-neon', 'car-palms', 'hero-woman-car', 'man-rooftop', 'duo-convertible', 'woman-car', 'motel-dusk', 'duo-hood', 'hero-woman-heist'],
    // Per-panel framing: the duo photo is 3:2 with the faces in the upper
    // band, and the center panel is wide-short — oy +0.28 keeps both faces
    // in frame instead of cropping them off.
    tune: [null, null, null, null, { zoom: 1, ox: 0, oy: 0.28 }, null, null, null, null],
  },
  'neon-harbour': {
    label: 'Neon Harbour', layout: 'posterHero', grade: 'neon',
    title: 'NEON HARBOUR', subtitle: 'welcome to Leonida',
    tagline: 'EVERY STREET HAS A STORY.',
    photos: ['hero-woman-neon', 'car-palms', 'beach-tower', 'skyline-dusk'],
  },
  'sunset-chase': {
    label: 'Sunset Chase', layout: 'posterHero', grade: 'sunset',
    title: 'SUNSET CHASE', subtitle: 'welcome to Leonida',
    tagline: 'EVERY SUNSET HAS A PRICE.',
    photos: ['hero-woman-car', 'beach-tower', 'skyline-dusk', 'man-pier'],
  },
  'gold-hour': {
    label: 'Gold Hour', layout: 'poster', grade: 'gold',
    title: 'GOLD HOUR', subtitle: 'welcome to Leonida',
    tagline: 'ONE CITY. NO WAY OUT.',
    photos: ['hero-woman-heist', 'motel-dusk', 'beach-tower', 'car-palms'],
  },
  'vice-nights': {
    label: 'Vice Nights', layout: 'hero8', grade: 'teal',
    title: 'VICE NIGHTS', subtitle: 'welcome to Leonida',
    tagline: 'THE CITY NEVER SLEEPS.',
    photos: ['man-rooftop', 'hero-woman-neon', 'diner-neon', 'friends-neon', 'skyline-dusk', 'harbour-night', 'beach-tower', 'motel-dusk', 'car-palms'],
  },
};

/** Apply a preset to editor state (layout/grade/lettering + distinct photos). */
export function applyPreset(state, library, key) {
  const p = PRESETS[key];
  if (!p) return false;
  state.layout = p.layout;
  state.grade = p.grade;
  state.title = p.title;
  state.subtitle = p.subtitle;
  state.tagline = p.tagline;
  state.panels.forEach((panel, i) => {
    const id = p.photos[i % p.photos.length];
    panel.photo = id;
    panel.img = library[id] ?? null;
    const t = p.tune?.[i];
    panel.zoom = t?.zoom ?? 1;
    panel.ox = t?.ox ?? 0;
    panel.oy = t?.oy ?? 0;
  });
  return true;
}
