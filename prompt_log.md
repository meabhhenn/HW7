to Kiro:
PROMPT 1: Read SPEC.md. Set up the project structure for this game. Use separate files for hand tracking, gesture detection, the stations, and the main game loop. Don’t implement features yet; just the skeleton TPDOwith comments pointing to the acceptance criteria.

PROMPT 2: Implement AC#1 only, then stop so I can test it.

PROMPT 3: Implement acceptance criterion 4 from SPEC.md: holding thumbs right switches to the next station, holding thumbs left switches to the previous one. Direction is from the player's point of view (account for the mirrored camera).

1. In handTracking.js, switch from HandLandmarker to  GestureRecognizer so wealso get built-in gestures (needed later for thumbs up). Keep the cursor behavior from AC#1 exactly as it is.
2. In gestures.js, implement the custom thumbs left/right check: thumb extended, other fingers curled, thumb tip left or right of the wrist. It must be held for the duration in config.js before it counts.
3. In game.js, use it to switch stations, and show the current station name in the HUD.

Only change handTracking.js, gestures.js, game.js, and config.js. Don't implement pinch or any station logic yet. Use descriptive names and comment why each threshold was chosen. Stop when done so I can test.

PROMPT 4: Update README.md for the developer who will take over this project without being able to ask me questions. Include:
- How to install and run it
- Controls
- Each acceptance criterion from SPEC.md marked as working, partial, or not started. Only mark something working if it's actually implemented.
- A code map: what each file is responsible for
- What to do next, in priority order
- Known bugs and traps
- Where corners were cut and why
Also make sure each file has a short header comment explaining its job, and
TODOs point to the acceptance criterion numbers. Don't change any logic.