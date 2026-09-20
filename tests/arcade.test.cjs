const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

function arcade() {
    const callbacks = {};
    const frames = [];
    const drawing = new Proxy({}, { get: (target, key) => target[key] || (() => {}) });
    const elements = {};
    let focused;
    function element(id, hidden = false) {
        const listeners = {};
        return elements[id] = {
            id, hidden, style: {}, dataset: {}, clientWidth: 900, clientHeight: 600,
            tagName: id.includes('menu') || id === 'playagain' ? 'BUTTON' : 'CANVAS',
            classList: { toggle() {} },
            setAttribute(name, value) { this[name] = value; },
            addEventListener(type, callback) { listeners[type] = callback; },
            focus() { focused = this; if (listeners.focus) listeners.focus(); },
            click() { listeners.click(); },
            getContext() { return drawing; },
            getBoundingClientRect() { return { left: 0, width: 900 }; }
        };
    }
    ['game', 'selector', 'sound-button'].forEach(id => element(id));
    ['gameCanvas', 'menu-button', 'lose', 'playagain', 'lose-menu'].forEach(id => element(id, true));
    const items = ['touch', 'asteroids', 'ping'].map(name => {
        const item = element(name);
        item.dataset.game = name;
        return item;
    });
    const context = vm.createContext({
        console, Math, Date,
        requestAnimationFrame(callback) { frames.push(callback); },
        addEventListener(type, callback) { (callbacks[type] ||= []).push(callback); },
        document: {
            getElementById(id) { return elements[id]; },
            querySelectorAll() { return items; },
            addEventListener(type, callback) { callbacks[type] = [callback]; }
        }
    });
    context.window = context;
    for (const file of ['coquette-min.js', 'js/func.js', 'js/sound.js', 'js/player.js', 'js/adversary.js', 'js/objects.js', 'js/game.js']) {
        vm.runInContext(fs.readFileSync(path.join(__dirname, '../www', file), 'utf8'), context);
    }
    function key(key, keyCode) {
        for (const callback of [...callbacks.keydown]) {
            callback({ key, keyCode, target: focused || elements.gameCanvas, preventDefault() {} });
        }
    }
    function start(name) {
        const game = new context.ArcadeGame(elements.gameCanvas, 900, 600);
        game.start(name, 900, 600);
        game.coquette.runner.update();
        return game;
    }
    return { context, elements, frames, callbacks, start, key, focus: () => focused };
}

test('Touch restart resets position, growth, score, level, input and queued entities', () => {
    const { context: c, start } = arcade();
    const game = start('touch');
    const player = game.coquette.entities.all(c.Toucher)[0];
    player.pos.x = 10;
    player.size.x = 40;
    game.score = 31;
    game.level = 5;
    game.state = game.STATE.LOSE;
    game.coquette.inputter.state(37, true);
    game.coquette.entities.create(c.Particle, { pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 } });
    game.restart();
    game.coquette.runner.update();
    const fresh = game.coquette.entities.all(c.Toucher)[0];
    assert.equal(fresh.pos.x, 450);
    assert.equal(fresh.pos.y, 300);
    assert.equal(fresh.size.x, 16);
    assert.equal(fresh.size.y, 16);
    assert.equal(game.score, 0);
    assert.equal(game.level, 1);
    assert.equal(game.coquette.inputter.state(37), false);
    assert.equal(game.coquette.entities.all(c.Particle).length, 0);
    const squares = game.coquette.entities.all(c.TouchSquare);
    assert.equal(squares.filter(square => !square.shielded).length, 6);
    assert.equal(squares.filter(square => square.shielded).length, 3);
});

test('Loss stops Touch movement, collection and level progression', () => {
    const { context: c, start } = arcade();
    const game = start('touch');
    const player = game.coquette.entities.all(c.Toucher)[0];
    const enemies = game.coquette.entities.all(c.Adversary);
    enemies.forEach(enemy => { enemy.pos = { ...player.pos }; });
    enemies[0].shielded = true;
    game.coquette.inputter.state(39, true);
    game.coquette.collider.update();
    assert.equal(game.state, game.STATE.LOSE);
    const before = JSON.stringify(game.coquette.entities.all().map(entity => entity.pos));
    game.coquette.entities.update(16);
    game.coquette.collider.update();
    game.update();
    assert.equal(JSON.stringify(game.coquette.entities.all().map(entity => entity.pos)), before);
    assert.equal(game.score, 0);
    game.coquette.entities._entities.length = 0;
    game.update();
    assert.equal(game.level, 1);
});

