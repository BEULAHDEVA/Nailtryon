/**
 * Nail Renderer — perspective-correct overlay pipeline
 *
 * Core technique: Quad-to-Quad mapping via 2-triangle affine warping.
 *
 * Why 2 triangles?
 *   Canvas 2D has no native perspective transform. A quad can be
 *   decomposed into 2 triangles. Each triangle maps perfectly via an
 *   affine (6-DOF) transform, giving correct perspective illusion.
 *
 * Pipeline per nail:
 *   1. Build rounded nail clip path  → realistic nail silhouette
 *   2. Warp nail image via 2 triangles → perspective-correct texture
 *   3. Draw gloss highlight           → specular realism
 *   4. Optional edge feather          → blends with skin
 */

import { buildNailClipPath } from './nailGeometry';

// ── Affine warp helpers ───────────────────────────────────────────────────────

/**
 * Compute the 6 canvas transform coefficients that map triangle
 * (s0, s1, s2) in image space → (d0, d1, d2) in canvas space.
 *
 * Canvas transform(a,b,c,d,e,f) computes:
 *   x' = a*x + c*y + e
 *   y' = b*x + d*y + f
 *
 * We solve: M * [sx sy 1]ᵀ = [dx dy]ᵀ for all 3 point pairs.
 */
function computeAffine(s0, s1, s2, d0, d1, d2) {
  const denom =
    (s1.x - s2.x) * (s0.y - s2.y) -
    (s0.x - s2.x) * (s1.y - s2.y);

  if (Math.abs(denom) < 1e-8) return null;

  // Row 0 (maps to x')
  const m00 = ((d1.x - d2.x) * (s0.y - s2.y) - (d0.x - d2.x) * (s1.y - s2.y)) / denom;
  const m01 = ((d0.x - d2.x) * (s1.x - s2.x) - (d1.x - d2.x) * (s0.x - s2.x)) / denom;
  const m02 = d0.x - m00 * s0.x - m01 * s0.y;

  // Row 1 (maps to y')
  const m10 = ((d1.y - d2.y) * (s0.y - s2.y) - (d0.y - d2.y) * (s1.y - s2.y)) / denom;
  const m11 = ((d0.y - d2.y) * (s1.x - s2.x) - (d1.y - d2.y) * (s0.x - s2.x)) / denom;
  const m12 = d0.y - m10 * s0.x - m11 * s0.y;

  // Returns [a, b, c, d, e, f] for ctx.transform(a,b,c,d,e,f)
  return [m00, m10, m01, m11, m02, m12];
}

/**
 * Draw the portion of `image` inside the triangle (d0, d1, d2) using
 * the affine transform that maps (s0,s1,s2) → (d0,d1,d2).
 */
function drawWarpedTriangle(ctx, image, srcW, srcH, s0, s1, s2, d0, d1, d2) {
  const affine = computeAffine(s0, s1, s2, d0, d1, d2);
  if (!affine) return;

  ctx.save();
  // Clip to destination triangle
  ctx.beginPath();
  ctx.moveTo(d0.x, d0.y);
  ctx.lineTo(d1.x, d1.y);
  ctx.lineTo(d2.x, d2.y);
  ctx.closePath();
  ctx.clip();

  // Apply affine transform and draw
  ctx.transform(...affine);
  ctx.drawImage(image, 0, 0, srcW, srcH);
  ctx.restore();
}

/**
 * Draw nail image perspective-warped onto the given quad.
 *
 * The quad is split diagonally into 2 triangles:
 *   Triangle A: TL, TR, BL
 *   Triangle B: TR, BR, BL
 *
 * Each triangle is independently affine-transformed, approximating
 * a full perspective warp with very low error for typical nail angles.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement|HTMLImageElement} image  The nail art image
 * @param {Array} quad  [TL, TR, BR, BL] in canvas pixels
 * @param {number} opacity  0..1
 */
