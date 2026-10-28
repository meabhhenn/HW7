// handTracking.js
// Wraps MediaPipe hand tracking. Responsible ONLY for:
//   - getting the camera stream,
//   - running the hand landmarker each frame,
//   - exposing raw landmarks + a screen-space cursor (index fingertip).
//
// It does NOT interpret gestures (that's gestures.js) and does NOT know about
// stations or game rules (that's stations.js / game.js).

import { CONFIG, LANDMARK } from "./config.js";

// TODO(AC#1): import MediaPipe Tasks Vision. Example (pin a version):
//   import { HandLandmarker, FilesetResolver }
//     from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/vision_bundle.mjs";
// The spec also wants the built-in "thumbs up" gesture (AC#2/#13), which can
// come from GestureRecognizer. Decide whether to run HandLandmarker +
// custom gesture logic, or GestureRecognizer, or both.

/**
 * @typedef {Object} HandFrame
 * @property {Array<{x:number,y:number,z:number}>|null} landmarks
 *   21 normalized landmarks (0..1) for the primary hand, or null if no hand.
 * @property {"Left"|"Right"|null} handedness  Raw MediaPipe handedness label.
 * @property {{x:number,y:number}|null} cursor  Index fingertip in canvas pixels.
 * @property {number} timestamp  performance.now() when the frame was produced.
 */

export class HandTracker {
  constructor(videoEl, { width = CONFIG.VIEW_WIDTH, height = CONFIG.VIEW_HEIGHT } = {}) {
    this.video = videoEl;
    this.width = width;
    this.height = height;

    /** @type {HandFrame} */
    this.latest = { landmarks: null, handedness: null, cursor: null, timestamp: 0 };

    this._landmarker = null; // TODO(AC#1): MediaPipe HandLandmarker instance.
    this._running = false;
  }

  /**
   * Request camera access and load the MediaPipe model.
   * @returns {Promise<void>}
   */
  async init() {
    // TODO(AC#1): getUserMedia for the camera and attach to this.video.
    //   const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    //   this.video.srcObject = stream; await this.video.play();
    // TODO(AC#1): create FilesetResolver + HandLandmarker in VIDEO running mode.
    //   Set numHands to 1 (one order at a time; multi-hand is a stretch goal).
    throw new Error("HandTracker.init not implemented"); // TODO
  }

  /**
   * Run detection for the current video frame and update this.latest.
   * Called once per animation frame by the game loop.
   * @param {number} nowMs  performance.now() timestamp for this frame.
   * @returns {HandFrame}
   */
  detect(nowMs) {
    // TODO(AC#1): call this._landmarker.detectForVideo(this.video, nowMs).
    // TODO(AC#1): pick the primary hand, store normalized landmarks.
    // TODO(AC#1): project index fingertip (LANDMARK.INDEX_TIP) to canvas pixels
    //   via this._toScreen(...) and store as cursor so the on-screen cursor
    //   follows the player's hand.
    void nowMs;
    void LANDMARK;
    return this.latest;
  }

  /**
   * Convert a normalized landmark (0..1) into canvas pixel coordinates.
   * Handles the mirrored camera so the cursor matches the player's hand.
   * @param {{x:number,y:number}} pt
   * @returns {{x:number,y:number}}
   */
  _toScreen(pt) {
    // TODO(AC#1, mirror rule): if CONFIG.MIRROR_CAMERA, flip x so the cursor
    // tracks the player's real hand, not the mirrored image.
    const x = CONFIG.MIRROR_CAMERA ? 1 - pt.x : pt.x;
    return { x: x * this.width, y: pt.y * this.height };
  }

  /** Stop the camera stream and free the model. */
  dispose() {
    // TODO: stop MediaStream tracks and close the landmarker.
    this._running = false;
  }
}
