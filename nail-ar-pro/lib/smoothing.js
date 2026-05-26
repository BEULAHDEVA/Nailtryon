/**
 * One-Euro Filter — adaptive low-pass filter for real-time tracking.
 *
 * Properties:
 *  - Low velocity → strong smoothing (eliminates micro-jitter)
 *  - High velocity → weak smoothing (no lag during fast movement)
 *
 * Reference: Géry Casiez et al., "1€ Filter: A Simple Speed-based Low-pass Filter
 * for Noisy Input in Interactive Systems", CHI 2012.
 */

class OneEuroFilter1D {
  constructor(minCutoff = 4.0, beta = 50.0, dCutoff = 1.0) {
    this.minCutoff = minCutoff; // min smoothing cutoff Hz (higher = less smooth)
    this.beta      = beta;      // speed coefficient (higher = faster response)
    this.dCutoff   = dCutoff;  // derivative cutoff Hz
    this._x        = null;
    this._dx       = 0;
    this._lastT    = null;
  }

  _alpha(cutoff, dt) {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }

  filter(x, timestamp = performance.now()) {
    if (this._x === null) {
      this._x = x;
      this._lastT = timestamp;
      return x;
    }
    const dt = Math.max((timestamp - this._lastT) / 1000.0, 1e-5);
    this._lastT = timestamp;

    // Smooth the derivative
    const dxRaw = (x - this._x) / dt;
    const dAlpha = this._alpha(this.dCutoff, dt);
    this._dx = dAlpha * dxRaw + (1 - dAlpha) * this._dx;

    // Adapt cutoff to speed
    const cutoff = this.minCutoff + this.beta * Math.abs(this._dx);
    const a = this._alpha(cutoff, dt);

    this._x = a * x + (1 - a) * this._x;
    return this._x;
  }

  reset() {
    this._x = null;
    this._dx = 0;
    this._lastT = null;
  }
}

/**
 * Smoother for all 21 MediaPipe hand landmarks (x, y, z per landmark).
 */
export class LandmarkSmoother {
  constructor(numLandmarks = 21, minCutoff = 4.0, beta = 50.0) {
    this._filters = Array.from({ length: numLandmarks }, () => ({
      x: new OneEuroFilter1D(minCutoff, beta),
      y: new OneEuroFilter1D(minCutoff, beta),
      z: new OneEuroFilter1D(minCutoff, beta),
    }));
  }

  /**
   * Smooth an array of {x, y, z, visibility} landmark objects.
   * Returns a new array with smoothed coordinates.
   */
  smooth(landmarks, timestamp = performance.now()) {
    return landmarks.map((lm, i) => ({
      x: this._filters[i].x.filter(lm.x, timestamp),
      y: this._filters[i].y.filter(lm.y, timestamp),
      z: this._filters[i].z.filter(lm.z ?? 0, timestamp),
      visibility: lm.visibility ?? 1,
    }));
  }

  reset() {
    this._filters.forEach(f => { f.x.reset(); f.y.reset(); f.z.reset(); });
  }
}

/**
 * Simple linear interpolation between two landmark arrays.
 * Used as a fallback when landmarks jump unexpectedly.
 */
export function lerpLandmarks(a, b, t) {
  return a.map((lm, i) => ({
    x: lm.x + (b[i].x - lm.x) * t,
    y: lm.y + (b[i].y - lm.y) * t,
    z: (lm.z ?? 0) + ((b[i].z ?? 0) - (lm.z ?? 0)) * t,
    visibility: lm.visibility ?? 1,
  }));
}
