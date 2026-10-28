// config.js
// Shared constants and tunable values for the gesture-controlled pizzeria.
// Keeping these in one place so gesture/station/game modules agree on names.

// ---------------------------------------------------------------------------
// Stations (order matters: index = progression order)
// ---------------------------------------------------------------------------
export const STATIONS = Object.freeze({
  ORDER: "order",
  TOPPING: "topping",
  BAKE: "bake",
  CUT: "cut",
  SERVE: "serve",
});

// Ordered list used for "previous / next station" navigation.
// AC #4: thumbs right -> next, thumbs left -> previous.
export const STATION_ORDER = Object.freeze([
  STATIONS.ORDER,
  STATIONS.TOPPING,
  STATIONS.BAKE,
  STATIONS.CUT,
  STATIONS.SERVE,
]);

// ---------------------------------------------------------------------------
// Gesture names
// ---------------------------------------------------------------------------
export const GESTURES = Object.freeze({
  NONE: "none",
  PINCH: "pinch",
  THUMBS_UP: "thumbs_up",
  THUMBS_LEFT: "thumbs_left",
  THUMBS_RIGHT: "thumbs_right",
});

// ---------------------------------------------------------------------------
// Tunables
// ---------------------------------------------------------------------------
export const CONFIG = Object.freeze({
  // TODO(AC#4, AC#5): how long thumbs left/right must be held (seconds) before a
  // station switch fires. A quick flick shorter than this must NOT switch (AC#5).
  // Value marked TODO in spec acceptance criteria #4 — pick and tune here.
  STATION_SWITCH_HOLD_SECONDS: 0, // TODO: set the hold duration

  // TODO(AC#1): distance (normalized 0..1) between thumb tip and index tip
  // below which we count a pinch as "closed".
  PINCH_CLOSE_THRESHOLD: 0, // TODO: tune pinch close distance

  // TODO: hysteresis so pinch doesn't flicker — distance to count as released.
  PINCH_OPEN_THRESHOLD: 0, // TODO: tune pinch release distance

  // Camera / canvas dimensions. Hand landmarks are normalized; map to these.
  VIEW_WIDTH: 1280,
  VIEW_HEIGHT: 720,

  // AC rule: the camera image is mirrored, but left/right must be from the
  // PLAYER'S point of view. true = flip handedness/x when interpreting gestures.
  MIRROR_CAMERA: true,
});

// MediaPipe hand landmark indices, for readability in gesture code.
// https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
export const LANDMARK = Object.freeze({
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
});