test('Menu clears pending work and switching games reuses the engine', () => {
    const { context: c, start, frames, callbacks } = arcade();
    const game = start('asteroids');
    const engine = game.coquette;
    game.menu();
    game.coquette.runner.update();
    game.update();
    assert.equal(game.coquette.entities.all().length, 0);
    game.start('ping', 600, 400);
    game.coquette.runner.update();
    assert.equal(game.coquette, engine);
    assert.equal(game.coquette.entities.all(c.Spaceship).length, 0);
    assert.equal(game.coquette.entities.all(c.Brick).length, 32);
    assert.equal(game.canvas.width, 600);
    assert.equal(frames.length, 1);
    assert.equal(callbacks.keyup.length, 1);
});

test('Touch food gives one pickup, centered growth and feedback before removal is processed', () => {
    const { context: c, start } = arcade();
    const game = start('touch');
    const food = game.coquette.entities.all(c.TouchSquare).find(square => !square.shielded);
    const player = game.toucher;
    const center = player.pos.x + player.size.x / 2;
    player.collision(food);
    player.collision(food);
    assert.equal(game.score, 10);
    assert.equal(game.touchFood, 5);
    assert.equal(player.size.x, 19);
    assert.equal(player.pos.x + player.size.x / 2, center);
    assert.equal(food.dead, true);
    assert.ok(player.flash > 0);
    game.coquette.runner.update();
    assert.equal(game.coquette.entities.all(c.Particle).length, 6);
    assert.equal(game.coquette.entities.all(c.TouchSquare).includes(food), false);
});

test('Touch hazards are lethal and cannot award points after death', () => {
    const { context: c, start } = arcade();
    const game = start('touch');
    const squares = game.coquette.entities.all(c.TouchSquare);
    const hazard = squares.find(square => square.shielded);
    const food = squares.find(square => !square.shielded);
    game.toucher.collision(hazard);
    game.toucher.collision(food);
    assert.equal(game.state, game.STATE.LOSE);
    assert.equal(game.toucher.dead, true);
    assert.equal(game.score, 0);
    assert.equal(game.touchFood, 6);
    assert.equal(hazard.dead, false);
    game.coquette.runner.update();
    assert.equal(game.coquette.entities.all(c.Particle).length, 14);
});

test('Touch growth increases the collision area and makes a nearby hazard lethal', () => {
    const { context: c, start } = arcade();
    const game = start('touch');
    const squares = game.coquette.entities.all(c.TouchSquare);
    const food = squares.find(square => !square.shielded);
    const hazard = squares.find(square => square.shielded);
    hazard.pos = { x: game.toucher.pos.x + game.toucher.size.x + 1, y: game.toucher.pos.y };
    assert.equal(game.coquette.collider.isIntersecting(game.toucher, hazard), false);
    game.toucher.collision(food);
    assert.equal(game.coquette.collider.isIntersecting(game.toucher, hazard), true);
    game.coquette.collider.update();
    assert.equal(game.state, game.STATE.LOSE);
    assert.equal(game.score, 10);
});

test('Touch clears on food alone, resets growth and replaces hazards with a harder wave', () => {
    const { context: c, start } = arcade();
    const game = start('touch');
    const oldSquares = game.coquette.entities.all(c.TouchSquare);
    const hazard = oldSquares.find(square => square.shielded);
    const speed = Math.hypot(hazard.vel.x, hazard.vel.y);
    oldSquares.filter(square => !square.shielded).forEach(food => game.toucher.collision(food));
    assert.equal(game.toucher.size.x, 34);
    game.coquette.runner.update();
    game.update(16);
    game.coquette.runner.update();
    const fresh = game.coquette.entities.all(c.TouchSquare);
    assert.equal(game.level, 2);
    assert.equal(game.toucher.size.x, 16);
    assert.equal(game.score, 60);
    assert.equal(game.touchFood, 7);
    assert.equal(fresh.filter(square => square.shielded).length, 4);
    assert.equal(fresh.some(square => oldSquares.includes(square)), false);
    const nextHazard = fresh.find(square => square.shielded);
    assert.ok(Math.hypot(nextHazard.vel.x, nextHazard.vel.y) > speed);
});

