# Gesture-Controlled Papa's Pizzeria

A single-player, camera-controlled pizza game. You make one pizza at a time,
moving through five stations using hand gestures tracked by MediaPipe. See
[`spec.md`](./spec.md) for the full design and acceptance criteria.

> Status: **skeleton only.** The structure and interfaces are in place; feature
> logic is stubbed with `TODO` comments that point back to the acceptance
> criteria (AC#n) in `spec.md`.

## Project structure

```
HW7/
├── index.html          Entry point: camera <video>, game <canvas>, HUD panels
├── styles.css          Layout for the feed, canvas, and HUD
├── src/
│   ├── config.js       Shared constants: stations, gestures, tunables, landmarks
│   ├── handTracking.js Camera + MediaPipe landmarks -> screen-space cursor (AC#1)
│   ├── gestures.js     Landmarks -> pinch / thumbs up / thumbs left-right (AC#4,5)
│   ├── stations.js     The five stations + per-station rules and drawing
│   └── game.js         Main loop + state machine, wires the modules together
└── spec.md             Design + acceptance criteria
```

### Why these boundaries

- **handTracking.js** only knows about the camera and MediaPipe. It produces a
  `HandFrame` (landmarks + cursor) and nothing else.
- **gestures.js** only interprets a `HandFrame` into a `GestureState`. No
  drawing, no game rules.
- **stations.js** holds all game rules and rendering, split one class per
  station. Stations receive a `GameContext` (cursor + gesture + shared pizza/
  order state) and never touch the camera.
- **game.js** is the only module that imports the others. It owns the loop, the
  active-station state machine, and the gesture-routing rules (e.g. AC#3:
  thumbs up only counts at Order and Serve).

## Acceptance criteria map

| AC  | Where it lives |
| --- | -------------- |
| #1 hand cursor | `handTracking.js` (`_toScreen`, cursor), `game.js` (`_renderCursor`) |
| #2 take order / ticket | `stations.js` `OrderStation`, `index.html` `#ticket` |
| #3 thumbs up gated | `game.js` `_routeGesture` |
| #4 switch stations (held) | `gestures.js` `_evaluateHold`, `game.js` `_handleStationSwitch` |
| #5 quick flick ignored | `gestures.js` `_evaluateHold` |
| #6 sauce drag | `stations.js` `ToppingStation` |
| #7 cheese | `stations.js` `ToppingStation` |
| #8 place topping (core) | `stations.js` `ToppingStation` |
| #9 trash topping | `stations.js` `ToppingStation` |
| #10 auto bake | `stations.js` `BakeStation.onEnter` |
| #11 take out of oven | `stations.js` `BakeStation` |
| #12 cut slices | `stations.js` `CutStation` |
| #13 serve + rating | `stations.js` `ServeStation`, `index.html` `#rating` |

## Running

The app uses ES modules and loads MediaPipe from a CDN, so it must be served
over HTTP (not opened as a `file://` URL) and needs camera permission.

```bash
# from the HW7 directory, any static server works, e.g.:
python3 -m http.server 8000
# then open http://localhost:8000
```

Camera access requires a secure context (`localhost` counts, or HTTPS).

## Next steps

Implement the `TODO`s in priority order from `spec.md`:

1. **MUST** — AC#1 (cursor), AC#4 (station switching), AC#8 (place toppings).
2. **SHOULD** — AC#2 (ticket), AC#13 (serve + rating), AC#10/#11 (bake),
   AC#12 (cut), AC#7 (cheese).
3. **Later** — AC#6 (sauce), AC#9 (trash), AC#5 (quick-gesture guard),
   AC#3 (thumbs up blocked elsewhere).

Start by filling in the tunables in `config.js` (pinch thresholds, the AC#4
hold duration) — several stubs depend on them.
