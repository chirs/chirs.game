(function() {

    $(document).ready(function() {

	var loaded = false; // Game has been loaded?
	
	// 50/50 [coin flip]
	var plusMinus = function(){
	    if (Math.random() < .5){
		return -1;
	    }
	    return 1;
	}

	
	var timePassed = function(last, interval) { return last + interval < new Date().getTime(); };
	
	// find the center of a rectangle
	var center = function(obj) {
	    if(obj.pos !== undefined) {
		return {
		    x: obj.pos.x + (obj.size.x / 2),
		    y: obj.pos.y + (obj.size.y / 2),
		};
	    }
	};
	
	// Find all entities that are colliding.
	var getCollidingEntities = function(collisions, entity){
	    var entities = []
	    for (var i=0; i < collisions.length; i++){
		var colliding = collisions[i];
		if (colliding[0] === entity){
		    entities.push(colliding[1]);
		};
		if (colliding[1] === entity){
		    entities.push(colliding[0]);
		};
	    }
	    return entities;
	};
	
	
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
		this.coquette.entities.create(Ball, { pos:{ x:x, y:y }}); // adversary
	    };

	    
	    this.coquette.entities.create(Person, { 
		game: self,
		pos:{ x:249, y:110 }, 
		color:"#0ff", // light blue
		
		SHOOT_DELAY: 300,
		lastShot: 0,
		
		shootBullet: function(vector) {
		    if (timePassed(this.lastShot, this.SHOOT_DELAY) && (this.game.state !== this.game.STATE.LOSE) ) {
			var c = center(this);
			this.game.coquette.entities.create(Bullet, {
			    pos: { x:c.x, y:c.y },
			    vector: vector,
			    owner: this,
			});
			
			this.lastShot = new Date().getTime();
		    }
		},
		
		update: function() {
		    var speed = 2;
		    var directions = {
			'UP_ARROW': [0, -speed],
			'DOWN_ARROW': [0, speed],
		    } 
		    
		    var bullets = {
			'W': [0, -speed],
			'S': [0, speed],
			'D': [speed, 0],
			'A': [-speed, 0],
		    }
		    
		    for (key in directions){
			if (self.coquette.inputter.state(self.coquette.inputter[key])){
			    var dir = directions[key]
			    this.pos.x += dir[0];
			    this.pos.y += dir[1];
			}
		    }
		    
		    for (key in bullets){
			if (self.coquette.inputter.state(self.coquette.inputter[key])){
			    var dir = bullets[key]
			    var vel = {x: dir[0], y: dir[1] }
			    this.shootBullet(vel);
			}
		    }
		},
		
		
		collision: function(other) {
		    if (other instanceof Ball){
			console.log('help');
			this.score += 1;
			Game.score += 1;
			other.vel.x = -1 * other.vel.x;
		    }
		}
	    });
	
	};
	
	var Box = function(game, settings){
	    this.size = settings.size || {height:9, width:9 };
	    this.position = settings.position || {x:0, y:0 };
	    this.color = setting.scolor || "#ccc";
	    
	    this.draw = function(ctx) {
		ctx.fillStyle = "#fff"
		ctx.fillRect(this.position.x0, this.position.y, this.size.height, this.size.width);
		ctx.lineWidth=1;
		ctx.fillStyle = "#ccc"
		ctx.font = "44px sans-serif";
	    }
	    
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
	
	var makeVel = function(){
	    return (Math.random() - .5) / 10;
	}
	
	
	Game.prototype =  {
	    draw: function(ctx) {
		
		
		if (this.coquette.entities.all(Ball).length == 0){
		    this.level += 1;
		    this.state = this.STATE.WIN;

		    console.log('you win');

		    $("#next").show();

		    /*
		    ctx.fillStyle = "#aaa"
		    ctx.fillRect(0, 0, 400, 400);
		    ctx.lineWidth=1;
		    ctx.fillStyle = "#fff"
		    
		    ctx.font = "44px sans-serif";
		    ctx.fillText("you win", 100, 100);
		    
		    ctx.font = "22px sans-serif";          
		    ctx.fillText("next level", 100, 140);
		    */


		    
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
		
	    }
	    
	};
	
	// Ball
	
	var Ball = function(game, settings){
	    this.game = game
	    // shame
	    for (var i in settings) {
		this[i] = settings[i];
	    }
	    this.size = { x:9, y:9 };

	    this.vel = {x: 20 * makeVel(), y: makeVel()} // This is just a vector?
	};
	
	
	Ball.prototype = {
	    
	    draw: function(ctx) {
		ctx.fillStyle = this.color();
		ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
	    },
	    
	    color: function(){
		if (this.shielded){
		    return "#0f0";
		} else {
		    return "#fff";
		}
	    },
	    
	    kill: function() {
		this.game.coquette.entities.destroy(this);
	    },
	    
	    update: function(tick) {
		
		var mx = this.vel.x * tick;
		var my = this.vel.y * tick;
		this.pos.x += mx;
		this.pos.y += my;
		
		//this.vel.x += .01 * Math.random() * Math.random() * plusMinus();
		//this.vel.y += .01 * Math.random() * Math.random() * plusMinus();
		
		if (!this.game.coquette.renderer.onScreen(this)) {
		    this.vel.x = -1 * this.vel.x
		    this.vel.y = -1 * this.vel.y	    
		}
		
	    }
	}
	
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
