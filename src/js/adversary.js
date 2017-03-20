
// Adversary


var Adversary = function(game, settings){
    this.game = game
    // shame
    for (var i in settings) {
	this[i] = settings[i];
    }
    this.size = { x:9, y:9 };
    
    this.shielded = false;
    // this.shieldTime = new Date();
    
    this.vel = {x: makeVel(), y: makeVel()}
};


Adversary.prototype.draw = function(ctx){
    ctx.fillStyle = "#fff";	    
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
};

Adversary.prototype.kill = function(){
    this.game.coquette.entities.destroy(this);
};

Adversary.prototype.update = function(tick) {
    var mx = this.vel.x * tick;
    var my = this.vel.y * tick;
    this.pos.x += mx;
    this.pos.y += my;
    
    this.vel.x += .01 * Math.random() * Math.random() * plusMinus();
    this.vel.y += .01 * Math.random() * Math.random() * plusMinus();
    
    if (!this.game.coquette.renderer.onScreen(this)) {
	this.vel.x = -1 * this.vel.x
	this.vel.y = -1 * this.vel.y	    
    }
    
};


var Asteroid = function(game, settings){
    Adversary.call(this, game, settings);
    
    
    //this.game = game;
    this.scale = 24;
    
    //for (var i in settings) {
    // this[i] = settings[i];
    //}
    
    this.size = { x: this.rank * this.scale, y: this.rank * this.scale };
    
    this.shielded = false;
    this.shieldTime = new Date();
    
    if (this.vel == undefined){
	this.vel = {x: makeVel(), y: makeVel()}
    };
};

Asteroid.prototype = Object.create(Adversary.prototype);


Asteroid.prototype.kill = function() {
    this.game.coquette.entities.destroy(this);
    this.game.score += 1;
    
    if (this.rank > 1){
	this.game.coquette.entities.create(Asteroid, {pos: { x: this.pos.x, y: this.pos.y },
						      vel: { x: 2 * this.vel.y, y: 2 * this.vel.x },
						      rank: this.rank - 1
						     })
	this.game.coquette.entities.create(Asteroid, {pos: { x: this.pos.x, y: this.pos.y },
						      vel: { x: -2 * this.vel.y, y: -2 * this.vel.x },
						      rank: this.rank - 1
						     })		    
    }
};

Asteroid.prototype.update = function(tick) {
    var mx = this.vel.x * tick;
    var my = this.vel.y * tick;
    this.pos.x += mx;
    this.pos.y += my;
    
    if (!this.game.coquette.renderer.onScreen(this)) {
	this.pos = this.game.wrapPosition(this.pos);
    }
};
