
// This doesn't do anything!

var Player = function(game, settings) {
    for (var i in settings) {
	this[i] = settings[i];
    }
}

Player.prototype.kill = function() {
    this.game.coquette.entities.destroy(this);
};



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




var Tail = function(game, settings){
    settings.pos = fromGrid(toGrid(settings.pos));
    
    for (var i in settings) {
	this[i] = settings[i];
    }
    this.size = { x:10, y:10 };
};

Tail.prototype.elements = []

Tail.prototype.checkDuplicate = function(pos){
    var gridded = fromGrid(toGrid(pos));
    for (var i=0; i < this.elements.length; i++){
	var el = this.elements[i];
	if (el.pos.x == gridded.x){
	    if (el.pos.y == gridded.y){
		return true;
	    };
	};
    };
    return false;
};

Tail.prototype.draw = function(ctx){
    ctx.fillStyle = "#f93"; this.color;
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    ctx.fill();				
};	

var Snake = function(game, settings) {
    Player.call(this, game, settings);    
    this.size = { x:10, y:10 };
};


Snake.prototype.draw = function(ctx){
    ctx.fillStyle = "#ff0"
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
    ctx.fill();		
};

Snake.prototype.update = function() {
    
    var speed = 2;
    
    directions = {
	'UP_ARROW': [0, -speed],
	'DOWN_ARROW': [0, speed],
	'LEFT_ARROW': [-speed, 0],
	'RIGHT_ARROW': [speed, 0],
    }
    
    this.OPPOSITES ={
	'UP_ARROW': 'DOWN_ARROW',
	'DOWN_ARROW': 'UP_ARROW',
	'LEFT_ARROW': 'RIGHT_ARROW',
	'RIGHT_ARROW': 'LEFT_ARROW',
    }			
    
    for (key in directions){
	if (this.game.coquette.inputter.state(this.game.coquette.inputter[key])){
	    this.direction = key;
	    this.dir = directions[key]			    
	}
	if (this.dir){
	    this.pos.x += this.dir[0];
	    this.pos.y += this.dir[1];
	}
    };
    
    // Check that the trail doesn't already exist.
    if (trailExists(this.pos) == false){
	var tt = this.game.coquette.entities.create(Tail, { pos:{ x:this.pos.x, y:this.pos.y }}); // adversary
	
	var tailPieces = this.game.coquette.entities.all(Tail)
	if (tailPieces.length > 20){
	    var tt = tailPieces.pop();
	    this.game.coquette.entities.destroy(tt);
	};
    }
};


var trailExists = function(pos){
    var np = toGrid(pos)
    for (var i=0; i < trailExists.els.length; i++){
	var el = trailExists.els[i];
	if (el.x == np.x){
	    if (el.y == np.y){
		return true;
	    };
	};
    };
    return false
}

trailExists.els = []

Snake.prototype.collision = function(other) {
    //if (other instanceof Wall){
    //this.game.playing = false;
    //this.kill();
    //}
    //if (other instanceof Tail){
    //this.kill();
    //}	    
};

