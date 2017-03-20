(function() {

    $(document).ready(function() {

	var loaded = false; // Is this necessary??

	var timePassed = function(last, interval) { return last + interval < new Date().getTime(); };	
	
	var wrapPoint = function(s, smax){
	    if (s < 0){ return s + smax; };
	    if (s > smax){ return s - smax; };
	    return s;
	};

	var makeVel = function(){
	    return (Math.random() - .5) / 10;
	};
	
	// find the center of a rectangle
	var center = function(obj) {
	    if(obj.pos !== undefined) {
		return {
		    x: obj.pos.x + (obj.size.x / 2),
		    y: obj.pos.y + (obj.size.y / 2),
		};
	    }
	};
	
	var Game = function(canvasId, width, height) {
	    
	    var game = this; // save for reference [necessary?]

	    this.coquette = new Coquette(this, canvasId, width, height, "#000");	    

	    this.width = width;
	    this.height = height
	    
	    this.score = 0;
	    this.level = 1;
	    
	    this.STATE = {
		PLAY: 0,
		LOSE: 1
	    }
	    
	    this.state = this.STATE.PLAY

	    this.coquette.entities.create(Spaceship, { 
		game: game,
		pos:{ x:250, y:100 }, 
		color:"#f00", // red

		angle: 0,
		vector: {x: 0, y: 0 },
		
		SHOOT_DELAY: 200,
		lastShot: 0,
	    });

	    this.startLevel();	    
	};

	Game.prototype.startLevel = function(){
	    if (this.playing == false){
		this.level += 1;		
		this.playing = true;
	    
		for (var i=0; i < 5; i++){
		    var x = Math.random() * this.width;
		    var y = Math.random() * this.height;
		    var settings = { pos: { x:x, y:y }, rank: 2 };
		    this.coquette.entities.create(Asteroid, settings);
		};
	    };
	};

	Game.prototype.update = function(ctx){
	    if (this.coquette.entities.all(Asteroid).length == 0){
		this.playing = false;
	    }

	    if (this.coquette.inputter.state(this.coquette.inputter['R'])){
		this.startLevel();
	    };
	};		

	Game.prototype.draw = function(ctx){

	    this.drawScore(ctx);
	    
	    if (this.coquette.entities.all(Asteroid).length == 0){
		this.level += 1;
		this.state = this.STATE.WIN;
		this.drawWin(ctx);
	    };
	    
	    if (this.state === this.STATE.LOSE){
		this.drawLose(ctx);
	    };
	};

	Game.prototype.drawWin = function(ctx){
	    console.log('you win');
	    $("#next").show();	    
	};

	Game.prototype.drawLose = function(ctx){
		ctx.fillStyle = "#ccc"
		ctx.fillRect(0, 0, 1020, 1020);
		ctx.lineWidth=1;
		ctx.fillStyle = "#666"
		
		ctx.font = "44px sans-serif";
		ctx.fillText("game over", 400, 100);
		
		ctx.font = "22px sans-serif";          
	    ctx.fillText("play again", 400, 140);
	};


	    	    

	Game.prototype.wrapPosition = function(pos){
	    return {
		x: wrapPoint(pos.x, this.width),
		y: wrapPoint(pos.y, this.height),
	    }
	};

	var Spaceship = function(game, settings) {
	    for (var i in settings) {
		this[i] = settings[i];
	    }
	    this.size = { x:25, y:25 };

	};
	
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
	    
	
	var Asteroid = function(game, settings){
	    this.game = game;
	    this.scale = 24;

	    for (var i in settings) {
		this[i] = settings[i];
	    }

	    this.size = { x: this.rank * this.scale, y: this.rank * this.scale };
	    
	    this.shielded = false;
	    this.shieldTime = new Date();

	    if (this.vel == undefined){
		this.vel = {x: makeVel(), y: makeVel()}
	    };
	};
	
	
	Asteroid.prototype.draw = function(ctx) {
		//ctx.fillStyle = this.color();
		ctx.fillStyle = "#fff";
		ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
	};
	    
	    
	Asteroid.prototype.color = function(){
	    if (this.shielded){
		return "#0f0";
	    } else {
		return "#fff";
	    }
	};
	    
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
		if (other instanceof Asteroid) {
		    this.kill();				    
		    other.kill();
		};
	};
	    
        Bullet.prototype.kill = function() {
		this.game.coquette.entities.destroy(this);
        };


	var startGame = function(){
	    if (loaded === false){
		loaded = true;
		var t = $(this)
		t.html('');
		t.append($('<canvas/>', {'id': 'gameCanvas','Width': t.width(), 'Height': t.height()}));
		new Game("gameCanvas", t.width(), t.height());
	    }
	};
    
	// Play
	$("#game").click(startGame);
	
    });
    
})(window);
