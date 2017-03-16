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
		var x = Math.random() * width;
		var y = Math.random() * height;
		this.coquette.entities.create(Adversary, { pos:{ x:x, y:y }}); // adversary
	    };

	    
	    this.coquette.entities.create(Person, { 
		game: self,
		pos:{ x:249, y:110 }, 
		color:"#f00", // red
		
		update: function() {
		    var speed = 2;
		    var directions = {
			'UP_ARROW': [0, -speed],
			'DOWN_ARROW': [0, speed],
			'LEFT_ARROW': [-speed, 0],
			'RIGHT_ARROW': [speed, 0],
		    } 
		    
		    for (key in directions){
			if (self.coquette.inputter.state(self.coquette.inputter[key])){
			    var dir = directions[key]
			    this.pos.x += dir[0];
			    this.pos.y += dir[1];
			}
		    }
		    

		},
		
		
		collision: function(other) {

		    if ((other instanceof Adversary) && (other.shielded === true)){
			    self.state = self.STATE.LOSE;			
		    }

		    if ((other instanceof Adversary) && (other.shielded === false)){
			other.kill();
		    }

		    
		}
	    });
	};
	
	
	var Person = function(game, settings) {
	    for (var i in settings) {
		this[i] = settings[i];
	    }
	    this.size = { x:9, y:9 };
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
		
		
		if (this.coquette.entities.all(Adversary).length == 0){
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
	
	
	Adversary.prototype = {
	    
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
		// shield or unshield the adversary
		/*
		if ((this.shielded === false) && (Math.random() < .01)){
		    this.shielded = true;
		    this.shieldTime = new Date()
		};
		
		if ((this.shielded === true) && (new Date() - this.shieldTime > 1000)){
		    this.shielded = false;
		};
		*/
		//this.shielded = true;
		
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