test('Touch waves stay bounded and spawn away from the player at desktop and narrow sizes', () => {
    for (const [width, height] of [[900, 600], [320, 300], [351, 658]]) {
        const { context: c, start } = arcade();
        const game = start('touch');
        game.start('touch', width, height);
        game.coquette.runner.update();
        for (let wave = 1; wave <= 25; wave++) {
            const squares = game.coquette.entities.all(c.TouchSquare);
            assert.ok(game.touchFood > 0);
            assert.ok(squares.length <= 24);
            assert.ok(squares.some(square => square.shielded));
            for (const square of squares) {
                const player = game.toucher;
                assert.ok(square.pos.x + square.size.x < player.pos.x - 60 ||
                    square.pos.x > player.pos.x + player.size.x + 60 ||
                    square.pos.y + square.size.y < player.pos.y - 60 ||
                    square.pos.y > player.pos.y + player.size.y + 60);
                assert.ok(square.pos.x >= game.touchBounds.left);
                assert.ok(square.pos.y >= game.touchBounds.top);
                assert.ok(square.pos.x + square.size.x <= game.touchBounds.right);
                assert.ok(square.pos.y + square.size.y <= game.touchBounds.bottom);
            }
            squares.filter(square => !square.shielded).forEach(food => game.toucher.collision(food));
            game.coquette.runner.update();
            game.update(16);
            game.coquette.runner.update();
        }
    }
});

test('Touch movement is frame-rate independent, normalizes diagonals and respects the arena', () => {
    const { start } = arcade();
    const game = start('touch');
    const player = game.toucher;
    const input = game.coquette.inputter;
    input.state(input.RIGHT_ARROW, true);
    const startX = player.pos.x;
    for (let i = 0; i < 10; i++) player.update(10);
    assert.ok(Math.abs(player.pos.x - startX - 24) < .0001);
    player.pos.x = startX;
    for (let i = 0; i < 5; i++) player.update(20);
    assert.ok(Math.abs(player.pos.x - startX - 24) < .0001);
    input.state(input.DOWN_ARROW, true);
    const previous = { ...player.pos };
    player.update(20);
    assert.ok(Math.abs(Math.hypot(player.pos.x - previous.x, player.pos.y - previous.y) - 4.8) < .0001);
    player.pos = { x: game.width, y: game.height };
    player.update(16);
    assert.equal(player.pos.x + player.size.x, game.touchBounds.right);
    assert.equal(player.pos.y + player.size.y, game.touchBounds.bottom);
});

test('Touch squares bounce inside the arena instead of disappearing beyond an edge', () => {
    const { context: c, start } = arcade();
    const game = start('touch');
    for (const square of game.coquette.entities.all(c.TouchSquare)) {
        square.pos = { x: game.touchBounds.left, y: game.touchBounds.top };
        square.vel = { x: -.1, y: -.1 };
        square.update(16);
        assert.ok(square.vel.x > 0 && square.vel.y > 0);
        assert.equal(square.pos.x, game.touchBounds.left);
        assert.equal(square.pos.y, game.touchBounds.top);
        square.pos = { x: game.touchBounds.right - square.size.x, y: game.touchBounds.bottom - square.size.y };
        square.update(16);
        assert.ok(square.vel.x < 0 && square.vel.y < 0);
        assert.equal(square.pos.x + square.size.x, game.touchBounds.right);
        assert.equal(square.pos.y + square.size.y, game.touchBounds.bottom);
    }
});

test('Menu button and Escape restore selection and allow repeated keyboard launches', () => {
    const app = arcade();
    app.callbacks.DOMContentLoaded[0]();
    app.key('ArrowDown', 40);
    app.key('Enter', 13);
    assert.equal(app.elements.selector.hidden, true);
    assert.equal(app.elements.gameCanvas.hidden, false);
    assert.equal(app.elements['menu-button'].hidden, false);
    app.key('Escape', 27);
    assert.equal(app.elements.selector.hidden, false);
    assert.equal(app.focus().id, 'asteroids');
    app.key('ArrowDown', 40);
    app.key('Enter', 13);
    app.elements['menu-button'].click();
    assert.equal(app.focus().id, 'ping');
    app.key('Enter', 13);
    assert.equal(app.frames.length, 1);
    assert.equal(app.callbacks.keyup.length, 1);
});

