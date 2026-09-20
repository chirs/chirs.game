
// Adversary


var Adversary = function(game, settings){
    this.game = game
    // shame
    for (var i in settings) {
	this[i] = settings[i];
    }
    this.size = { x:9, y:9 };
    
    this.shielded = false;
    
    this.vel = {x: makeVel(), y: makeVel()}
};


Adversary.prototype.draw = function(ctx){
    ctx.fillStyle = this.shielded ? "#ff5c35" : "#f2eadf";
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


var TouchSquare = function(game, settings) {
    this.game = game;
    this.pos = settings.pos;
    this.shielded = settings.shielded;
    this.size = this.shielded ? { x: 16, y: 16 } : { x: 9, y: 9 };
    this.dead = false;
    var angle = Math.random() * Math.PI * 2;
    this.vel = { x: Math.cos(angle) * settings.speed, y: Math.sin(angle) * settings.speed };
};

TouchSquare.prototype = Object.create(Adversary.prototype);

TouchSquare.prototype.draw = function(ctx) {
    if (this.dead) return;
    Adversary.prototype.draw.call(this, ctx);
    if (this.shielded) {
        ctx.strokeStyle = "#151311";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.pos.x + 4, this.pos.y + 4);
        ctx.lineTo(this.pos.x + 12, this.pos.y + 12);
        ctx.moveTo(this.pos.x + 12, this.pos.y + 4);
        ctx.lineTo(this.pos.x + 4, this.pos.y + 12);
        ctx.stroke();
    }
};

TouchSquare.prototype.update = function(tick) {
    if (this.dead) return;
    var bounds = this.game.touchBounds;
    this.pos.x += this.vel.x * Math.min(tick, 32);
    this.pos.y += this.vel.y * Math.min(tick, 32);
    if (this.pos.x < bounds.left || this.pos.x + this.size.x > bounds.right) {
        this.vel.x *= -1;
        this.pos.x = Math.max(bounds.left, Math.min(bounds.right - this.size.x, this.pos.x));
    }
    if (this.pos.y < bounds.top || this.pos.y + this.size.y > bounds.bottom) {
        this.vel.y *= -1;
        this.pos.y = Math.max(bounds.top, Math.min(bounds.bottom - this.size.y, this.pos.y));
    }
};

TouchSquare.prototype.kill = function() {
    this.dead = true;
    Adversary.prototype.kill.call(this);
};

var Asteroid = function(game, settings){
    Adversary.call(this, game, settings);
    
    this.scale = 16;
    
    this.size = { x: this.rank * this.scale, y: this.rank * this.scale };
    
    this.shielded = false;
    this.shieldTime = new Date();
    this.rotation = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - .5) * .001;
    this.shape = [];
    for (var i = 0; i < 10; i++){
	this.shape.push(.72 + Math.random() * .28);
    }
    
    if (this.vel == undefined){
	this.vel = {x: makeVel(), y: makeVel()}
    };
};

Asteroid.prototype = Object.create(Adversary.prototype);

Asteroid.prototype.draw = function(ctx) {
    var radius = this.size.x / 2;
    var center = { x: this.pos.x + radius, y: this.pos.y + radius };
    ctx.strokeStyle = "#f2eadf";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < this.shape.length; i++){
	var angle = this.rotation + (Math.PI * 2 * i / this.shape.length);
	var x = center.x + Math.cos(angle) * radius * this.shape[i];
	var y = center.y + Math.sin(angle) * radius * this.shape[i];
	if (i === 0) ctx.moveTo(x, y);
	else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
};


Asteroid.prototype.update = function(tick) {
    var mx = this.vel.x * tick;
    var my = this.vel.y * tick;
    this.pos.x += mx;
    this.pos.y += my;
    this.rotation += this.spin * tick;
    
    if (!this.game.coquette.renderer.onScreen(this)) {
	this.pos = this.game.wrapPosition(this.pos);
    }
};

Asteroid.prototype.explode = function() {
    this.game.sound.play("asteroid", this.rank);
    this.game.coquette.entities.destroy(this);
    this.game.score += 1;    
    for (var i = 0; i < 8 + this.rank * 2; i++){
	var angle = Math.random() * Math.PI * 2;
	var speed = .03 + Math.random() * .09;
	this.game.coquette.entities.create(Particle, {
	    pos: { x: this.pos.x + this.size.x / 2, y: this.pos.y + this.size.y / 2 },
	    vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
	    life: 180 + Math.random() * 320,
	    color: i % 4 === 0 ? "#ff5c35" : "#f2eadf",
	    size: 2 + Math.random() * 2
	});
    }
    // Should probably have a different method that handles this when an asteroid gets shot.
    if (this.rank > 1){
	this.game.coquette.entities.create(Asteroid, {pos: { x: this.pos.x, y: this.pos.y },
						      vel: { x: 2 * this.vel.y, y: 2 * this.vel.x },
						      rank: this.rank - 1
						     })
	this.game.coquette.entities.create(Asteroid, {pos: { x: this.pos.x, y: this.pos.y },
						      vel: { x: -2 * this.vel.y, y: -2 * this.vel.x },
						      rank: this.rank - 1
						     })
    };
};


// Pellets are sort of like immobile, defenseless adversaries.

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
