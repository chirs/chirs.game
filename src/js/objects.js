
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

var Pellet = function(game, settings) {
    for (var i in settings) {
	this[i] = settings[i];
    }
    this.size = { x:10, y:10 };
    this.game = game;
};




Wall.prototype.draw = function(ctx) {
    ctx.fillStyle = "#dbd"
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
};


var Pellet = function(game, settings) {
    for (var i in settings) {
	this[i] = settings[i];
    }
    this.size = { x:10, y:10 };
    this.game = game;
};	

Pellet.prototype.draw = function(ctx){
    ctx.fillStyle = "#fff"; this.color;
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    ctx.fill();		
};


Pellet.prototype.kill = function() {
    this.game.coquette.entities.destroy(this);
};


Pellet.prototype.collision = function(other) {
    if (other instanceof Wall) {
	this.kill();
    }		
};



