# Chirs.game

**Where names become games!**

A browser-based retro arcade game collection. Three playable games built with vanilla JavaScript, Canvas 2D rendering, and the Coquette.js game engine. No build tools, no frameworks — just games.

Play at [chirs.game](https://chirs.game).

## Games

**Touch** — Collect white squares, dodge orange hazards, and grow with every bite. Clear the food to shrink back down and start a harder wave.
- Arrow keys to move the hollow square
- Each pickup scores 10 points and makes you larger; touching an orange hazard ends the run

**Space** — Pilot a spaceship through an asteroid field. Shoot to survive as asteroids break into smaller, faster fragments.
- Arrow keys to move, space to shoot

**Ping** — Clear the bricks with a paddle and ball. Three lives; each cleared board speeds up the next round.
- Left/Right arrow keys or mouse to move
- Space or click the playfield to serve

Press Escape or click Menu to switch games. After game over, press Enter or R to restart.

All three games have synthesized arcade sound effects. Use the Sound button to mute or unmute; your preference is remembered. Sound starts after your first interaction and requires no audio downloads.

## Running Locally

Serve the `www/` directory with any HTTP server:

```bash
python3 -m http.server 8000 --directory www
```

Then open http://localhost:8000.

## Tests

Run the gameplay and menu regression tests with Node.js 18 or newer; no packages are required:

```bash
node --test tests/arcade.test.cjs
```

## Inspiration

Game history and references that inspired this project:

**Classic arcade era**
- Spacewar!, Pong, Pac-Man, Asteroids, Missile Command, Space Invaders, Donkey Kong

**Console & home games**
- Pitfall!, Zelda, Metroid, TMNT, Punch-Out!!, Super Mario Bros, Sonic the Hedgehog

**Competitive & multiplayer**
- Street Fighter, Super Smash Bros, Mario Kart, Call of Duty

**Simulation & open world**
- The Sims, Minecraft, Grand Theft Auto, Elder Scrolls, Oregon Trail

**Sports & party**
- Wii Sports, Mattel Electronics Basketball, Baseball, Soccer

**Puzzle**
- Tetris
