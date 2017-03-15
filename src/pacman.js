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



	    this.coquette.entities.create(Wall, {
		game: self,
		pos: {x: 25, y: 25 },
		length: 300,
		direction: 'x'
	    })

	    this.coquette.entities.create(Wall, {
		game: self,
		pos: {x: 625, y: 25 },
		length: 300,
		direction: 'x'
	    })

	    this.coquette.entities.create(Wall, {
		game: self,
		pos: {x: 25, y: 25 },
		length: 600,
		direction: 'y'
	    })

	    this.coquette.entities.create(Wall, {
		game: self,
		pos: {x: 25, y: 325 },
		length: 600,
		direction: 'y'
	    })	    


	    
	    this.coquette.entities.create(Person, { 
		game: self,
		pos:{ x:249, y:110 }, 
		color:"#0ff", // light blue
		
		SHOOT_DELAY: 300,
		lastShot: 0,
		dir: undefined,
		
		
		update: function() {
		    var speed = 2;

		    var speed = 2;

		    this.directions = {
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
		    
		    
		    for (key in this.directions){
			if (self.coquette.inputter.state(self.coquette.inputter[key])){
			    this.direction = key;
			    this.dir = this.directions[key]
			    //var dir = directions[key]
			}
			if (this.dir){
			    this.pos.x += this.dir[0];
			    this.pos.y += this.dir[1];
			}
		    
		    }

		},
		
		
		collision: function(other) {

		    if (other instanceof Wall){
			this.direction = this.OPPOSITES[this.direction];
			this.dir = this.directions[this.direction];
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
	
	
	Game.prototype =  {
	    draw: function(ctx) {
		
		
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
