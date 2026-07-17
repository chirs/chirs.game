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
		this.startLevel()
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

		this.startLevel()
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
		this.coquette.entities.create(Ball, {
		    pos: { x:x, y:y },
		    vel: {x: .4, y: .2} //20 * makeVel(), y: 5 * makeVel()} // This is just a vector?
		});
					    
		
		this.createPongWalls();

		this.coquette.entities.create(Paddle, { 
		    game: game,
		    pos:{ x:200, y:100 }, 
		    color:"#ff0", // light blue
		    controls: 1,
		});			

		this.coquette.entities.create(Paddle, { 
		    game: game,
		    pos:{ x: this.width - 200, y:100 }, 
		    color:"#0ff", // light blue
		    controls: 2,
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
			var settings = { pos: { x:x, y:y }, rank: 3 };
			this.coquette.entities.create(Asteroid, settings);
		    };
		};

		if (this.name == 'touch'){
		    for (var i=0; i < Math.pow(2, this.level); i++){
			var x = Math.random() * this.width;
			var y = Math.random() * this.height;
			this.coquette.entities.create(Adversary, { pos:{ x:x, y:y }}); // adversary
		    };
		};
	    };
	};

	Game.prototype.restart = function(){

	    
	    this.level = 0;
	    this.score = 0;
	    this.playing = false;
	    this.state = this.STATE.PLAY;

	    this.coquette.entities.all(Adversary).forEach(function (entity) {
		entity.kill(true); // remove this true call when you split out kill on Asteroids.
	    });

	    console.log("x");
	    $("#lose").hide();
	    console.log("x");	    

	    this.startLevel();
	    
	    
	};	

	Game.prototype.update = function(ctx){
	    if (this.coquette.entities.all(Adversary).length == 0 && this.coquette.entities.all(Ball).length == 0){
		this.playing = false;
		this.startLevel();
	    }

	};

	Game.prototype.wrapPosition = function(pos){
	    return {
		x: wrapPoint(pos.x, this.width),
		y: wrapPoint(pos.y, this.height),
	    }
	};


	Game.prototype.createPongWalls = function(){
	    // This should be somewhere else.
	    // Make the computations a little better.
	    var xLength = this.height - (50 * 2);
	    var wallLength = (xLength - 100) / 2;

	    var walls = [
		[25, 50, this.width-100, 'y'],
		[25, this.height - 50, this.width-100, 'y'],

		[25, 50, wallLength, 'x'],
		[25, wallLength+150, wallLength, 'x'],
		[this.width-75, 50, wallLength, 'x'],
		[this.width-75, wallLength+150, wallLength, 'x'],		
		]

	    for (var i=0; i < walls.length; i++){
		var props = walls[i]; // destructure?
		
		this.coquette.entities.create(Wall, {
		    pos: { x: props[0], y: props[1] },
		    length: props[2],
		    direction: props[3]
		})
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
	    this.drawControls(ctx);

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

	Game.prototype.drawControls = function(ctx){
	    ctx.lineWidth=1;
	    ctx.fillStyle = "#fff";
	    ctx.font = "12px sans-serif";
	    var xPos = this.width - 150;
	    if (this.name == "asteroids"){
		var controls = [
		    "↑: thrust",
		    "←: rotate ↺",
		    "→: rotate ↻",
		    "space: shoot"
		];
	    };
	    if (this.name == "touch"){
		var controls = [
		    "use the direction buttons",
		    "eat the white squares"
		];
	    };
	    if (this.name == "pong"){
		var controls = [
		    "s: p1 up",		    
		    "d: p1 down",
		    "↑: p2 up",
		    "↓: p2 down",
		];

	    };	    

	    for (var i=0; i < controls.length; i++){		
		ctx.fillText(controls[i], xPos, 20 * (i+1));
	    };
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
		return new Game("gameCanvas", t.width(), t.height(), game);
	    }
	};

	$("#gamelist li").click(function(){
	    var name = $(this).html()
	    var game = startGame(name);

	    $("#playagain").click(function(){
		game.restart();
	    });
	});
    });
    
})(window);
