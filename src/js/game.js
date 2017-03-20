(function() {

    $(document).ready(function() {

	var loaded = false; // Game has been loaded?

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

		this.coquette.entities.create(Snake, { 
		    game: game,
		    pos:{ x:249, y:110 }, 
		    color:"#0ff", // light blue
		    
		    SHOOT_DELAY: 300,
		    lastShot: 0,
		    dir: undefined,
		});
	    };



	    if (name == 'pong'){

		var x = width / 2;
		var y = height / 2;
		this.coquette.entities.create(Ball, { pos:{ x:x, y:y }});
		
		this.createPongWalls();

		this.coquette.entities.create(Paddle, { 
		    game: game,
		    pos:{ x:200, y:100 }, 
		    color:"#0ff", // light blue
		    
		    SHOOT_DELAY: 300,
		    lastShot: 0,
		});
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


	// This should be somewhere else.
	Game.prototype.createPongWalls = function(){

	    
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
	    $("#lose").show();
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
    
	$("#gamelist li").click(function(){
	    var game = $(this).html()
	    startGame(game);
	});
    });
    
})(window);
