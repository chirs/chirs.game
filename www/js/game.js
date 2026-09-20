(function() {
    var Game = function(canvas, width, height) {
        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.STATE = { MENU: 0, PLAY: 1, LOSE: 2 };
        this.state = this.STATE.MENU;
        this.sound = arcadeSound;
        this.coquette = new Coquette(this, canvas.id, width, height, "#151311");

        var game = this;
        var collider = this.coquette.collider;
        var intersects = collider.isIntersecting;
        collider.isIntersecting = function(a, b) {
            return game.state === game.STATE.PLAY && intersects.call(this, a, b);
        };
        this.coquette.entities.update = function(tick) {
            this.all().slice().forEach(function(entity) {
                if (entity.update && (game.state === game.STATE.PLAY ||
                    (game.state === game.STATE.LOSE && entity instanceof Particle))) {
                    entity.update(tick);
                }
            });
        };
    };

    Game.prototype.clear = function() {
        this.sound.stop();
        this.coquette.runner.runs.length = 0;
        this.coquette.entities._entities.length = 0;
        this.coquette.collider.collideRecords = [];
        this.coquette.inputter._state = {};
    };

    Game.prototype.start = function(name, width, height) {
        this.clear();
        this.name = name;
        this.width = this.canvas.width = this.coquette.renderer.width = width;
        this.height = this.canvas.height = this.coquette.renderer.height = height;
        this.score = 0;
        this.level = 0;
        this.playing = false;
        this.state = this.STATE.PLAY;
        var center = { x: width / 2, y: height / 2 };

        if (name === "touch") {
            this.touchBounds = { left: 12, top: 88, right: width - 12, bottom: height - 12 };
            this.toucher = new Toucher(this, { game: this, pos: center });
            this.coquette.entities._entities.push(this.toucher);
        } else if (name === "asteroids") {
            this.coquette.entities.create(Spaceship, {
                game: this, pos: center, angle: 0, vector: { x: 0, y: 0 },
                SHOOT_DELAY: 200, lastShot: 0
            });
        } else if (name === "ping") {
            this.lives = 3;
            this.paddle = new PingPaddle(this);
            this.ball = new PingBall(this);
            this.coquette.entities._entities.push(this.paddle, this.ball);
        }
        this.startLevel();
    };

    Game.prototype.restart = function() {
        this.start(this.name, this.width, this.height);
    };

    Game.prototype.menu = function() {
        this.state = this.STATE.MENU;
        this.clear();
    };

    Game.prototype.startLevel = function() {
        if (this.playing || this.state !== this.STATE.PLAY) return;
        this.level += 1;
        if (this.level > 1) this.sound.play("wave");
        this.playing = true;
        if (this.name === "touch") {
            this.startTouchWave();
            return;
        }
        if (this.name === "ping") {
            var columns = 8;
            var brickWidth = (this.width - 48) / columns;
            for (var row = 0; row < 4; row++) {
                for (var column = 0; column < columns; column++) {
                    this.coquette.entities.create(Brick, {
                        pos: { x: 24 + column * brickWidth, y: 90 + row * 23 },
                        size: { x: brickWidth - 6, y: 15 },
                        color: row === (this.level - 1) % 4 ? "#ff5c35" : "#f2eadf"
                    });
                }
            }
            this.ball.reset();
            return;
        }
        var count = 5;
        if (this.name !== "asteroids") return;

        for (var i = 0; i < count; i++) {
            var x = Math.random() * this.width;
            var y = Math.random() * this.height;
            if (this.name === "asteroids") {
                var safeX = Math.min(140, this.width / 4);
                var safeY = Math.min(140, this.height / 4);
                while (Math.abs(x - this.width / 2) < safeX &&
                       Math.abs(y - this.height / 2) < safeY) {
                    x = Math.random() * this.width;
                    y = Math.random() * this.height;
                }
            }
            this.coquette.entities.create(Asteroid, {
                pos: { x: x, y: y }, rank: 3
            });
        }
    };

    Game.prototype.startTouchWave = function() {
        var entities = this.coquette.entities;
        entities.all(TouchSquare).forEach(function(square) { square.kill(); });
        this.toucher.resize(16);
        this.waveNotice = 1000;

        var bounds = this.touchBounds;
        var player = this.toucher;
        var slots = [];
        for (var y = bounds.top + 8; y <= bounds.bottom - 24; y += 48) {
            for (var x = bounds.left + 8; x <= bounds.right - 24; x += 48) {
                if (x + 16 < player.pos.x - 72 || x > player.pos.x + player.size.x + 72 ||
                    y + 16 < player.pos.y - 72 || y > player.pos.y + player.size.y + 72) {
                    slots.push({ x: x, y: y });
                }
            }
        }
        this.touchFood = Math.min(5 + this.level, 12, Math.floor(slots.length * 2 / 3));
        var hazards = Math.min(2 + this.level, 12, slots.length - this.touchFood);
        for (var i = 0; i < this.touchFood + hazards; i++) {
            var slot = slots.splice(Math.floor(Math.random() * slots.length), 1)[0];
            entities.create(TouchSquare, {
                pos: slot,
                shielded: i >= this.touchFood,
                speed: i >= this.touchFood ? Math.min(.09 + this.level * .008, .18) : .045
            });
        }
    };

    Game.prototype.update = function(tick) {
        if (this.state !== this.STATE.PLAY) return;
        if (this.name === "asteroids" && this.coquette.inputter.state(this.coquette.inputter.UP_ARROW)) {
            this.sound.play("thrust");
        }
        if (this.name === "touch") {
            this.waveNotice = Math.max(0, this.waveNotice - Math.min(tick || 0, 32));
            if (this.touchFood === 0) {
                this.playing = false;
                this.startLevel();
            }
        }
        if (this.name === "ping" && this.coquette.entities.all(Brick).length === 0) {
            this.playing = false;
            this.startLevel();
        }
        if (this.name === "asteroids" &&
            this.coquette.entities.all(Adversary).length === 0) {
            this.playing = false;
            this.startLevel();
        }
    };

    Game.prototype.wrapPosition = function(pos) {
        return { x: wrapPoint(pos.x, this.width), y: wrapPoint(pos.y, this.height) };
    };

    Game.prototype.draw = function(ctx) {
        if (this.state === this.STATE.MENU) return;
        ctx.fillStyle = "#817a72";
        ctx.font = "12px 'IBM Plex Mono', monospace";
        ctx.fillText((this.name === "touch" ? "WAVE " : "LEVEL ") + this.level, 20, 28);
        ctx.fillStyle = "#f2eadf";
        ctx.fillText("SCORE " + this.score, 20, 48);

        var controls = {
            touch: ["ARROWS  MOVE", "COLLECT WHITE", "AVOID ORANGE"],
            asteroids: ["↑  THRUST", "← →  TURN", "SPACE  FIRE"],
            ping: ["← → / MOUSE  MOVE", "SPACE / CLICK  SERVE"]
        };
        ctx.fillStyle = "#817a72";
        ctx.font = "11px 'IBM Plex Mono', monospace";
        var x = this.width - 150;
        controls[this.name].forEach(function(line, index) {
            ctx.fillText(line, x, 20 * (index + 1));
        });
        if (this.name === "touch") {
            ctx.fillStyle = "#ff5c35";
            ctx.fillText("FOOD LEFT " + this.touchFood, 20, 68);
            if (this.waveNotice > 0 && this.state === this.STATE.PLAY) {
                ctx.textAlign = "center";
                ctx.fillText("WAVE " + this.level + " / START SMALL. GET BIG.", this.width / 2, this.height - 24);
                ctx.textAlign = "left";
            }
        }
        if (this.name === "ping") {
            ctx.fillStyle = "#ff5c35";
            ctx.fillText("LIVES " + this.lives, 20, 68);
            if (!this.ball.launched && this.state === this.STATE.PLAY) {
                ctx.textAlign = "center";
                ctx.fillText("SPACE OR CLICK TO SERVE", this.width / 2, this.height - 85);
                ctx.textAlign = "left";
            }
        }
        if (this.onLose && this.state === this.STATE.LOSE) this.onLose();
    };

    window.ArcadeGame = Game;

    document.addEventListener("DOMContentLoaded", function() {
        var game;
        var container = document.getElementById("game");
        var selector = document.getElementById("selector");
        var canvas = document.getElementById("gameCanvas");
        var menuButton = document.getElementById("menu-button");
        var soundButton = document.getElementById("sound-button");
        var lose = document.getElementById("lose");
        var restartButton = document.getElementById("playagain");
        var items = Array.prototype.slice.call(document.querySelectorAll("#gamelist li"));
        var selected = 0;

        try { arcadeSound.setMuted(localStorage.getItem("arcade-muted") === "true"); } catch (error) {}
        function showSoundState() {
            soundButton.textContent = arcadeSound.muted ? "sound off" : "sound on";
            soundButton.setAttribute("aria-pressed", String(arcadeSound.muted));
        }
        showSoundState();
        soundButton.addEventListener("click", function() {
            arcadeSound.setMuted(!arcadeSound.muted);
            arcadeSound.unlock();
            showSoundState();
            try { localStorage.setItem("arcade-muted", String(arcadeSound.muted)); } catch (error) {}
            if (game && game.state === game.STATE.PLAY) canvas.focus();
        });
        window.addEventListener("pointerdown", function() { arcadeSound.unlock(); });

        function select(index, focus) {
            selected = (index + items.length) % items.length;
            items.forEach(function(item, i) { item.classList.toggle("selected", i === selected); });
            if (focus) items[selected].focus();
        }

        function restart() {
            lose.hidden = true;
            game.restart();
            canvas.focus();
        }

        function menu() {
            if (!game) return;
            game.menu();
            lose.hidden = true;
            canvas.hidden = true;
            menuButton.hidden = true;
            selector.hidden = false;
            select(selected, true);
        }

        function start(name) {
            arcadeSound.unlock();
            selector.hidden = true;
            canvas.hidden = false;
            menuButton.hidden = false;
            if (!game) {
                game = new Game(canvas, container.clientWidth, container.clientHeight);
                game.onLose = function() {
                    if (lose.hidden) {
                        lose.hidden = false;
                        restartButton.focus();
                    }
                };
            }
            game.start(name, container.clientWidth, container.clientHeight);
            canvas.focus();
        }

        items.forEach(function(item, index) {
            item.addEventListener("click", function() {
                select(index, false);
                start(item.dataset.game);
            });
            item.addEventListener("focus", function() { select(index, false); });
            item.addEventListener("mouseenter", function() { select(index, false); });
        });
        menuButton.addEventListener("click", menu);
        document.getElementById("lose-menu").addEventListener("click", menu);
        restartButton.addEventListener("click", restart);
        canvas.addEventListener("pointermove", function(event) {
            if (game && game.name === "ping" && game.state === game.STATE.PLAY) {
                var bounds = canvas.getBoundingClientRect();
                game.paddle.moveTo((event.clientX - bounds.left) * game.width / bounds.width);
            }
        });
        canvas.addEventListener("click", function() {
            canvas.focus();
            if (game.name === "ping" && game.state === game.STATE.PLAY) game.ball.launch();
        });
        window.addEventListener("blur", function() {
            arcadeSound.stop();
            if (game) game.coquette.inputter._state = {};
        });
        document.addEventListener("visibilitychange", function() {
            if (document.hidden) {
                arcadeSound.stop();
                if (game) game.coquette.inputter._state = {};
            }
        });
        window.addEventListener("keydown", function(event) {
            arcadeSound.unlock();
            var inMenu = !game || game.state === game.STATE.MENU;
            if (event.target === soundButton && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                if (!event.repeat) soundButton.click();
                return;
            }
            if (!lose.hidden && event.key === "Tab") {
                event.preventDefault();
                var buttons = [restartButton, document.getElementById("lose-menu"), soundButton];
                var index = buttons.indexOf(document.activeElement);
                buttons[(index + (event.shiftKey ? 2 : 1)) % buttons.length].focus();
            } else if (inMenu && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
                event.preventDefault();
                select(selected + (event.key === "ArrowDown" ? 1 : -1), true);
            } else if (inMenu && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                if (!event.repeat) items[selected].click();
            } else if (!inMenu && event.key === "Escape") {
                event.preventDefault();
                menu();
            } else if (!inMenu && game.name === "ping" &&
                       game.state === game.STATE.PLAY && event.key === " ") {
                event.preventDefault();
                if (!event.repeat) game.ball.launch();
            } else if (!inMenu && game.state === game.STATE.LOSE &&
                       event.key === " " && event.target.tagName === "BUTTON") {
                event.preventDefault();
                if (!event.repeat) event.target.click();
            } else if (!inMenu && game.state === game.STATE.LOSE &&
                       (event.key.toLowerCase() === "r" ||
                        (event.key === "Enter" && event.target.tagName !== "BUTTON"))) {
                event.preventDefault();
                if (!event.repeat) restart();
            }
        });
        select(0, false);
    });
})();
