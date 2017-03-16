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


	var wrapPosition = function(pos){
	    var xLimit = 500;
	    var yLimit = 500;
	    
	    var x = pos.x;
	    var y = pos.y;

	    var ny = y;
	    var nx = x;
	    
	    if (y < 0){
		var ny = y + yLimit;
	    }
	    if (y > yLimit){
		var ny = y - yLimit;
	    }

	    if (x < 0){
		var nx = x + xLimit;
	    }
	    if (x > xLimit){
		var nx = x - xLimit;
	    }

	    return {
		x: nx,
		y: ny,
	    }
		
	};
	    

	
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

	    for (var i=0; i < 5; i++){
		var x = Math.random() * width;
		var y = Math.random() * height;
		this.coquette.entities.create(Adversary,
					      {
						  pos: { x:x, y:y },
						  rank: 3, 
					      }); // adversary
	    };

	    
	    this.coquette.entities.create(Person, { 
		game: self,
		pos:{ x:249, y:110 }, 
		color:"#f00", // red

		angle: 0,
		momentum_vector: {x: 0, y: 0 },
		
		SHOOT_DELAY: 200,
		lastShot: 0,
		
		shootBullet: function(vector) {
		    if (timePassed(this.lastShot, this.SHOOT_DELAY) && (this.game.state !== this.game.STATE.LOSE) ) {
			//var c = center(this);
			this.game.coquette.entities.create(Bullet, {
			    pos: { x : this.pos.x, y: this.pos.y },
			    vector, vector,
			    owner: this,
			});
			
			this.lastShot = new Date().getTime();
		    }
		},
		
		update: function() {
		    var speed = 4;

		    // accelerate
		    if (self.coquette.inputter.state(self.coquette.inputter['UP_ARROW'])){
			this.momentum_vector.x += .02 * Math.sin(this.angle)
			this.momentum_vector.y += .02 * Math.cos(this.angle)			
		    }			

		    // drag
		    this.momentum_vector.x *= .997
		    this.momentum_vector.y *= .997

			
		    this.pos.x += speed * this.momentum_vector.x;
		    this.pos.y += speed * this.momentum_vector.y;


		    if (self.coquette.inputter.state(self.coquette.inputter['S'])){
			this.angle += .04;
		    }

		    if (self.coquette.inputter.state(self.coquette.inputter['D'])){
			this.angle -= .04;
		    }
		    
		    //if (self.coquette.inputter.state(self.coquette.inputter['B'])){
		    if (self.coquette.inputter.state(self.coquette.inputter['SPACE'])){			
			    var vel = {x: Math.sin(this.angle), y: Math.cos(this.angle) };
			    this.shootBullet(vel);
		    }

		    if (!this.game.coquette.renderer.onScreen(this)) {
			console.log("off")
			//console.log(this.pos);
			console.log(wrapPosition(this.pos));
			this.pos = wrapPosition(this.pos);
			    
		    }
		    
		},
		
		
		collision: function(other) {
		    if (other.shielded){
			// Should block collision.
		    }
		    else {
			if ((other instanceof Adversary) && (other.shielded === false)){
			    self.state = self.STATE.LOSE;
			}
		    }
		}
	    });
	};
	

	var Person = function(game, settings) {
	    for (var i in settings) {
		this[i] = settings[i];
	    }
	    this.size = { x:25, y:25 };

	};
	
	var makeVel = function(){
	    return (Math.random() - .5) / 10;
	}

	Person.prototype = {
	    draw: function(ctx){
		ctx.fillStyle = this.color;
		//ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);



		ctx.strokeStyle="#FF0000";
		ctx.moveTo(this.pos.x,this.pos.y);
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, 10, 0, 2 * Math.PI);
		ctx.stroke();		


		ctx.beginPath();
		ctx.moveTo(this.pos.x,this.pos.y);		
		ctx.lineTo(this.pos.x + Math.sin(this.angle) * 20, this.pos.y + Math.cos(this.angle) * 20);

		ctx.stroke();
	    }
	}
	
	
	Game.prototype =  {
	    draw: function(ctx) {
		
		
		if (this.coquette.entities.all(Adversary).length == 0){
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
		
	    }
	    
	};
	
	// Adversary
	
	var Adversary = function(game, settings){
	    this.game = game

	    for (var i in settings) {
		this[i] = settings[i];
	    }

	    this.size = { x: this.rank * 9, y: this.rank * 9 };
	    
	    this.shielded = false;
	    this.shieldTime = new Date();

	    if (this.vel == undefined){
		this.vel = {x: makeVel(), y: makeVel()}
	    };
	};
	
	
	Adversary.prototype = {
	    
	    draw: function(ctx) {
		//ctx.fillStyle = this.color();
		ctx.fillStyle = "#fff";
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
		if (this.rank > 1){
		    this.game.coquette.entities.create(Adversary, {pos: { x: this.pos.x, y: this.pos.y },
							      vel: { x: this.vel.y, y: this.vel.x },
							      rank: this.rank - 1
							     })
		    this.game.coquette.entities.create(Adversary, {pos: { x: this.pos.x, y: this.pos.y },
							      vel: { x: -1 * this.vel.y, y: -1 * this.vel.x },
							      rank: this.rank - 1
							     })		    
		    
		}

	    },
	    
	    update: function(tick) {
		
		var mx = this.vel.x * tick;
		var my = this.vel.y * tick;
		this.pos.x += mx;
		this.pos.y += my;
		
		if (!this.game.coquette.renderer.onScreen(this)) {
		    this.pos = wrapPosition(this.pos);
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
            speed: .5,
	    
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
		ctx.fillStyle = "#99f";		
		ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
            },
	    
            collision: function(other) {



		if (other instanceof Adversary) {
		    this.kill();				    
		    other.kill();
		    /*
		    if (other.shielded === false){
			if (this.game.state === this.game.STATE.PLAY){
			    this.game.score += 1;
			}
			other.kill();
		    }
		    */
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
