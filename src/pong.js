(function() {

    $(document).ready(function() {

	var loaded = false; // Game has been loaded?
	
	var timePassed = function(last, interval) { return last + interval < new Date().getTime(); };
	
	var Game = function(canvasId, width, height) {
	    
	    var self = this // save for reference.
	    
	    this.coquette = new Coquette(this, canvasId, width, height, "#000");
	    
	    this.score = 0;
	    this.level = 1;
	    
	    this.STATE = {
		PLAY: 0,
		LOSE: 1
	    }
	    
	    this.state = this.STATE.PLAY


	    for (var i=0; i < this.level; i++){
		//var x = Math.random() * width;
		//var y = Math.random() * height;
		var x = width / 2;
		var y = height / 2;
		this.coquette.entities.create(Ball, { pos:{ x:x, y:y }}); // The Ball
	    };

	    this.createWalls();

	    
	    this.coquette.entities.create(Person, { 
		game: self,
		pos:{ x:200, y:100 }, 
		color:"#0ff", // light blue
		
		SHOOT_DELAY: 300,
		lastShot: 0,
	    });
	};
	    
	
	var Person = function(game, settings) {
	    for (var i in settings) {
		this[i] = settings[i];
	    }
	    this.size = { x:9, y:54 };
	    this.draw = function(ctx) {
		ctx.fillStyle = settings.color;
		ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
	    };
	};


	Person.prototype.update = function() {
	    var speed = 2;
	    var directions = {
		'UP_ARROW': [0, -speed],
		'DOWN_ARROW': [0, speed],
	    } 
	    
	    
	    for (key in directions){
		if (this.game.coquette.inputter.state(this.game.coquette.inputter[key])){
		    var dir = directions[key]
		    this.pos.x += dir[0];
		    this.pos.y += dir[1];
		}
	    }
	    
	};
		
		
	Person.prototype.collision = function(other) {
	    if (other instanceof Ball){
		console.log('help');
		this.score += 1;
		Game.score += 1;
		other.vel.x = -1 * other.vel.x;
	    }
	};
	
	

	var Opponent = function(game, settings) {
	    for (var i in settings) {
		this[i] = settings[i];
	    }
	    this.size = { x:9, y:108 };
	    this.draw = function(ctx) {
		ctx.fillStyle = settings.color;
		ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
	    };
	};	    
	
	var makeVel = function(){
	    return (Math.random() - .5) / 10;
	}
	
	
	Game.prototype.draw = function(ctx) {
	    if (this.coquette.entities.all(Ball).length == 0){
		this.level += 1;
		this.state = this.STATE.WIN;
		console.log('you win');
		$("#next").show();
	    }
		
	    if (this.state === this.STATE.LOSE){
		ctx.fillStyle = "#ccc"
		ctx.fillRect(0, 0, 1020, 1020);
		ctx.lineWidth=1;
		ctx.fillStyle = "#666"
		
		ctx.font = "44px sans-serif";
		ctx.fillText("game over", 400, 100);
		
		ctx.font = "22px sans-serif";          
		ctx.fillText("play again", 400, 140);
	    };
	    
	    ctx.lineWidth=1;
	    ctx.fillStyle = "#fff";
	    ctx.font = "18px sans-serif";
	    ctx.fillText("Score: " + this.score, 20, 20);
	    
	};

	Game.prototype.createWalls = function(){

	    
	    this.coquette.entities.create(Wall, {
		game: self,
		pos: {x: 25, y: 25 },
		length: 100,
		direction: 'x'
	    })
	    
	    this.coquette.entities.create(Wall, {
		game: self,
		pos: {x: 25, y: 225 },
		length: 100,
		direction: 'x'
	    })	    
	    
	    this.coquette.entities.create(Wall, {
		game: self,
		pos: {x: 625, y: 25 },
		length: 100,
		direction: 'x'
	    })
	    
	    this.coquette.entities.create(Wall, {
		game: self,
		pos: {x: 625, y: 150 },
		length: 200,
		direction: 'x'
	    })


	    this.coquette.entities.create(Wall, {
		game: self,
		pos: {x: 825, y: 25 },
		length: 300,
		direction: 'x'
	    })
	    
	    this.coquette.entities.create(Wall, {
		game: self,
		pos: {x: 825, y: 350 },
		length: 100,
		direction: 'x'
	    })	    	  	    
	    
	    this.coquette.entities.create(Wall, {
		game: self,
		pos: {x: 25, y: 25 },
		length: 1200,
		direction: 'y'
	    })
	    
	    this.coquette.entities.create(Wall, {
		game: self,
		pos: {x: 25, y: 325 },
		length: 1200,
		direction: 'y'
	    })	    
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


	Wall.prototype = {
	    draw: function(ctx) {
		ctx.fillStyle = "#ccc"
		ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
	    },
	};


	// Wall	
	
	var Ball = function(game, settings){
	    this.game = game
	    // shame
	    for (var i in settings) {
		this[i] = settings[i];
	    }
	    this.size = { x:9, y:9 };

	    this.vel = {x: 20 * makeVel(), y: 5 * makeVel()} // This is just a vector?
	};
	
	
	
	Ball.prototype.draw = function(ctx){
		ctx.fillStyle = this.color();
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
	    
	Ball.prototype.color = function(){
		if (this.shielded){
		    return "#0f0";
		} else {
		    return "#fff";
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

	
	// Bullet.
	
	var Bullet = function(game, settings) {
	    this.game = game;
	    this.pos = settings.pos;
	    this.vel = settings.vector;
	};
	
	Bullet.prototype = {
            size: { x:12, y:12 },
            speed: .2,
	    
            update: function(tick) {
		
		var mx = this.vel.x * tick * this.speed;
		var my = this.vel.y * tick * this.speed;
		this.pos.x += mx;
		this.pos.y += my;
		
		if (!this.game.coquette.renderer.onScreen(this)) {
		    this.kill();
		}
            },
	    
	    
            draw: function(ctx) {
		ctx.fillStyle = "#888";
		ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
            },
	    
            collision: function(other) {
		if (other instanceof Ball) {
		    this.kill();
		    if (other.shielded === false){
			if (this.game.state === this.game.STATE.PLAY){
			    this.game.score += 1;
			}
			other.kill();
		    }
		}
            },
	    
            kill: function() {
		this.game.coquette.entities.destroy(this);
            }
	}

	var startGame = function(){
	    if (loaded === false){
		loaded = true;
		var t = $(this)
		t.html('');
		t.append($('<canvas/>', {'id': 'gameCanvas','Width': t.width(), 'Height': t.height()}));
		new Game("gameCanvas", t.width(), t.height());
	    }
	};
    
	$("#next").click(function(){
	    console.log("reloading");
	    startGame();
	});
	
	// Play
	$("#game").click(startGame);
	
    });
    
})(window);
