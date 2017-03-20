(function() {

    $(document).ready(function() {

	var loaded = false; // Game has been loaded?

	var timePassed = function(last, interval) { return last + interval < new Date().getTime(); };

	var plusMinus = function(){
	    // 50/50 [coin flip]
	    if (Math.random() < .5){
		return -1;
	    }
	    return 1;
	};

	var wrapPoint = function(s, smax){
	    if (s < 0){ return s + smax; };
	    if (s > smax){ return s - smax; };
	    return s;
	};

	var makeVel = function(){
	    return (Math.random() - .5) / 10;
	}

	var getWallEnd = function(pos, direction, length){
	    if (direction == 'x'){
		return { x: pos.x, y: pos.y + length };
	    } else {
		return { x: pos.x + length, y: pos.y };
	    }
	};

	var oppositeDirection = function(d){
	    if (d == 'x'){
		return 'y';
	    } else {
		return 'x';
	    }
	};

	var createWall = function(width, height, game){
	    
	    var x = Math.random() * width;
	    var y = Math.random() * height;	    
	    
	    
	    var length = Math.random() * height / 4;
	    if (Math.random() > .5){
		var direction = 'x';
	    } else {
		var direction = 'y';
	    }
	    
	    var pos = { x: x, y: y }
	    
	    game.coquette.entities.create(Wall, {
		game: self,
		pos: pos,
		length: length,
		direction: direction 
	    })
	    
	    var nPos = getWallEnd(pos, direction, length);
	    
	    var length = Math.random() * height / 4;
	    
	    var x = nPos.x
	    var y = nPos.y
	    
	    game.coquette.entities.create(Wall, {
		game: self,
		pos: { x: x, y: y },
		length: length,
		direction: oppositeDirection(direction)
	    })		
	};	
	
	


	var Game = function(canvasId, width, height, name) {
	    
	    var game = this; // necessary?

	    this.name = name;

	    this.coquette = new Coquette(this, canvasId, width, height, "#000");	    

	    this.width = width;
	    this.height = height;
	    
	    this.score = 0;
	    this.level = 0;

	    this.playing = false;
	    
	    this.STATE = {
		PLAY: 0,
		LOSE: 1
	    }
	    
	    this.state = this.STATE.PLAY

	    if (name == 'touch'){
		this.coquette.entities.create(Toucher, { 
		    game: game,
		    pos:{ x:249, y:110 }, 
		    color:"#f00", // red
		});
		this.startLevel(name)
	    };

	    if (name == 'asteroids'){
		this.coquette.entities.create(Spaceship, { 
		    game: game,
		    pos:{ x:250, y:100 }, 
		    color:"#f00", // red
		    
		    angle: 0,
		    vector: {x: 0, y: 0 },
		    
		    SHOOT_DELAY: 200,
		    lastShot: 0,
		});

		this.startLevel(name)
	    };

	    if (name == 'nibbles'){
		for (var i=0; i < 20; i++){
		    createWall(width, height, this);
		};
		/*
		this.coquette.entities.create(Snake, { 
		    game: self,
		    pos:{ x:249, y:110 }, 
		    color:"#0ff", // light blue
		    
		    SHOOT_DELAY: 300,
		    lastShot: 0,
		    dir: undefined,
		});
		*/
	    };
		    
	};

	Game.prototype.startLevel = function(){
	    if (this.playing == false){
		this.level += 1;		
		this.playing = true;

		if (this.name == 'asteroids'){
		    for (var i=0; i < 5; i++){
			var x = Math.random() * this.width;
			var y = Math.random() * this.height;
			var settings = { pos: { x:x, y:y }, rank: 2 };
			this.coquette.entities.create(Asteroid, settings);
		    };
		};

		if (this.name == 'touch'){
		    for (var i=0; i < 2 ** this.level; i++){
			var x = Math.random() * this.width;
			var y = Math.random() * this.height;
			this.coquette.entities.create(Adversary, { pos:{ x:x, y:y }}); // adversary
		    };
		};
	    };
	};

	Game.prototype.update = function(ctx){
	    if (this.coquette.entities.all(Adversary).length == 0){
		    this.playing = false;
	    }

	    if (this.playing == false){
		if (this.coquette.inputter.state(this.coquette.inputter['R'])){
		    this.startLevel();
		    this.playing = true;		    
		};
	    };
		
	};

	Game.prototype.wrapPosition = function(pos){
	    return {
		x: wrapPoint(pos.x, this.width),
		y: wrapPoint(pos.y, this.height),
	    }
	};
	
	
	Game.prototype.draw = function(ctx){

	    this.drawLevel(ctx);
	    this.drawScore(ctx);	    
		
	    if (this.state === this.STATE.LOSE){
		this.drawLose(ctx);
	    };
	};

	Game.prototype.drawLevel = function(ctx){
	    ctx.lineWidth=1;
	    ctx.fillStyle = "#fff";
	    ctx.font = "18px sans-serif";
	    ctx.fillText("Level: " + this.level, 20, 20);
	};
	Game.prototype.drawScore = function(ctx){
	    ctx.lineWidth=1;
	    ctx.fillStyle = "#fff";
	    ctx.font = "18px sans-serif";
	    ctx.fillText("Score: " + this.score, 20, 40);
	};	
	

	Game.prototype.drawLose = function(ctx){
	    ctx.fillStyle = "#ccc"
	    ctx.fillRect(0, 0, 1020, 1020);
	    ctx.lineWidth = 1;
	    ctx.fillStyle = "#666"
	    
	    ctx.font = "44px sans-serif";
	    ctx.fillText("game over", 400, 100);
	    
	    ctx.font = "22px sans-serif";          
	    ctx.fillText("play again", 400, 140);	    
	};	


	var Player = function(game, settings) {
	    for (var i in settings) {
		this[i] = settings[i];
	    }
	}
		


	var Toucher = function(game, settings){
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

	// Bullet.
	
	var Bullet = function(game, settings) {
	    this.game = game;
	    this.pos = settings.pos;
	    this.vector = settings.vector;
	    this.owner = settings.owner;
	};
	
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
	
	var startGame = function(game){
	    if (loaded === false){
		loaded = true;
		var t = $("#game");
		t.html('');
		t.append($('<canvas/>', {'id': 'gameCanvas','Width': t.width(), 'Height': t.height()}));
		new Game("gameCanvas", t.width(), t.height(), game);
	    }
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

	
    
	$("#gamelist li").click(function(){
	    var game = $(this).html()
	    startGame(game);
	});
    });
    
})(window);
