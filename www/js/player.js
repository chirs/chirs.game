
// This doesn't do anything!

var Player = function(game, settings) {
    for (var i in settings) {
	this[i] = settings[i];
    }
}

Player.prototype.kill = function() {
    this.game.coquette.entities.destroy(this);
};



var Toucher = function(game, settings) {
    Player.call(this, game, settings);
    this.size = { x: 16, y: 16 };
    this.flash = 0;
    this.dead = false;
};

Toucher.prototype = Object.create(Player.prototype);

Toucher.prototype.draw = function(ctx) {
    if (this.dead) return;
    ctx.strokeStyle = this.flash > 0 ? "#ff5c35" : "#f2eadf";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.pos.x + 1, this.pos.y + 1, this.size.x - 2, this.size.y - 2);
    ctx.fillStyle = "#ff5c35";
    ctx.fillRect(this.pos.x + this.size.x / 2 - 2, this.pos.y + this.size.y / 2 - 2, 4, 4);
};

Toucher.prototype.resize = function(size) {
    this.pos.x -= (size - this.size.x) / 2;
    this.pos.y -= (size - this.size.y) / 2;
    this.size = { x: size, y: size };
    this.clamp();
};

Toucher.prototype.clamp = function() {
    var bounds = this.game.touchBounds;
    this.pos.x = Math.max(bounds.left, Math.min(bounds.right - this.size.x, this.pos.x));
    this.pos.y = Math.max(bounds.top, Math.min(bounds.bottom - this.size.y, this.pos.y));
};

Toucher.prototype.update = function(tick) {
    var input = this.game.coquette.inputter;
    var x = (input.state(input.RIGHT_ARROW) ? 1 : 0) - (input.state(input.LEFT_ARROW) ? 1 : 0);
    var y = (input.state(input.DOWN_ARROW) ? 1 : 0) - (input.state(input.UP_ARROW) ? 1 : 0);
    var speed = .24 * Math.min(tick, 32) / (x && y ? Math.sqrt(2) : 1);
    this.pos.x += x * speed;
    this.pos.y += y * speed;
    this.flash = Math.max(0, this.flash - tick);
    this.clamp();
};

Toucher.prototype.burst = function(pos, count, color) {
    for (var i = 0; i < count; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = .04 + Math.random() * .1;
        this.game.coquette.entities.create(Particle, {
            pos: pos,
            vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
            life: 180 + Math.random() * 160,
            color: color
        });
    }
};

Toucher.prototype.collision = function(other) {
    if (!(other instanceof TouchSquare) || other.dead || this.game.state !== this.game.STATE.PLAY) return;
    if (other.shielded) {
        this.dead = true;
        this.game.state = this.game.STATE.LOSE;
        this.game.sound.play("death");
        this.burst({ x: this.pos.x + this.size.x / 2, y: this.pos.y + this.size.y / 2 }, 14, "#ff5c35");
        return;
    }
    other.kill();
    this.game.score += 10;
    this.game.touchFood -= 1;
    this.resize(this.size.x + 3);
    this.game.sound.play("pickup", this.size.x);
    this.flash = 120;
    this.burst({ x: other.pos.x + 4.5, y: other.pos.y + 4.5 }, 6, "#f2eadf");
};


var Spaceship = function(game, settings) {
    Player.call(this, game, settings);
    
    this.size = { x:25, y:25 };
    this.dead = false;
};

Spaceship.prototype = Object.create(Player.prototype);	

Spaceship.prototype.draw = function(ctx){
    if (this.dead) return;

    var center = { x: this.pos.x + 12.5, y: this.pos.y + 12.5 };
    var forward = { x: Math.sin(this.angle), y: Math.cos(this.angle) };
    var side = { x: Math.cos(this.angle), y: -Math.sin(this.angle) };

    ctx.strokeStyle = "#f2eadf";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(center.x + forward.x * 13, center.y + forward.y * 13);
    ctx.lineTo(center.x - forward.x * 9 + side.x * 9, center.y - forward.y * 9 + side.y * 9);
    ctx.lineTo(center.x - forward.x * 5, center.y - forward.y * 5);
    ctx.lineTo(center.x - forward.x * 9 - side.x * 9, center.y - forward.y * 9 - side.y * 9);
    ctx.closePath();
    ctx.stroke();

    if (this.game.coquette.inputter.state(this.game.coquette.inputter['UP_ARROW'])){
	ctx.strokeStyle = "#ff5c35";
	ctx.beginPath();
	ctx.moveTo(center.x - forward.x * 7 + side.x * 3, center.y - forward.y * 7 + side.y * 3);
	ctx.lineTo(center.x - forward.x * (13 + Math.random() * 6), center.y - forward.y * (13 + Math.random() * 6));
	ctx.lineTo(center.x - forward.x * 7 - side.x * 3, center.y - forward.y * 7 - side.y * 3);
	ctx.stroke();
    }
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
    if (this.dead) return;
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
    if (this.game.coquette.inputter.state(this.game.coquette.inputter['LEFT_ARROW'])){
	this.angle += .06;
    }

    if (this.game.coquette.inputter.state(this.game.coquette.inputter['RIGHT_ARROW'])){
	this.angle -= .06;
    }

    if (this.game.coquette.inputter.state(this.game.coquette.inputter['SPACE'])){
	var vector = {x: Math.sin(this.angle), y: Math.cos(this.angle) };
	this.shootBullet(vector);
    }
};

Spaceship.prototype.collision = function(other) {

    if ((other instanceof Asteroid) && (other.shielded === false) &&
	this.game.state !== this.game.STATE.LOSE){
	this.dead = true;
	for (var i = 0; i < 18; i++){
	    var angle = Math.random() * Math.PI * 2;
	    var speed = .04 + Math.random() * .12;
	    this.game.coquette.entities.create(Particle, {
		pos: { x: this.pos.x + 12, y: this.pos.y + 12 },
		vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
		life: 350 + Math.random() * 450,
		color: i % 3 === 0 ? "#ff5c35" : "#f2eadf"
	    });
	}
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





	
var PingPaddle = function(game) {
    this.game = game;
    this.size = { x: Math.min(110, game.width / 4), y: 10 };
    this.pos = { x: (game.width - this.size.x) / 2, y: game.height - 40 };
};

PingPaddle.prototype.moveTo = function(x) {
    this.pos.x = Math.max(0, Math.min(this.game.width - this.size.x, x - this.size.x / 2));
};

PingPaddle.prototype.update = function(tick) {
    var input = this.game.coquette.inputter;
    var direction = (input.state(input.RIGHT_ARROW) ? 1 : 0) -
                    (input.state(input.LEFT_ARROW) ? 1 : 0);
    this.moveTo(this.pos.x + this.size.x / 2 + direction * Math.min(tick, 50) * .6);
};

PingPaddle.prototype.draw = function(ctx) {
    ctx.fillStyle = "#f2eadf";
    ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
};
