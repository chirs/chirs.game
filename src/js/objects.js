
// Bullet.

var Bullet = function(game, settings) {
    this.game = game;
    this.pos = settings.pos;
    this.vector = settings.vector;
    this.owner = settings.owner;
};

// huh?
Bullet.prototype = {
    size: { x:12, y:12 },
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
    ctx.fillStyle = "#888";
    ctx.fillStyle = "#99f";		
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
};

Bullet.prototype.collision = function(other) {
    if (other instanceof Adversary) {
	this.kill();				    
	other.kill();
    };
};

Bullet.prototype.kill = function() {
    this.game.coquette.entities.destroy(this);
};




	
var Ball = function(game, settings){
    for (var i in settings) {
	this[i] = settings[i];
    }    

    this.game = game;
    this.size = { x:9, y:9 };
    this.vel = {x: 20 * makeVel(), y: 5 * makeVel()} // This is just a vector?
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



