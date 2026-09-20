
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


var Ball = function(game, settings){
    for (var i in settings) {
	this[i] = settings[i];
    }    

    this.game = game;
    this.size = { x:9, y:9 };

};
	
Ball.prototype.draw = function(ctx){
    ctx.fillStyle = "#ccc";
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
};

Ball.prototype.collision = function(other) {
    if (other instanceof Wall){
	if (other.direction == 'x'){
	    this.vel.x = -1 * this.vel.x;
	} else {
	    this.vel.y = -1 * this.vel.y;
	}
    }
};

Ball.prototype.kill = function() {
    this.game.coquette.entities.destroy(this);
};

Ball.prototype.update = function(tick) {
    
    var mx = this.vel.x * tick;
    var my = this.vel.y * tick;
    this.pos.x += mx;
    this.pos.y += my;
    
    if (!this.game.coquette.renderer.onScreen(this)) {
	this.game.state = this.game.STATE.LOSE;
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


