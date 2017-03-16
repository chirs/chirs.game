(function() {

    $(document).ready(function() {

	var loaded = false; // Game has been loaded?
	

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
		    
	
	var timePassed = function(last, interval) { return last + interval < new Date().getTime(); };
	
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

	    for (var i=0; i < 20; i++){
		var x = Math.random() * width;
		var y = Math.random() * height;
		this.coquette.entities.create(Pellet, { pos:{ x:x, y:y }}); // adversary
	    };

	    for (var i=0; i < 20; i++){
		createWall(width, height, this);
	    };	    
	    
	    
	    this.coquette.entities.create(Person, { 
		game: self,
		pos:{ x:249, y:110 }, 
		color:"#0ff", // light blue
		
		SHOOT_DELAY: 300,
		lastShot: 0,
		dir: undefined,
	    });
	
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
	
	
	var Person = function(game, settings) {
	    for (var i in settings) {
		this[i] = settings[i];
	    }
	    this.size = { x:10, y:10 };
	};

	Person.prototype.draw = function(ctx){
		ctx.fillStyle = "#ff0"; this.color;
		//ctx.arc(this.pos.x, this.pos.y, 10, 0, 2 * Math.PI);
		ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
		ctx.fill();		
	};

	Person.prototype.update = function() {

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
		if (trailExists.els.length > 20){
		    var tt = this.game.coquette.entities.all(Tail).pop();
		    this.game.coquette.entities.destroy(tt);
		};
	    }
	};
    
	 
	Person.prototype.kill = function() {
	    this.game.coquette.entities.destroy(this);
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
	trailExists.els2 = []	

	Person.prototype.collision = function(other) {
	    if (other instanceof Wall){
		this.kill();
	    }
	    //if (other instanceof Tail){
		// this.kill();
	    //}	    
	};
	

	// For doing grid-based operations.
	// Should be an object.
	var toGrid = function(pos){
	    var scale = 10; // 10x10 squares
	    return {
		x: Math.round(pos.x / scale),
		y: Math.round(pos.y / scale),
	    }
	};

	var fromGrid = function(pos){
	    var scale = 10;
	    return {
		x: 10 * pos.x,
		y: 10 * pos.y
	    }
	}


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



	
	var Pellet = function(game, settings) {
	    for (var i in settings) {
		this[i] = settings[i];
	    }
	    this.size = { x:10, y:10 };
	    this.game = game;
	};

	Pellet.prototype = {
	    draw: function(ctx){
		ctx.fillStyle = "#fff"; this.color;
		ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
		ctx.fill();		
	    },


	    kill: function() {
		this.game.coquette.entities.destroy(this);
	    },

	    
            collision: function(other) {
		if (other instanceof Person) {
		    this.kill();
		}

		if (other instanceof Wall) {
		    this.kill();
		}		
            },	    
	    
	    
	}	

	
	Game.prototype =  {
	    draw: function(ctx) {

		if (this.coquette.entities.all(Pellet).length == 0){
		    this.state = this.STATE.WIN;

		    ctx.fillStyle = "#ccc"
		    ctx.fillRect(0, 0, 1020, 1020);
		    ctx.lineWidth=1;
		    ctx.fillStyle = "#666"
		    
		    ctx.font = "44px sans-serif";
		    ctx.fillText("you win", 400, 100);
		    
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
		ctx.fillStyle = "#dbd"
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
