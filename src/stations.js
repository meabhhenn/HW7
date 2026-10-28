// stations.js
// The five stations and their per-station logic. Each station:
//   - reacts to gesture state (from gestures.js) + the cursor,
//   - mutates the shared order/pizza state,
//   - draws itself onto the canvas.
//
// Stations do NOT talk to the camera or MediaPipe directly. The game loop feeds
// them a cursor + GestureState each frame and calls update()/render().
//
// Common base class defines the interface; one subclass per station maps 1:1
// to the spec's gesture-mapping table and acceptance criteria.

import { STATIONS } from "./config.js";

/**
 * @typedef {Object} Order
 * @property {Array<{type:string, x:number, y:number}>} requestedToppings
 * @property {number} bakeSeconds   Target bake time from the ticket.
 * @property {number} slices        Requested number of slices.
 */

/**
 * @typedef {Object} Pizza  Mutable in-progress pizza shared across stations.
 * @property {Array<{x:number,y:number}>} sauce       Sauce stroke points.
 * @property {boolean} cheese                          Whether cheese is added.
 * @property {Array<{type:string,x:number,y:number}>} toppings  Placed toppings.
 * @property {number} bakeElapsed                      Seconds in the oven.
 * @property {boolean} inOven
 * @property {boolean} removedFromOven
 * @property {Array<{x1:number,y1:number,x2:number,y2:number}>} cuts  Cut lines.
 */

/**
 * @typedef {Object} GameContext  Shared state passed to every station.
 * @property {Order|null} order
 * @property {Pizza} pizza
 * @property {CanvasRenderingContext2D} ctx
 * @property {{x:number,y:number}|null} cursor
 * @property {import("./gestures.js").GestureState} gesture
 * @property {number} dt  Seconds since last frame.
 */

// ---------------------------------------------------------------------------
// Base station
// ---------------------------------------------------------------------------
export class Station {
  /** @param {string} id One of STATIONS.* */
  constructor(id) {
    this.id = id;
  }

  /** Called once when the player arrives at this station. */
  onEnter(/* ctx: GameContext */) {}

  /** Called once when leaving this station. */
  onExit(/* ctx: GameContext */) {}

  /** Per-frame logic: read ctx.gesture + ctx.cursor, mutate ctx.pizza/order. */
  update(/* ctx: GameContext */) {}

  /** Per-frame draw onto ctx.ctx. */
  render(/* ctx: GameContext */) {}
}

// ---------------------------------------------------------------------------
// 1. Order station
// ---------------------------------------------------------------------------
export class OrderStation extends Station {
  constructor() {
    super(STATIONS.ORDER);
  }

  update(ctx) {
    // TODO(AC#2): on thumbs up, take the customer's order -> build ctx.order
    //   (toppings, bake time, slices) and reveal the ticket (#ticket panel).
    // TODO(AC#3): thumbs up ONLY counts here and at Serve — enforced by the game
    //   loop routing, but keep this handler scoped to the Order station.
    void ctx;
  }

  render(ctx) {
    // TODO(AC#2): draw the customer + the generated ticket.
    void ctx;
  }
}

// ---------------------------------------------------------------------------
// 2. Topping station
// ---------------------------------------------------------------------------
export class ToppingStation extends Station {
  constructor() {
    super(STATIONS.TOPPING);
    this._carrying = null; // what the pinch is currently holding (cheese/topping)
  }

  update(ctx) {
    // TODO(AC#6): while pinching, add sauce along the cursor path across dough.
    // TODO(AC#7): pinch over cheese bin -> release over pizza -> set cheese.
    // TODO(AC#8): pinch over a topping bin picks it up; release over pizza
    //   places it at the cursor position (CORE interaction).
    // TODO(AC#9): pinch a placed topping, release over the trash -> remove it.
    // Use ctx.gesture.pinchStarted / pinchReleased / pinchPoint + hit tests
    //   against bin / pizza / trash regions.
    void ctx;
  }

  render(ctx) {
    // TODO: draw dough, sauce, cheese, placed toppings, bins, trash, carried item.
    void ctx;
  }
}

// ---------------------------------------------------------------------------
// 3. Bake station
// ---------------------------------------------------------------------------
export class BakeStation extends Station {
  constructor() {
    super(STATIONS.BAKE);
  }

  onEnter(ctx) {
    // TODO(AC#10): arriving here puts the pizza in the oven automatically.
    void ctx;
  }

  update(ctx) {
    // TODO(AC#10): advance ctx.pizza.bakeElapsed by ctx.dt while in the oven.
    // TODO(AC#11): pinch the glove, drag to the pizza, release -> take it out.
    //   Track bakeElapsed vs order.bakeSeconds for the rating later (AC#13).
    void ctx;
  }

  render(ctx) {
    // TODO: draw oven, glove, bake timer/visual doneness.
    void ctx;
  }
}

// ---------------------------------------------------------------------------
// 4. Cut station
// ---------------------------------------------------------------------------
export class CutStation extends Station {
  constructor() {
    super(STATIONS.CUT);
    this._dragStart = null; // pinch-down point for the current cut
  }

  update(ctx) {
    // TODO(AC#12): pinch the slicer, drag across the pizza -> one cut per drag.
    //   Record a line from pinchStarted point to pinchReleased point in
    //   ctx.pizza.cuts. Compare count to order.slices for the rating (AC#13).
    void ctx;
  }

  render(ctx) {
    // TODO: draw the slicer, the pizza, and existing cut lines.
    void ctx;
  }
}

// ---------------------------------------------------------------------------
// 5. Serve station
// ---------------------------------------------------------------------------
export class ServeStation extends Station {
  constructor() {
    super(STATIONS.SERVE);
  }

  update(ctx) {
    // TODO(AC#13): on thumbs up, serve the pizza and compute the customer
    //   rating by comparing the finished pizza to ctx.order (toppings placed,
    //   bake time accuracy, slice count) — the "zen, accurate" evaluation.
    // TODO(AC#3): thumbs up only counts here and at Order.
    void ctx;
  }

  render(ctx) {
    // TODO(AC#13): draw the customer + show the rating (#rating panel).
    void ctx;
  }
}

// ---------------------------------------------------------------------------
// Factory: build the station instances keyed by id for the game loop.
// ---------------------------------------------------------------------------
export function createStations() {
  return {
    [STATIONS.ORDER]: new OrderStation(),
    [STATIONS.TOPPING]: new ToppingStation(),
    [STATIONS.BAKE]: new BakeStation(),
    [STATIONS.CUT]: new CutStation(),
    [STATIONS.SERVE]: new ServeStation(),
  };
}

/** @returns {Pizza} a fresh, empty pizza for a new order. */
export function createEmptyPizza() {
  return {
    sauce: [],
    cheese: false,
    toppings: [],
    bakeElapsed: 0,
    inOven: false,
    removedFromOven: false,
    cuts: [],
  };
}
