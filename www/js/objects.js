
// Bullet.

var Bullet = function(game, settings) {
    this.game = game;
    this.pos = settings.pos;
    this.vector = settings.vector;
    this.owner = settings.owner;
};

// huh?
Bullet.prototype = {
    size: { x:5, y:5 },
    speed: .5,
};

Bullet.prototype.update = function(tick) {
    
    var mx = (this.owner.vector.x + this.vector.x) * tick * this.speed;
    var my = (this.owner.vector.y + this.vector.y) * tick * this.speed;
    this.pos.x += mx;
    this.pos.y += my;
    
    if (!this.game.coquette.renderer.onScreen(this)) {
	//this.pos = this.game.wrapPosition(this.pos);		    
	this.kill();
    }
};

Bullet.prototype.draw = function(ctx) {
    ctx.fillStyle = "#ff5c35";
    ctx.beginPath();
    ctx.arc(this.pos.x + 2.5, this.pos.y + 2.5, 2.5, 0, Math.PI * 2);
    ctx.fill();
};

Bullet.prototype.collision = function(other) {
    if (other instanceof Asteroid) {
	this.kill();
	other.explode();
    } else if (other instanceof Adversary) {
	this.kill();				    
	other.kill();
    };
};

Bullet.prototype.kill = function() {
    this.game.coquette.entities.destroy(this);
};


var Particle = function(game, settings) {
    this.game = game;
    this.pos = { x: settings.pos.x, y: settings.pos.y };
    this.vel = settings.vel;
    this.life = settings.life || 400;
    this.maxLife = this.life;
    this.color = settings.color || "#ff5c35";
    this.size = { x: settings.size || 3, y: settings.size || 3 };
};

Particle.prototype.update = function(tick) {
    this.life -= tick;
    this.pos.x += this.vel.x * tick;
    this.pos.y += this.vel.y * tick;
    this.vel.x *= .98;
    this.vel.y *= .98;
    if (this.life <= 0) this.kill();
};

Particle.prototype.draw = function(ctx) {
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    ctx.globalAlpha = 1;
};

Particle.prototype.kill = function() {
    this.game.coquette.entities.destroy(this);
};




var Brick = function(game, settings) {
    this.game = game;
    this.pos = settings.pos;
    this.size = settings.size;
    this.color = settings.color;
    this.dead = false;
};

Brick.prototype.draw = function(ctx) {
    if (this.dead) return;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
};

Brick.prototype.hit = function() {
    if (this.dead) return;
    this.dead = true;
    this.game.score += 10;
    this.game.sound.play("brick", this.pos.y);
    this.game.coquette.entities.destroy(this);
    for (var i = 0; i < 4; i++) {
        this.game.coquette.entities.create(Particle, {
            pos: { x: this.pos.x + this.size.x / 2, y: this.pos.y + this.size.y / 2 },
            vel: { x: (Math.random() - .5) * .15, y: (Math.random() - .5) * .15 },
            life: 250, color: this.color
        });
    }
};

var PingBall = function(game) {
    this.game = game;
    this.size = { x: 9, y: 9 };
    this.reset();
};

PingBall.prototype.reset = function() {
    this.launched = false;
    this.vel = { x: 0, y: 0 };
    this.followPaddle();
};

PingBall.prototype.followPaddle = function() {
    var paddle = this.game.paddle;
    this.pos = { x: paddle.pos.x + (paddle.size.x - this.size.x) / 2, y: paddle.pos.y - 12 };
};

PingBall.prototype.launch = function() {
    if (this.launched) return;
    this.followPaddle();
    this.launched = true;
    this.game.sound.play("serve");
    this.speed = Math.min(.55, .3 + (this.game.level - 1) * .025);
    this.vel = { x: this.speed * .4, y: -this.speed * Math.sqrt(.84) };
};

PingBall.prototype.draw = function(ctx) {
    ctx.fillStyle = "#ff5c35";
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
};

PingBall.prototype.update = function(tick) {
    if (!this.launched) {
        this.followPaddle();
        var input = this.game.coquette.inputter;
        if (input.state(input.SPACE)) this.launch();
        return;
    }
    var duration = Math.min(tick, 50);
    var steps = Math.max(1, Math.ceil(this.speed * duration / 4));
    var paddle = this.game.paddle;
    var bricks = this.game.coquette.entities.all(Brick);
    for (var step = 0; step < steps; step++) {
        var previous = { x: this.pos.x, y: this.pos.y };
        this.pos.x += this.vel.x * duration / steps;
        this.pos.y += this.vel.y * duration / steps;
        if (this.pos.x < 0 || this.pos.x + this.size.x > this.game.width) {
            this.pos.x = Math.max(0, Math.min(this.game.width - this.size.x, this.pos.x));
            this.vel.x *= -1;
        }
        if (this.pos.y < 78) {
            this.pos.y = 78;
            this.vel.y = Math.abs(this.vel.y);
        }
        if (this.vel.y > 0 && previous.y + this.size.y <= paddle.pos.y &&
            this.pos.y + this.size.y >= paddle.pos.y &&
            this.pos.x + this.size.x >= paddle.pos.x && this.pos.x <= paddle.pos.x + paddle.size.x) {
            var offset = (this.pos.x + this.size.x / 2 - paddle.pos.x - paddle.size.x / 2) / (paddle.size.x / 2);
            this.vel.x = this.speed * Math.max(-.85, Math.min(.85, offset * .85));
            this.vel.y = -Math.sqrt(this.speed * this.speed - this.vel.x * this.vel.x);
            this.pos.y = paddle.pos.y - this.size.y;
            this.game.sound.play("paddle");
        }
        for (var i = 0; i < bricks.length; i++) {
            var brick = bricks[i];
            if (!brick.dead && this.pos.x + this.size.x > brick.pos.x &&
                this.pos.x < brick.pos.x + brick.size.x &&
                this.pos.y + this.size.y > brick.pos.y && this.pos.y < brick.pos.y + brick.size.y) {
                brick.hit();
                if (previous.y + this.size.y <= brick.pos.y || previous.y >= brick.pos.y + brick.size.y) {
                    this.vel.y *= -1;
                } else {
                    this.vel.x *= -1;
                }
                this.pos = previous;
                break;
            }
        }
        if (this.pos.y > this.game.height) {
            this.game.lives -= 1;
            this.game.sound.play(this.game.lives === 0 ? "death" : "miss");
            this.reset();
            if (this.game.lives === 0) this.game.state = this.game.STATE.LOSE;
            return;
        }
    }
};

// Wall
var Wall = function(game, settings){
    this.game = game
    
    if (settings.direction == 'x'){
	settings.size = {
	    x: 10,
	    y: settings.length
	}
    } else {
	settings.size = {
	    x: settings.length,
	    y: 10,
	}
    }
    
    for (var i in settings) {
	this[i] = settings[i];
    }
    
};

Wall.prototype.draw = function(ctx) {
    ctx.fillStyle = "#dbd"
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
};
