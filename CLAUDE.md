# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Browser-based retro arcade game collection ("Where names become games!") at chirs.game. Three playable games: Touch, Asteroids, and Pong. Pure static site — no build tools, no package manager, no transpilation.

## Running Locally

Serve `src/` with any HTTP server:
```bash
python -m http.server 8000 --directory src
```
Then open http://localhost:8000. There are no tests or linting tools.

## Architecture

**Game engine**: Coquette.js (bundled as `coquette-min.js`) — provides game loop (`requestAnimationFrame`), entity management, AABB/circle collision detection, keyboard input tracking, and Canvas 2D rendering.

**Script load order** (matters — no module system):
`func.js` → `objects.js` → `player.js` → `adversary.js` → `game.js`

### Key files in `src/js/`

- **game.js** — Game controller class. Initializes Coquette, manages game state (PLAY/LOSE), level progression, and per-game setup (entity spawning, wall creation for Pong). Wrapped in an IIFE.
- **player.js** — Player entity classes: `Toucher` (Touch), `Spaceship` (Asteroids), `Paddle` (Pong). Each handles its own input and collision response.
- **adversary.js** — Enemy entities: `Adversary` (Touch), `Asteroid` (Asteroids, breaks into smaller ranks on destruction).
- **objects.js** — Supporting entities: `Bullet`, `Ball`, `Wall`.
- **func.js** — Utility functions: screen wrapping (`wrapPoint`), time throttling (`timePassed`), random velocity (`makeVel`), grid helpers.

### Entity pattern

All game objects follow a constructor + settings pattern:
```javascript
var Entity = function(game, settings) {
    this.game = game;
    for (var i in settings) { this[i] = settings[i]; }
};
```
Entities implement: `update(tick)`, `draw(ctx)`, `collision(other, type)`. Must have `pos: {x, y}` and `size: {x, y}` for collision detection.

Inheritance uses `Object.create()` on prototypes (e.g., `Spaceship.prototype = Object.create(Player.prototype)`).

### UI layer

jQuery 2.0.2 (CDN) handles game menu selection (`#gamelist li` click handlers) and game-over modal (`#lose`). Canvas is created dynamically by Coquette inside `#game`.

## Deployment

Nginx serves static files from `src/`. Config is in `etc/nginx/chirs.game`.

## Compatibility notes

- Use `Math.pow()` instead of `**` operator (Safari compatibility — see commit 8101446).
- jQuery and Coquette are loaded from CDN; all game code is vanilla ES5 JavaScript.
