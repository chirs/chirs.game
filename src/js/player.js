
var Player = function(game, settings) {
    for (var i in settings) {
	this[i] = settings[i];
    }
}



var Toucher = function(game, settings){
    Player.call(this, game, settings);
    
    this.size = { x:9, y:9 };
    this.draw = function(ctx) {
	ctx.fillStyle = settings.color;
	ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    };
};

Toucher.prototype = Object.create(Player.prototype);

Toucher.prototype.update = function() {
    var speed = 2;
    var directions = {
	'UP_ARROW': [0, -speed],
	'DOWN_ARROW': [0, speed],
	'LEFT_ARROW': [-speed, 0],
	'RIGHT_ARROW': [speed, 0],
	
    }
    
    for (key in directions){
	if (this.game.coquette.inputter.state(this.game.coquette.inputter[key])){
	    var dir = directions[key]
	    this.pos.x += dir[0];
	    this.pos.y += dir[1];
	}
    }
    if (!this.game.coquette.renderer.onScreen(this)) {
	this.pos = this.game.wrapPosition(this.pos);
    }
};

Toucher.prototype.collision = function(other) {
    
    if ((other instanceof Adversary) && (other.shielded === true)){
	this.game.state = this.game.STATE.LOSE;			
    }
    
    if ((other instanceof Adversary) && (other.shielded === false)){
	other.kill();
	this.game.score += 1;
	this.size.x += 1;
	this.size.y += 1;
    }
    
};	


var Spaceship = function(game, settings) {
    Player.call(this, game, settings);
    
    this.size = { x:25, y:25 };
};

Spaceship.prototype = Object.create(Player.prototype);	

Spaceship.prototype.draw = function(ctx){
    ctx.fillStyle = this.color;
    
    ctx.strokeStyle="#FF0000";
    ctx.moveTo(this.pos.x,this.pos.y);
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, 10, 0, 2 * Math.PI);
    ctx.stroke();		
    
    ctx.beginPath();
    ctx.moveTo(this.pos.x,this.pos.y);		
    ctx.lineTo(this.pos.x + Math.sin(this.angle) * 20, this.pos.y + Math.cos(this.angle) * 20);
    
    ctx.stroke();
};

Spaceship.prototype.shootBullet = function(vector) {
    if (timePassed(this.lastShot, this.SHOOT_DELAY) && (this.game.state !== this.game.STATE.LOSE) ) {
	this.game.coquette.entities.create(Bullet, {
	    pos: { x : this.pos.x, y: this.pos.y },
	    vector, vector,
	    owner: this,
	});
	
	this.lastShot = new Date().getTime();
    }
};

Spaceship.prototype.update = function() {
    var speed = 4;
    
    // accelerate
    if (this.game.coquette.inputter.state(this.game.coquette.inputter['UP_ARROW'])){
	this.vector.x += .02 * Math.sin(this.angle)
	this.vector.y += .02 * Math.cos(this.angle)			
    }			
    
    // drag
    this.vector.x *= .997
    this.vector.y *= .997
    
    // update position
    this.pos.x += speed * this.vector.x;
    this.pos.y += speed * this.vector.y;
    
    this.controls();
    
    if (this.game.coquette.renderer.onScreen(this) == false) {
	this.pos = this.game.wrapPosition(this.pos);
    }	    
    
};

Spaceship.prototype.controls = function(){
    if (this.game.coquette.inputter.state(this.game.coquette.inputter['S'])){
	this.angle += .04;
    }
    
    if (this.game.coquette.inputter.state(this.game.coquette.inputter['D'])){
	this.angle -= .04;
    }
    
    if (this.game.coquette.inputter.state(this.game.coquette.inputter['SPACE'])){			
	var vector = {x: Math.sin(this.angle), y: Math.cos(this.angle) };
	this.shootBullet(vector);
    }
};

Spaceship.prototype.collision = function(other) {
    if ((other instanceof Asteroid) && (other.shielded === false)){
	this.game.state = this.game.STATE.LOSE;
    }
};		

