// gestures.js
// Interprets raw hand landmarks into the gesture primitives the spec defines:
//   - hand cursor (handled upstream in handTracking.js, consumed here)
//   - pinch (grab / hold-to-drag / release)
//   - thumbs up (built-in MediaPipe gesture)
//   - thumbs left / thumbs right (custom, must be held briefly)
//
// Pure interpretation: no drawing, no station logic. Takes a HandFrame, returns
// a snapshot of the current gesture state. The game loop decides what to do
// with that per the gesture-mapping table.

import { CONFIG, GESTURES, LANDMARK } from "./config.js";

/**
 * @typedef {Object} GestureState
 * @property {string} active            One of GESTURES.* (the dominant gesture).
 * @property {boolean} pinching         True while thumb+index are held together.
 * @property {boolean} pinchStarted     True only on the frame pinch begins (grab).
 * @property {boolean} pinchReleased    True only on the frame pinch ends (drop).
 * @property {{x:number,y:number}|null} pinchPoint  Pinch location in canvas px.
 * @property {boolean} thumbsUp         Built-in thumbs up this frame.
 * @property {boolean} thumbsLeftHeld   Thumbs-left held past the hold threshold.
 * @property {boolean} thumbsRightHeld  Thumbs-right held past the hold threshold.
 */

export class GestureDetector {
  constructor() {
    // Internal state for edge detection + hold timers.
    this._wasPinching = false;
    this._thumbLeftSince = null; // timestamp when thumbs-left started, else null
    this._thumbRightSince = null;
  }

  /**
   * @param {import("./handTracking.js").HandFrame} frame
   * @param {string} [builtInGesture]  Optional label from MediaPipe GestureRecognizer.
   * @returns {GestureState}
   */
  update(frame, builtInGesture) {
    const state = this._empty();
    if (!frame || !frame.landmarks) {
      // No hand: reset hold timers so a reappearing hand doesn't insta-trigger.
      this._thumbLeftSince = null;
      this._thumbRightSince = null;
      this._wasPinching = false;
      return state;
    }

    // --- Pinch (AC#1 depends on this; AC#6,7,8,9,11,12 reuse it) -------------
    // TODO(pinch): compute normalized distance between THUMB_TIP and INDEX_TIP.
    // Use CONFIG.PINCH_CLOSE_THRESHOLD / PINCH_OPEN_THRESHOLD with hysteresis.
    const pinching = this._detectPinch(frame.landmarks); // TODO: implement
    state.pinching = pinching;
    state.pinchStarted = pinching && !this._wasPinching;
    state.pinchReleased = !pinching && this._wasPinching;
    state.pinchPoint = pinching ? frame.cursor : null;
    this._wasPinching = pinching;

    // --- Thumbs up (AC#2 take order, AC#13 serve) ---------------------------
    // TODO(AC#2/#13): prefer MediaPipe's built-in gesture label if provided.
    state.thumbsUp = builtInGesture === "Thumb_Up"; // TODO: confirm label string

    // --- Thumbs left / right with hold (AC#4 switch, AC#5 ignore quick) -----
    const dir = this._detectThumbDirection(frame); // "left" | "right" | null  TODO
    state.thumbsLeftHeld = this._evaluateHold("left", dir, frame.timestamp);
    state.thumbsRightHeld = this._evaluateHold("right", dir, frame.timestamp);

    // Resolve a single dominant gesture for convenience.
    state.active = this._dominant(state);
    return state;
  }

  // ---- helpers -------------------------------------------------------------

  /**
   * TODO(pinch): return true when thumb and index fingertips are close enough.
   * @param {Array<{x:number,y:number}>} _landmarks
   * @returns {boolean}
   */
  _detectPinch(_landmarks) {
    // TODO: const d = dist(landmarks[LANDMARK.THUMB_TIP], landmarks[LANDMARK.INDEX_TIP]);
    //       apply close/open thresholds with hysteresis using this._wasPinching.
    void LANDMARK;
    return false;
  }

  /**
   * Custom thumbs left/right detection (NOT built into MediaPipe).
   * Spec: thumb extended, other fingers curled, thumb tip left/right of wrist.
   * Must honor the player's point of view, not the mirrored camera image.
   * @param {import("./handTracking.js").HandFrame} _frame
   * @returns {"left"|"right"|null}
   */
  _detectThumbDirection(_frame) {
    // TODO(AC#4): verify other four fingers are curled and thumb is extended.
    // TODO(AC#4): compare THUMB_TIP.x to WRIST.x to get a side.
    // TODO(mirror rule): flip the side when CONFIG.MIRROR_CAMERA so "left"/"right"
    //   are from the player's point of view, not the mirror image.
    void CONFIG;
    return null;
  }

  /**
   * Turn a sustained direction into a one-shot "held long enough" signal.
   * AC#4: only fires after CONFIG.STATION_SWITCH_HOLD_SECONDS.
   * AC#5: a quick flick (released before the threshold) must NOT fire.
   * @param {"left"|"right"} side
   * @param {"left"|"right"|null} currentDir
   * @param {number} now  frame timestamp (ms)
   * @returns {boolean}  true exactly once when the hold completes
   */
  _evaluateHold(side, currentDir, now) {
    const key = side === "left" ? "_thumbLeftSince" : "_thumbRightSince";
    if (currentDir !== side) {
      this[key] = null;
      return false;
    }
    if (this[key] == null) {
      this[key] = now;
      return false;
    }
    // TODO(AC#4/#5): when (now - this[key]) >= hold threshold (ms), return true
    // once and reset this[key] to avoid repeat triggers. Threshold is
    // CONFIG.STATION_SWITCH_HOLD_SECONDS * 1000 (currently a TODO value).
    void now;
    return false;
  }

  /** @returns {string} the single most relevant gesture for the game loop. */
  _dominant(state) {
    if (state.thumbsUp) return GESTURES.THUMBS_UP;
    if (state.thumbsLeftHeld) return GESTURES.THUMBS_LEFT;
    if (state.thumbsRightHeld) return GESTURES.THUMBS_RIGHT;
    if (state.pinching) return GESTURES.PINCH;
    return GESTURES.NONE;
  }

  /** @returns {GestureState} */
  _empty() {
    return {
      active: GESTURES.NONE,
      pinching: false,
      pinchStarted: false,
      pinchReleased: false,
      pinchPoint: null,
      thumbsUp: false,
      thumbsLeftHeld: false,
      thumbsRightHeld: false,
    };
  }
}