test('A quick Space keypress serves Ping without waiting for a frame', () => {
    const app = arcade();
    let game;
    const start = app.context.ArcadeGame.prototype.start;
    app.context.ArcadeGame.prototype.start = function(...args) {
        game = this;
        start.apply(this, args);
    };
    app.callbacks.DOMContentLoaded[0]();
    app.elements.ping.click();
    app.key(' ', 32);
    assert.equal(game.ball.launched, true);
    assert.equal(app.frames.length, 1);
});

test('Space loss freezes scoring and motion while death particles finish', () => {
    const { context: c, start } = arcade();
    const game = start('asteroids');
    const ship = game.coquette.entities.all(c.Spaceship)[0];
    const asteroid = game.coquette.entities.all(c.Asteroid)[0];
    asteroid.pos = { ...ship.pos };
    game.coquette.collider.update();
    game.coquette.runner.update();
    assert.equal(game.state, game.STATE.LOSE);
    const particles = game.coquette.entities.all(c.Particle);
    assert.equal(particles.length, 18);
    const life = particles[0].life;
    const x = asteroid.pos.x;
    game.coquette.entities.update(16);
    game.coquette.collider.update();
    assert.equal(asteroid.pos.x, x);
    assert.equal(game.score, 0);
    assert.equal(particles[0].life, life - 16);
});

test('Ping waits for serve, follows the paddle and clamps paddle movement', () => {
    const { start } = arcade();
    const game = start('ping');
    game.paddle.moveTo(-100);
    game.ball.update(16);
    assert.equal(game.paddle.pos.x, 0);
    assert.equal(game.ball.pos.x, (game.paddle.size.x - 9) / 2);
    assert.equal(game.ball.launched, false);
    game.paddle.moveTo(10000);
    assert.equal(game.paddle.pos.x + game.paddle.size.x, game.width);
    game.coquette.inputter.state(32, true);
    game.ball.update(16);
    assert.equal(game.ball.launched, true);
    assert.ok(game.ball.vel.y < 0);
});

test('Ping brick hit scores once and reflects the ball even on long frames', () => {
    const { context: c, start } = arcade();
    const game = start('ping');
    const brick = game.coquette.entities.all(c.Brick).find(brick => brick.pos.y === 159);
    game.ball.launch();
    game.ball.pos = { x: brick.pos.x + 10, y: brick.pos.y + brick.size.y + 2 };
    game.ball.vel = { x: 0, y: -.3 };
    game.ball.update(2000);
    assert.equal(brick.dead, true);
    assert.equal(game.score, 10);
    assert.ok(game.ball.vel.y > 0);
    brick.hit();
    assert.equal(game.score, 10);
    game.coquette.runner.update();
    assert.equal(game.coquette.entities.all(c.Brick).length, 31);
});

test('Ping bounces off the paddle and side walls', () => {
    const { start } = arcade();
    const game = start('ping');
    game.ball.launch();
    game.ball.pos = { x: game.paddle.pos.x + 20, y: game.paddle.pos.y - 10 };
    game.ball.vel = { x: 0, y: .3 };
    game.ball.update(16);
    assert.ok(game.ball.vel.y < 0);
    assert.ok(game.ball.vel.x < 0);
    game.ball.pos = { x: 0, y: 250 };
    game.ball.vel = { x: -.3, y: 0 };
    game.ball.update(16);
    assert.ok(game.ball.vel.x > 0);
});

test('Three misses end Ping; loss freezes it and restart restores the round', () => {
    const { context: c, start } = arcade();
    const game = start('ping');
    for (let lives = 2; lives >= 0; lives--) {
        game.ball.launch();
        game.ball.pos.y = game.height + 1;
        game.ball.vel.y = .3;
        game.ball.update(16);
        assert.equal(game.lives, lives);
        assert.equal(game.ball.launched, false);
    }
    assert.equal(game.state, game.STATE.LOSE);
    game.coquette.inputter.state(39, true);
    const x = game.paddle.pos.x;
    game.coquette.entities.update(16);
    assert.equal(game.paddle.pos.x, x);
    game.restart();
    game.coquette.runner.update();
    assert.equal(game.lives, 3);
    assert.equal(game.level, 1);
    assert.equal(game.score, 0);
    assert.equal(game.coquette.entities.all(c.Brick).length, 32);
    assert.equal(game.state, game.STATE.PLAY);
});

