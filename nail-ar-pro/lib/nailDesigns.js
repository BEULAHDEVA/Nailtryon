/**
 * Nail Design Generator
 *
 * All designs are generated programmatically on <canvas> elements.
 * This avoids needing external assets and allows infinite customisation.
 *
 * Each design function:
 *   1. Creates a 300×400 canvas
 *   2. Clips to a standard oval nail shape
 *   3. Fills the base color/texture
 *   4. Adds detailing (tips, veins, glitter, etc.)
 *   Note: the renderer adds its own specular gloss on top.
 */

const NW = 300; // nail design canvas width
const NH = 400; // nail design canvas height

// ── Shared utilities ─────────────────────────────────────────────────────────

function mk() {
  const c = document.createElement('canvas');
  c.width = NW; c.height = NH;
  return c;
}

/** Standard oval nail silhouette path */
function nailPath(ctx) {
  const cx = NW / 2, rx = NW * 0.44, ry = NH * 0.47;
  ctx.beginPath();
  // Slightly pointed top, round bottom — like a natural nail
  ctx.moveTo(cx, NH * 0.02);
  ctx.bezierCurveTo(cx + rx * 0.95, NH * 0.02, cx + rx, NH * 0.28, cx + rx, NH * 0.55);
  ctx.bezierCurveTo(cx + rx, NH * 0.88, cx + rx * 0.6, NH * 0.98, cx, NH * 0.98);
  ctx.bezierCurveTo(cx - rx * 0.6, NH * 0.98, cx - rx, NH * 0.88, cx - rx, NH * 0.55);
  ctx.bezierCurveTo(cx - rx, NH * 0.28, cx - rx * 0.95, NH * 0.02, cx, NH * 0.02);
  ctx.closePath();
}

/** Linear gradient fill helper */
function linGrad(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([pos, color]) => g.addColorStop(pos, color));
  return g;
}

/** Radial gradient helper */
function radGrad(ctx, cx, cy, r0, r1, stops) {
  const g = ctx.createRadialGradient(cx, cy, r0, cx, cy, r1);
  stops.forEach(([pos, color]) => g.addColorStop(pos, color));
  return g;
}

/** Scatter glitter dots */
function addGlitter(ctx, color, count = 220, maxR = 2.2) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = Math.random() * NW;
    const y = Math.random() * NH;
    const r = Math.random() * maxR + 0.3;
    const a = 0.4 + Math.random() * 0.6;
    ctx.globalAlpha = a;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** Draw marble veins */
