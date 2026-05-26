/**
 * Nail Geometry Module
 *
 * Computes the 4-corner nail quad for each finger using MediaPipe
 * hand landmarks. Uses the DIP→TIP axis to determine orientation,
 * and estimates width from the axis length.
 *
 * MediaPipe Hand Landmark Indices:
 *   0=WRIST
 *   1=THUMB_CMC, 2=THUMB_MCP, 3=THUMB_IP,  4=THUMB_TIP
 *   5=INDEX_MCP, 6=INDEX_PIP, 7=INDEX_DIP,  8=INDEX_TIP
 *   9=MID_MCP,  10=MID_PIP,  11=MID_DIP,  12=MID_TIP
 *  13=RING_MCP, 14=RING_PIP, 15=RING_DIP, 16=RING_TIP
 *  17=PINK_MCP, 18=PINK_PIP, 19=PINK_DIP, 20=PINK_TIP
 */

// Finger definitions: which landmarks to use for nail estimation
const FINGER_CFG = {
  thumb:  { pip: 2,  dip: 3,  tip: 4,  widthRatio: 1.00, extFwd: 0.20, extBack: 0.08 },
  index:  { pip: 6,  dip: 7,  tip: 8,  widthRatio: 0.90, extFwd: 0.22, extBack: 0.10 },
  middle: { pip: 10, dip: 11, tip: 12, widthRatio: 0.88, extFwd: 0.22, extBack: 0.10 },
  ring:   { pip: 14, dip: 15, tip: 16, widthRatio: 0.85, extFwd: 0.22, extBack: 0.10 },
  pinky:  { pip: 18, dip: 19, tip: 20, widthRatio: 0.82, extFwd: 0.25, extBack: 0.12 },
};

export const FINGERS = ['thumb', 'index', 'middle', 'ring', 'pinky'];

// ── Vector helpers ────────────────────────────────────────────────────────────
const v2    = (x, y)      => ({ x, y });
const add   = (a, b)      => v2(a.x + b.x, a.y + b.y);
const sub   = (a, b)      => v2(a.x - b.x, a.y - b.y);
const scale = (v, s)      => v2(v.x * s, v.y * s);
const len   = (v)         => Math.sqrt(v.x * v.x + v.y * v.y);
const norm  = (v)         => { const l = len(v); return l > 1e-6 ? v2(v.x/l, v.y/l) : v2(0,1); };
const perp  = (v)         => v2(-v.y, v.x); // 90° counter-clockwise
const lerp2 = (a, b, t)   => v2(a.x*(1-t)+b.x*t, a.y*(1-t)+b.y*t);

// Convert normalized MediaPipe landmark to canvas pixel coords
const lmPx = (lm, W, H) => v2(lm.x * W, lm.y * H);

/**
 * Estimate hand scale (palm diagonal) for relative size calculations.
 * Using WRIST → MIDDLE_MCP distance.
 */
export function getHandScale(landmarks, W, H) {
  const wrist = lmPx(landmarks[0], W, H);
  const midMcp = lmPx(landmarks[9], W, H);
  return Math.max(len(sub(midMcp, wrist)), 20);
}

/**
 * Compute the 4-corner nail quad for a given finger.
 *
 * Returns [TL, TR, BR, BL] in canvas coordinates, where:
 *   TL/TR = toward fingertip (free edge of nail)
 *   BR/BL = toward palm (cuticle area)
 *
 * Returns null if the finger is not visible or too small.
 */
export function computeNailQuad(landmarks, fingerName, W, H) {
  const cfg = FINGER_CFG[fingerName];
  if (!cfg) return null;

  const pip = lmPx(landmarks[cfg.pip], W, H);
  const dip = lmPx(landmarks[cfg.dip], W, H);
  const tip = lmPx(landmarks[cfg.tip], W, H);

  // Primary nail axis: DIP → TIP
  const axis    = sub(tip, dip);
  const axisLen = len(axis);
  if (axisLen < 4) return null; // finger not visible / too foreshortened

  const axisN = norm(axis);  // unit vector along nail length
  const perpN = perp(axisN); // unit vector across nail width

  // Nail half-width: proportional to the DIP-TIP segment length
  const halfW = axisLen * cfg.widthRatio * 0.5;

  // Nail tip center: extends slightly BEYOND the fingertip
  const topC = add(tip, scale(axisN,  axisLen * cfg.extFwd));
  // Nail base center: extends slightly BACK past DIP (cuticle area)
  const botC = add(dip, scale(axisN, -axisLen * cfg.extBack));

  return [
    add(topC, scale(perpN, -halfW)), // TL — top-left
    add(topC, scale(perpN,  halfW)), // TR — top-right
    add(botC, scale(perpN,  halfW)), // BR — bottom-right
    add(botC, scale(perpN, -halfW)), // BL — bottom-left
  ];
}

/**
 * Build the rounded nail clip path in ctx.
 * This shapes the overlay as a realistic oval nail.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} quad  [TL, TR, BR, BL]
 * @param {number} rf   rounding factor 0..1 (0.40 gives a natural look)
 */
export function buildNailClipPath(ctx, quad, rf = 0.40) {
  const [tl, tr, br, bl] = quad;

  const topMid   = lerp2(tl, tr, 0.5);
  const botMid   = lerp2(bl, br, 0.5);
  const leftMid  = lerp2(tl, bl, 0.5);
  const rightMid = lerp2(tr, br, 0.5);

  // Helper: point that is rf% of the way from corner to edge midpoint
  const rCorner = (corner, mid) => lerp2(corner, mid, rf);

  ctx.beginPath();

  // Start at TL-adjacent
  const tlStart = rCorner(tl, topMid);
  ctx.moveTo(tlStart.x, tlStart.y);

  // Top edge — rounded at the free edge (nail tip, slightly pointed)
  const trStart = rCorner(tr, topMid);
  ctx.quadraticCurveTo(topMid.x, topMid.y - 3, trStart.x, trStart.y);

  // TR corner → right edge
  ctx.quadraticCurveTo(tr.x, tr.y, rCorner(tr, rightMid).x, rCorner(tr, rightMid).y);

  // Right edge
  ctx.lineTo(rCorner(br, rightMid).x, rCorner(br, rightMid).y);

  // BR corner → bottom edge
  ctx.quadraticCurveTo(br.x, br.y, rCorner(br, botMid).x, rCorner(br, botMid).y);

  // Bottom edge — cuticle, gently curved inward
  ctx.quadraticCurveTo(botMid.x, botMid.y + 4, rCorner(bl, botMid).x, rCorner(bl, botMid).y);

  // BL corner → left edge
  ctx.quadraticCurveTo(bl.x, bl.y, rCorner(bl, leftMid).x, rCorner(bl, leftMid).y);

  // Left edge
  ctx.lineTo(rCorner(tl, leftMid).x, rCorner(tl, leftMid).y);

  // TL corner → back to start
  ctx.quadraticCurveTo(tl.x, tl.y, tlStart.x, tlStart.y);

  ctx.closePath();
}

/**
 * Compute the midpoint and rough radius of a quad (for hit testing / debug).
 */
export function quadCenter(quad) {
  return {
    x: quad.reduce((s, p) => s + p.x, 0) / 4,
    y: quad.reduce((s, p) => s + p.y, 0) / 4,
  };
}