test('Clearing Ping advances the level, preserves lives and increases ball speed', () => {
    const { context: c, start } = arcade();
    const game = start('ping');
    game.lives = 2;
    game.ball.launch();
    const speed = game.ball.speed;
    game.coquette.entities.all(c.Brick).forEach(brick => brick.hit());
    game.coquette.runner.update();
    game.update();
    game.coquette.runner.update();
    assert.equal(game.level, 2);
    assert.equal(game.lives, 2);
    assert.equal(game.score, 320);
    assert.equal(game.coquette.entities.all(c.Brick).length, 32);
    assert.equal(game.ball.launched, false);
    game.ball.launch();
    assert.ok(game.ball.speed > speed);
});

test('Sound follows Touch pickups, wave clears and death without duplicate pickup cues', () => {
    const { context: c, start } = arcade();
    const game = start('touch');
    const cues = [];
    game.sound.play = (name, value) => cues.push([name, value]);
    const foods = game.coquette.entities.all(c.TouchSquare).filter(square => !square.shielded);
    game.toucher.collision(foods[0]);
    game.toucher.collision(foods[0]);
    assert.deepEqual(cues, [['pickup', 19]]);
    foods.slice(1).forEach(food => game.toucher.collision(food));
    game.coquette.runner.update();
    game.update(16);
    game.coquette.runner.update();
    assert.deepEqual(cues.map(cue => cue[0]), [...Array(6).fill('pickup'), 'wave']);
    assert.ok(cues[5][1] > cues[0][1]);
    game.toucher.collision(game.coquette.entities.all(c.TouchSquare).find(square => square.shielded));
    assert.equal(cues.at(-1)[0], 'death');
});

test('Space sound follows actual shots, thrust, asteroid hits and death', () => {
    const { context: c, start } = arcade();
    const game = start('asteroids');
    const cues = [];
    game.sound.play = name => cues.push(name);
    const ship = game.coquette.entities.all(c.Spaceship)[0];
    ship.shootBullet({ x: 0, y: 1 });
    ship.shootBullet({ x: 0, y: 1 });
    assert.deepEqual(cues, ['shot']);
    game.coquette.inputter.state(38, true);
    game.update(16);
    assert.equal(cues.at(-1), 'thrust');
    const asteroid = game.coquette.entities.all(c.Asteroid)[0];
    asteroid.explode();
    ship.collision(asteroid);
    assert.deepEqual(cues.slice(-2), ['asteroid', 'death']);
});

test('Ping has distinct serve, paddle, brick, miss and game-over cues', () => {
    const { context: c, start } = arcade();
    const game = start('ping');
    const cues = [];
    game.sound.play = name => cues.push(name);
    game.ball.launch();
    game.ball.launch();
    assert.deepEqual(cues, ['serve']);
    game.ball.pos = { x: game.paddle.pos.x + 20, y: game.paddle.pos.y - 10 };
    game.ball.vel = { x: 0, y: .3 };
    game.ball.update(16);
    const brick = game.coquette.entities.all(c.Brick)[0];
    brick.hit();
    brick.hit();
    assert.deepEqual(cues.slice(-2), ['paddle', 'brick']);
    for (let lives = 3; lives > 0; lives--) {
        game.ball.launch();
        game.ball.pos.y = game.height + 1;
        game.ball.vel.y = .3;
        game.ball.update(16);
        assert.equal(cues.at(-1), lives === 1 ? 'death' : 'miss');
    }
});

test('The mute button can be activated with the keyboard without launching a game', () => {
    const app = arcade();
    app.callbacks.DOMContentLoaded[0]();
    app.elements['sound-button'].focus();
    app.key('Enter', 13);
    assert.equal(app.context.arcadeSound.muted, true);
    assert.equal(app.elements['sound-button']['aria-pressed'], 'true');
    assert.equal(app.elements.selector.hidden, false);
    app.key(' ', 32);
    assert.equal(app.context.arcadeSound.muted, false);
    assert.equal(app.frames.length, 0);
});
