# AGENTS.md

This file provides guidance to coding agents working with code in this repository.

## Project Overview

Browser-based retro arcade game collection ("Where names become games!") at chirs.game. Three playable games: Touch, Space, and Ping. Pure static site — no build tools, no package manager, no transpilation.

## Running Locally

Serve `www/` with any HTTP server:
```bash
python3 -m http.server 8000 --directory www
```
Then open http://localhost:8000. Run regression tests with `node --test tests/arcade.test.cjs` (Node.js 18+, no packages required).

## Architecture

**Game engine**: Coquette.js (bundled as `coquette-min.js`) — provides game loop (`requestAnimationFrame`), entity management, AABB/circle collision detection, keyboard input tracking, and Canvas 2D rendering.

**Script load order** (matters — no module system):
`func.js` → `sound.js` → `player.js` → `adversary.js` → `objects.js` → `game.js`

### Key files in `www/js/`

- **sound.js** — Shared Web Audio synthesis. Lazily creates one audio context after interaction, limits active voices, and disconnects finished sounds. The UI persists mute state; menu, restart, blur, and hidden tabs stop active sounds.

- **game.js** — Game controller class (`window.ArcadeGame`). Reuses one Coquette instance, manages MENU/PLAY/LOSE state, level progression, resets, and menu controls. Gameplay stops after a loss; particles can finish animating.
- **player.js** — Player entity classes: `Toucher` (Touch), `Spaceship` (Space), `PingPaddle` (Ping).
- **adversary.js** — `TouchSquare` handles drifting food and lethal hazards, with arena-boundary bounces; `Asteroid` handles Space enemies and fragmentation. Both inherit from `Adversary`.
- **objects.js** — Supporting entities: `Bullet`, `Particle`, `Brick`, `PingBall`, `Wall`. Ping uses substeps for ball movement and handles its own brick, paddle, and boundary collisions.
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

Native DOM events handle menu selection and the game-over dialog. The selector and canvas stay in the DOM and toggle visibility. Escape or the Menu button returns to the selector; Enter or R restarts after a loss. Ping accepts arrow keys or pointer movement and Space or a click to serve.

Touch uses elapsed-time movement with normalized diagonals and arena bounds. Food adds 10 points and three pixels of player size. Clearing food resets size to 16 and replaces the wave with more food and faster hazards, capped at 12 of each. Wave spawns leave a safe area around the player; particles mark pickups and death.

## Deployment

Nginx configuration is in `etc/nginx/chirs.game`; the local static site lives in `www/`.

## Compatibility notes

- Use `Math.pow()` instead of `**` operator (Safari compatibility — see commit 8101446).
- Coquette is bundled locally. Game scripts use plain JavaScript with no runtime package dependencies; Google Fonts is the only external page resource.
