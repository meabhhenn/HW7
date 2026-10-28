// game.js
// Main entry + game loop. Wires everything together:
//   handTracking (camera + landmarks)  ->  gestures (interpret)  ->
//   stations (apply rules + draw), with a small state machine for which
//   station is active and gesture routing rules from the spec.
//
// This is the only module that imports all the others; the rest stay decoupled.

import { CONFIG, GESTURES, STATIONS, STATION_ORDER } from "./config.js";
import { HandTracker } from "./handTracking.js";
import { GestureDetector } from "./gestures.js";
import { createStations, createEmptyPizza } from "./stations.js";

class Game {
  constructor() {
    this.video = document.getElementById("camera");
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");
    this.statusEl = document.getElementById("status");
    this.stationLabel = document.getElementById("station-label");

    this.tracker = new HandTracker(this.video);
    this.gestures = new GestureDetector();
    this.stations = createStations();

    // --- shared game state --------------------------------------------------
    this.currentStation = STATIONS.ORDER; // start at the Order station
    this.order = null;                     // set when the order is taken (AC#2)
    this.pizza = createEmptyPizza();       // the single in-progress pizza

    this._lastFrameMs = 0;
    this._running = false;
  }

  async start() {
    this.statusEl.textContent = "status: requesting camera…";
    // TODO(AC#1): await this.tracker.init() and handle permission errors here.
    //   On failure, show a helpful message in #status and stop.
    this._enterStation(this.currentStation);
    this._running = true;
    this.statusEl.textContent = "status: running";
    requestAnimationFrame((t) => this._loop(t));
  }

  _loop(nowMs) {
    if (!this._running) return;
    const dt = this._lastFrameMs ? (nowMs - this._lastFrameMs) / 1000 : 0;
    this._lastFrameMs = nowMs;

    // 1) Hand tracking -> frame with landmarks + cursor (AC#1).
    const frame = this.tracker.detect(nowMs);

    // 2) Interpret gestures from the frame.
    // TODO(AC#2/#13): pass the built-in MediaPipe gesture label if available.
    const gesture = this.gestures.update(frame, /* builtInGesture */ undefined);

    // 3) Station switching (AC#4/#5), gated by the hold logic in gestures.js.
    this._handleStationSwitch(gesture);

    // 4) Route gestures to the active station, honoring the thumbs-up rule.
    const station = this.stations[this.currentStation];
    const gameCtx = {
      order: this.order,
      pizza: this.pizza,
      ctx: this.ctx,
      cursor: frame.cursor,
      gesture: this._routeGesture(gesture),
      dt,
    };

    // 5) Update + render.
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    station.update(gameCtx);
    station.render(gameCtx);
    this._renderCursor(frame.cursor); // AC#1: always show where the hand is.

    requestAnimationFrame((t) => this._loop(t));
  }

  /**
   * AC#3: thumbs up only counts at Order and Serve. Strip it everywhere else so
   * stations never see a thumbs-up they should ignore.
   */
  _routeGesture(gesture) {
    const thumbsUpAllowed =
      this.currentStation === STATIONS.ORDER ||
      this.currentStation === STATIONS.SERVE;
    if (!thumbsUpAllowed && gesture.thumbsUp) {
      return { ...gesture, thumbsUp: false, active: GESTURES.NONE };
    }
    return gesture;
  }

  /**
   * AC#4: held thumbs right -> next station, thumbs left -> previous.
   * AC#5: quick flicks don't fire (the gesture layer only reports *held*).
   * Direction is already corrected to the player's POV in gestures.js.
   */
  _handleStationSwitch(gesture) {
    if (gesture.thumbsRightHeld) this._goToStation(+1);
    else if (gesture.thumbsLeftHeld) this._goToStation(-1);
  }

  _goToStation(delta) {
    const i = STATION_ORDER.indexOf(this.currentStation);
    const next = i + delta;
    if (next < 0 || next >= STATION_ORDER.length) return; // clamp at the ends
    const target = STATION_ORDER[next];
    this.stations[this.currentStation].onExit(this._bareCtx());
    this.currentStation = target;
    this._enterStation(target);
  }

  _enterStation(id) {
    this.stationLabel.textContent = `station: ${id}`;
    this.stations[id].onEnter(this._bareCtx());
  }

  /** Minimal context for enter/exit hooks (no per-frame gesture/cursor). */
  _bareCtx() {
    return {
      order: this.order,
      pizza: this.pizza,
      ctx: this.ctx,
      cursor: null,
      gesture: this.gestures._empty(),
      dt: 0,
    };
  }

  _renderCursor(cursor) {
    if (!cursor) return;
    // TODO(AC#1): draw a nicer cursor; placeholder dot for now.
    const { ctx } = this;
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(224,164,88,0.9)";
    ctx.fill();
  }
}

// Boot once the DOM is ready. A real start may be gated behind a "click to
// allow camera" button; wiring that UI is a TODO.
window.addEventListener("DOMContentLoaded", () => {
  const game = new Game();
  // TODO(AC#1): start on an explicit user gesture (button) so the browser
  // reliably grants camera + autoplay permissions.
  game.start().catch((err) => {
    const statusEl = document.getElementById("status");
    if (statusEl) statusEl.textContent = `status: error — ${err.message}`;
    // eslint-disable-next-line no-console
    console.error(err);
  });
  void CONFIG;
});