function addMarbleVeins(ctx, color, count = 6) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.7;
  for (let i = 0; i < count; i++) {
    ctx.globalAlpha = 0.25 + Math.random() * 0.35;
    ctx.beginPath();
    let x = Math.random() * NW, y = 0;
    ctx.moveTo(x, y);
    while (y < NH) {
      const cpX = x + (Math.random() - 0.5) * NW * 0.5;
      const cpY = y + NH * 0.15;
      x += (Math.random() - 0.5) * NW * 0.35;
      y = cpY + NH * 0.08;
      ctx.quadraticCurveTo(cpX, cpY, x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ── 10 Nail Designs ──────────────────────────────────────────────────────────

/** 1. French Classic */
function genFrench() {
  const c = mk(); const ctx = c.getContext('2d');
  nailPath(ctx); ctx.clip();
  // Warm nude base
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, NH, [[0,'#fce9dc'],[0.45,'#f0d0be'],[1,'#d9b49a']]);
  ctx.fillRect(0, 0, NW, NH);
  // White tip arc
  const ty = NH * 0.30;
  ctx.beginPath();
  ctx.moveTo(0, ty + NH * 0.03);
  ctx.quadraticCurveTo(NW/2, ty - NH * 0.042, NW, ty + NH * 0.03);
  ctx.lineTo(NW, 0); ctx.lineTo(0, 0); ctx.closePath();
  ctx.fillStyle = '#fffefa'; ctx.fill();
  // Soft blend at tip line
  ctx.fillStyle = linGrad(ctx, 0, ty - NH*.05, 0, ty + NH*.07,
    [[0,'rgba(255,254,250,0)'],[0.45,'rgba(255,254,250,0.45)'],[1,'rgba(240,208,190,0)']]);
  ctx.fillRect(0, ty - NH*.05, NW, NH * .12);
  return c;
}

/** 2. Hot Pink Gel */
function genHotPink() {
  const c = mk(); const ctx = c.getContext('2d');
  nailPath(ctx); ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, 0, NW*.3, NH,
    [[0,'#FF2D78'],[0.5,'#E91E63'],[1,'#C2185B']]);
  ctx.fillRect(0, 0, NW, NH);
  // Side darkening for depth
  ctx.fillStyle = radGrad(ctx, NW/2, NH*.5, NW*.2, NW*.65,
    [[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,0.18)']]);
  ctx.fillRect(0, 0, NW, NH);
  return c;
}

/** 3. Chrome Silver */
function genChrome() {
  const c = mk(); const ctx = c.getContext('2d');
  nailPath(ctx); ctx.clip();
  // Multi-band chrome gradient (diagonal)
  ctx.fillStyle = linGrad(ctx, 0, 0, NW, NH,
    [[0,'#F8F8F8'],[0.12,'#D0D0D0'],[0.28,'#A8A8A8'],
     [0.50,'#E8E8E8'],[0.72,'#B0B0B0'],[0.88,'#D8D8D8'],[1,'#707070']]);
  ctx.fillRect(0, 0, NW, NH);
  // Reflective stripe
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = linGrad(ctx, NW*.25, 0, NW*.72, NH,
    [[0,'rgba(255,255,255,0)'],[0.5,'rgba(255,255,255,0.62)'],[1,'rgba(255,255,255,0)']]);
  ctx.fillRect(0, 0, NW, NH);
  ctx.globalCompositeOperation = 'source-over';
  return c;
}

/** 4. Midnight Black Matte */
function genMidnightBlack() {
  const c = mk(); const ctx = c.getContext('2d');
  nailPath(ctx); ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, 0, NW*.3, NH,
    [[0,'#1a1a1a'],[0.5,'#111111'],[1,'#060606']]);
  ctx.fillRect(0, 0, NW, NH);
  // Very subtle micro-shimmer
  addGlitter(ctx, 'rgba(255,255,255,0.5)', 60, 1.0);
  return c;
}

/** 5. Rose Ombre */
function genRoseOmbre() {
  const c = mk(); const ctx = c.getContext('2d');
  nailPath(ctx); ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, NH,
    [[0,'#FF2D78'],[0.35,'#FF6EB4'],[0.65,'#FFB3D1'],[1,'#fce9dc']]);
  ctx.fillRect(0, 0, NW, NH);
  return c;
}

/** 6. White Marble */
function genMarble() {
  const c = mk(); const ctx = c.getContext('2d');
  nailPath(ctx); ctx.clip();
  // Off-white base
  ctx.fillStyle = linGrad(ctx, 0, 0, NW*.2, NH,
    [[0,'#FAFAFA'],[0.5,'#F2F2F0'],[1,'#E8E8E5']]);
  ctx.fillRect(0, 0, NW, NH);
  // Gray veins
  addMarbleVeins(ctx, '#9E9E9E', 7);
  // Thin gold accent veins
  ctx.lineWidth = 0.5;
  addMarbleVeins(ctx, '#C9A84C', 3);
  return c;
}

/** 7. Holographic / Rainbow */
function genHolo() {
  const c = mk(); const ctx = c.getContext('2d');
  nailPath(ctx); ctx.clip();
  // Diagonal rainbow
  const g1 = linGrad(ctx, 0, 0, NW, NH,
    [[0,'#FF0080'],[0.17,'#FF6600'],[0.33,'#FFE500'],
     [0.50,'#00DD44'],[0.67,'#0088FF'],[0.83,'#8800FF'],[1,'#FF0080']]);
  ctx.fillStyle = g1; ctx.fillRect(0, 0, NW, NH);
  // Iridescent sheen overlay
  ctx.globalCompositeOperation = 'screen';
  const g2 = linGrad(ctx, NW, 0, 0, NH,
    [[0,'rgba(255,255,255,0.35)'],[0.5,'rgba(255,255,255,0.05)'],[1,'rgba(255,255,255,0.28)']]);
  ctx.fillStyle = g2; ctx.fillRect(0, 0, NW, NH);
  ctx.globalCompositeOperation = 'source-over';
  return c;
}

/** 8. Gold Glitter */
function genGoldGlitter() {
  const c = mk(); const ctx = c.getContext('2d');
  nailPath(ctx); ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, 0, NW*.3, NH,
    [[0,'#C9A84C'],[0.4,'#B8860B'],[0.7,'#DAA520'],[1,'#8B6914']]);
  ctx.fillRect(0, 0, NW, NH);
  addGlitter(ctx, '#FFE87C', 280, 2.5);
  addGlitter(ctx, '#FFFFFF', 80, 1.4);
  return c;
}

