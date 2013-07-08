(function() {

  $(document).ready(function() {
    
    var loaded = false;

    var plusMinus = function(){
      if (Math.random() < .5){
        return -1;
      }
      return 1;
    }

    var timePassed = function(last, interval) { return last + interval < new Date().getTime(); };
    
    var center = function(obj) {
      if(obj.pos !== undefined) {
        return {
          x: obj.pos.x + (obj.size.x / 2),
          y: obj.pos.y + (obj.size.y / 2),
        };
      }
    };

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
      var self = this
      this.coquette = new Coquette(this, canvasId, width, height, "#000");

      this.score = 0

      this.STATE = {
        PLAY: 0,
        LOSE: 1
      }

      this.state = this.STATE.PLAY

      for (var i=0; i < 20; i++){
        var x = Math.random() * width;
        var y = Math.random() * height;
        this.coquette.entities.create(Adversary, { pos:{ x:x, y:y }}); // adversary
      };




      this.coquette.entities.create(Person, { 
        game: self,
        pos:{ x:249, y:110 }, 
        color:"#f07", // player


        SHOOT_DELAY: 300,
        lastShot: 0,

        shootBullet: function(vector){
          if (timePassed(this.lastShot, this.SHOOT_DELAY)) {
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
            'LEFT_ARROW': [-speed, 0],
            'RIGHT_ARROW': [speed, 0],
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

        if (this.state === this.STATE.LOSE){
          ctx.fillStyle = "#fff"
          ctx.fillRect(0, 0, 500, 500);
          ctx.lineWidth=1;
          ctx.fillStyle = "#ccc"
          ctx.font = "44px sans-serif";
          ctx.fillText("You Lose", 700, 100);
        };

        ctx.lineWidth=1;
        ctx.fillStyle = "#390";
        ctx.font = "18px sans-serif";
        ctx.fillText("Score: " + this.score, 20, 20);

      }

    };

    // Adversar

    var Adversary = function(game, settings){
      this.game = game
      for (var i in settings) {
        this[i] = settings[i];
      }
      this.size = { x:9, y:9 };

      this.shielded = false;
      this.vel = {x: makeVel(), y: makeVel()}

    };
    

    Adversary.prototype = {

      draw: function(ctx) {
        ctx.fillStyle = this.color();
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
      },
      
      color: function(){
        if (this.shielded){
          return "#c3c";
        } else {
          return "#09c";
        }
      },

      kill: function() {
        this.game.coquette.entities.destroy(this);
      },


      
      update: function(tick) {
        if (Math.random() < .01){
          this.shielded = !this.shielded;
        };
        
        var mx = this.vel.x * tick;
        var my = this.vel.y * tick;
        this.pos.x += mx;
        this.pos.y += my;
        
        //if (!this.game.coquette.renderer.onScreen(this)) {
        //  this.kill();
        //}
      }
    }

    // Bullet.

    var Bullet = function(game, settings) {
      this.game = game;
      this.pos = settings.pos;
      this.vel = settings.vector;
    };

    Bullet.prototype = {
        size: { x:3, y:3 },
        speed: .1,

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
          if (other instanceof Adversary) {
            this.kill();
            if (other.shielded === false){
              this.game.score += 1;
              other.kill();
            }
          }
        },

        kill: function() {
          this.game.coquette.entities.destroy(this);
        }
    }
  
    // Play

    $("#game").click(function(){
      if (loaded === false){
        loaded = true;
        var t = $(this)
        t.html('');
        t.append($('<canvas/>', {'id': 'gameCanvas','Width': t.width(), 'Height': t.height()}));
        new Game("gameCanvas", t.width(), t.height());
      }
    });

  });

}).call(this);
