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
// Tiny drawing helpers (placeholder art only -- basic shapes + text labels).
// Shared by the render() methods below. No images, no animation.
// ---------------------------------------------------------------------------
function labelBox(ctx, x, y, w, h, fill, label) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  caption(ctx, label, x + w / 2, y + h / 2);
}

function caption(ctx, text, cx, cy) {
  ctx.fillStyle = "#1b1f24";
  ctx.font = "16px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, cy);
}

function title(ctx, text) {
  ctx.fillStyle = "rgba(232,238,242,0.9)";
  ctx.font = "20px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(text, 24, 20);
}

function circle(ctx, cx, cy, r, fill, stroke) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// A simple stick-ish customer: head circle + rounded body rectangle.
function customer(ctx, cx, topY, label) {
  circle(ctx, cx, topY + 28, 28, "#f2c89a", "rgba(0,0,0,0.3)"); // head
  ctx.fillStyle = "#6aa6c8";
  ctx.fillRect(cx - 32, topY + 56, 64, 90); // body
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 32, topY + 56, 64, 90);
  if (label) caption(ctx, label, cx, topY + 164);
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
    // PLACEHOLDER GRAPHICS ONLY -- shows intended layout, no interaction/logic.
    const g = ctx.ctx;
    title(g, "Order station — thumbs up to take the order (AC#2)");

    // Customer on the left.
    customer(g, 260, 180, "customer");

    // Order ticket area on the right.
    const tx = 620;
    const ty = 160;
    labelBox(g, tx, ty, 420, 360, "#fdf6e3", "");
    g.fillStyle = "#1b1f24";
    g.font = "18px system-ui, sans-serif";
    g.textAlign = "left";
    g.textBaseline = "top";
    g.fillText("ORDER TICKET", tx + 20, ty + 20);
    g.font = "15px system-ui, sans-serif";
    g.fillText("• toppings: —", tx + 20, ty + 70);
    g.fillText("• bake time: —", tx + 20, ty + 110);
    g.fillText("• slices: —", tx + 20, ty + 150);
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
    // PLACEHOLDER GRAPHICS ONLY -- shows intended layout, no interaction/logic.
    const g = ctx.ctx;
    title(g, "Topping station — pinch & drag / drop (AC#6-9)");

    // Dough circle in the center.
    circle(g, 640, 380, 170, "#e8c98a", "#b48a4a");
    caption(g, "dough", 640, 380);

    // Labeled bins along the top: sauce, cheese, and a couple of toppings.
    labelBox(g, 120, 120, 120, 90, "#c0392b", "sauce");
    labelBox(g, 300, 120, 120, 90, "#f4d35e", "cheese");
    labelBox(g, 860, 120, 120, 90, "#b03a2e", "pepperoni");
    labelBox(g, 1040, 120, 120, 90, "#2e7d32", "pepper");

    // Trash can in a bottom corner.
    labelBox(g, 1080, 560, 110, 120, "#555b61", "trash");
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
    // TODO(AC#11): pinch the glove, drag it to the pizza, release -> take it out.
    //   Track bakeElapsed vs order.bakeSeconds for the rating later (AC#13).
    void ctx;
  }

  render(ctx) {
    // PLACEHOLDER GRAPHICS ONLY -- shows intended layout, no interaction/logic.
    const g = ctx.ctx;
    title(g, "Bake station — pizza bakes automatically; glove to remove (AC#10-11)");

    // Oven: outer body with a darker opening.
    labelBox(g, 420, 200, 440, 360, "#7f8c8d", "");
    g.fillStyle = "#2c2f33";
    g.fillRect(460, 260, 360, 240); // oven opening
    caption(g, "oven", 640, 230);
    caption(g, "(pizza inside)", 640, 380);

    // Oven glove off to the side.
    labelBox(g, 980, 300, 120, 140, "#d35400", "glove");
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
    // PLACEHOLDER GRAPHICS ONLY -- shows intended layout, no interaction/logic.
    const g = ctx.ctx;
    title(g, "Cut station — pinch the slicer, drag across the pizza (AC#12)");

    // The baked pizza in the center.
    circle(g, 620, 380, 180, "#e0a458", "#9c6b2a");
    circle(g, 620, 380, 180, null, "#c0392b"); // crust ring hint
    caption(g, "pizza", 620, 380);

    // The slicer (wheel + handle) parked to the side.
    labelBox(g, 1000, 300, 150, 60, "#bdc3c7", "slicer");
    circle(g, 1000, 330, 26, "#7f8c8d", "#2c3e50"); // cutter wheel
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
    // PLACEHOLDER GRAPHICS ONLY -- shows intended layout, no interaction/logic.
    const g = ctx.ctx;
    title(g, "Serve station — thumbs up to serve; customer rates it (AC#13)");

    // Customer on the left.
    customer(g, 260, 180, "customer");

    // Rating area on the right: a row of placeholder star outlines.
    const rx = 620;
    const ry = 200;
    labelBox(g, rx, ry, 420, 200, "#fdf6e3", "");
    g.fillStyle = "#1b1f24";
    g.font = "18px system-ui, sans-serif";
    g.textAlign = "left";
    g.textBaseline = "top";
    g.fillText("RATING", rx + 20, ry + 20);
    for (let i = 0; i < 5; i++) {
      circle(g, rx + 60 + i * 72, ry + 120, 24, "#eee", "#caa24a");
      caption(g, "★", rx + 60 + i * 72, ry + 120);
    }
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