/** 9. Sage Mist (Pastel) */
function genSage() {
  const c = mk(); const ctx = c.getContext('2d');
  nailPath(ctx); ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, 0, NW*.2, NH,
    [[0,'#B2DFDB'],[0.5,'#9EC4BE'],[1,'#7FADA7']]);
  ctx.fillRect(0, 0, NW, NH);
  // Subtle watercolor wash
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = radGrad(ctx, NW*.3, NH*.2, 0, NW*.7,
    [[0,'#FFFFFF'],[1,'rgba(255,255,255,0)']]);
  ctx.fillRect(0, 0, NW, NH);
  ctx.globalAlpha = 1;
  return c;
}

/** 10. Coral Blush */
function genCoral() {
  const c = mk(); const ctx = c.getContext('2d');
  nailPath(ctx); ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, 0, NW*.2, NH,
    [[0,'#FF8A65'],[0.4,'#FF6B35'],[0.7,'#E64A19'],[1,'#BF360C']]);
  ctx.fillRect(0, 0, NW, NH);
  // Shimmer
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = linGrad(ctx, 0, 0, NW, 0,
    [[0,'rgba(255,255,255,0.08)'],[0.5,'rgba(255,255,255,0.22)'],[1,'rgba(255,255,255,0.08)']]);
  ctx.fillRect(0, 0, NW, NH);
  ctx.globalCompositeOperation = 'source-over';
  return c;
}

/** 11. Lavender Dream */
function genLavender() {
  const c = mk(); const ctx = c.getContext('2d');
  nailPath(ctx); ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, 0, NW*.2, NH,
    [[0,'#CE93D8'],[0.5,'#AB47BC'],[1,'#7B1FA2']]);
  ctx.fillRect(0, 0, NW, NH);
  addGlitter(ctx, 'rgba(255,255,255,0.7)', 100, 1.5);
  return c;
}

/** 12. Nude Minimalist (clean single stripe) */
function genNude() {
  const c = mk(); const ctx = c.getContext('2d');
  nailPath(ctx); ctx.clip();
  ctx.fillStyle = linGrad(ctx, 0, 0, 0, NH,
    [[0,'#F5D0B5'],[0.5,'#E8BBAA'],[1,'#D4A090']]);
  ctx.fillRect(0, 0, NW, NH);
  // Thin gold stripe
  const sx = NW * 0.50, sy1 = NH * 0.12, sy2 = NH * 0.88;
  ctx.strokeStyle = 'rgba(180,140,80,0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(sx, sy1); ctx.lineTo(sx, sy2); ctx.stroke();
  return c;
}

// ── Design catalogue ─────────────────────────────────────────────────────────

export const NAIL_DESIGNS = [
  { id: 0,  name: 'French Classic', tag: 'timeless',   accent: '#F0D0BE', fn: genFrench },
  { id: 1,  name: 'Hot Pink Gel',   tag: 'trending',   accent: '#FF2D78', fn: genHotPink },
  { id: 2,  name: 'Chrome Silver',  tag: 'futuristic', accent: '#D0D0D0', fn: genChrome },
  { id: 3,  name: 'Midnight Black', tag: 'bold',       accent: '#1a1a1a', fn: genMidnightBlack },
  { id: 4,  name: 'Rose Ombré',     tag: 'romantic',   accent: '#FF6EB4', fn: genRoseOmbre },
  { id: 5,  name: 'White Marble',   tag: 'luxury',     accent: '#F2F2F0', fn: genMarble },
  { id: 6,  name: 'Holographic',    tag: 'iridescent', accent: '#8800FF', fn: genHolo },
  { id: 7,  name: 'Gold Glitter',   tag: 'glamour',    accent: '#DAA520', fn: genGoldGlitter },
  { id: 8,  name: 'Sage Mist',      tag: 'pastel',     accent: '#9EC4BE', fn: genSage },
  { id: 9,  name: 'Coral Reef',     tag: 'vibrant',    accent: '#FF6B35', fn: genCoral },
  { id: 10, name: 'Lavender Dream', tag: 'ethereal',   accent: '#AB47BC', fn: genLavender },
  { id: 11, name: 'Nude Stripe',    tag: 'minimal',    accent: '#E8BBAA', fn: genNude },
];

/**
 * Generate all nail design canvases.
 * Must be called client-side (requires `document`).
 * Returns array of { ...design, canvas: HTMLCanvasElement }
 */
export function initNailDesigns() {
  return NAIL_DESIGNS.map(d => ({ ...d, canvas: d.fn() }));
}