export function renderNailOnQuad(ctx, image, quad, opacity = 0.92) {
  if (!image || !quad) return;

  const W = image.width || image.naturalWidth;
  const H = image.height || image.naturalHeight;
  if (!W || !H) return;

  const [TL, TR, BR, BL] = quad;

  // Source corners of the nail design image
  const sTL = { x: 0, y: 0 };
  const sTR = { x: W, y: 0 };
  const sBR = { x: W, y: H };
  const sBL = { x: 0, y: H };

  ctx.save();
  ctx.globalAlpha = opacity;

  // ── Step 1: clip to rounded nail outline ──
  buildNailClipPath(ctx, quad, 0.40);
  ctx.clip();

  // ── Step 2: warp nail image via 2 triangles ──
  // Triangle A: image TL→TR→BL mapped to canvas TL→TR→BL
  drawWarpedTriangle(ctx, image, W, H, sTL, sTR, sBL, TL, TR, BL);
  // Triangle B: image TR→BR→BL mapped to canvas TR→BR→BL
  drawWarpedTriangle(ctx, image, W, H, sTR, sBR, sBL, TR, BR, BL);

  ctx.restore();

  // ── Step 3: specular gloss overlay ──
  drawGloss(ctx, quad, opacity);
}

/**
 * Draw a realistic gloss / specular highlight over the nail.
 *
 * Uses two layers:
 *   1. Linear gradient from tip → 30% down (main shine)
 *   2. Small radial gradient near top-right (specular hotspot)
 *
 * Both drawn with 'screen' composite → white only lightens.
 */
function drawGloss(ctx, quad, baseOpacity = 0.92) {
  const [TL, TR, BR, BL] = quad;
  const topMid = { x: (TL.x + TR.x) / 2, y: (TL.y + TR.y) / 2 };
  const botMid = { x: (BL.x + BR.x) / 2, y: (BL.y + BR.y) / 2 };

  // Gloss endpoint: 32% of the way from tip to base
  const glossEnd = {
    x: topMid.x + (botMid.x - topMid.x) * 0.32,
    y: topMid.y + (botMid.y - topMid.y) * 0.32,
  };

  ctx.save();

  // Clip to nail outline
  buildNailClipPath(ctx, quad, 0.40);
  ctx.clip();

  ctx.globalCompositeOperation = 'screen';

  // Main gloss band
  const glossGrad = ctx.createLinearGradient(topMid.x, topMid.y, glossEnd.x, glossEnd.y);
  const gi = baseOpacity * 0.55;
  glossGrad.addColorStop(0.00, `rgba(255,255,255,${gi.toFixed(2)})`);
  glossGrad.addColorStop(0.45, `rgba(255,255,255,${(gi * 0.20).toFixed(2)})`);
  glossGrad.addColorStop(1.00, 'rgba(255,255,255,0)');

  // Fill entire clip area with the gradient
  const [minX, maxX] = [Math.min(TL.x, TR.x, BR.x, BL.x), Math.max(TL.x, TR.x, BR.x, BL.x)];
  const [minY, maxY] = [Math.min(TL.y, TR.y, BR.y, BL.y), Math.max(TL.y, TR.y, BR.y, BL.y)];
  ctx.fillStyle = glossGrad;
  ctx.fillRect(minX - 2, minY - 2, maxX - minX + 4, maxY - minY + 4);

  // Specular hotspot — small bright spot near top-right quadrant
  const hlX = TL.x + (TR.x - TL.x) * 0.68;
  const hlY = topMid.y + (botMid.y - topMid.y) * 0.07;
  const nailW = Math.hypot(TR.x - TL.x, TR.y - TL.y);
  const hlR = Math.max(3, nailW * 0.14);

  const specGrad = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, hlR * 2.8);
  const si = baseOpacity * 0.42;
  specGrad.addColorStop(0.0, `rgba(255,255,255,${si.toFixed(2)})`);
  specGrad.addColorStop(0.5, `rgba(255,255,255,${(si * 0.18).toFixed(2)})`);
  specGrad.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(hlX, hlY, hlR * 2.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Render all 5 nails on a detected hand.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} landmarks  21 smoothed MediaPipe landmarks
 * @param {HTMLCanvasElement} nailImage  The selected nail design
 * @param {string[]} fingers  Which fingers to render
 * @param {number} opacity  0..1
 * @param {number} W  Canvas width
 * @param {number} H  Canvas height
 * @param {Function} computeNailQuad  From nailGeometry.js
 */
export function renderHand(ctx, landmarks, nailImage, fingers, opacity, W, H, computeNailQuad) {
  for (const finger of fingers) {
    const quad = computeNailQuad(landmarks, finger, W, H);
    if (quad) {
      renderNailOnQuad(ctx, nailImage, quad, opacity);
    }
  }
}
