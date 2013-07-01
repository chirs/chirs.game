(function() {

  $(document).ready(function() {
    
    var loaded = false;

    var plusMinus = function(){
      if (Math.random() < .5){
        return -1;
      }
      return 1;
    }

    var Game = function(canvasId, width, height) {
      var self = this
      this.coquette = new Coquette(this, canvasId, width, height, "#000");

      for (var i=0; i < 20; i++){
        var x = Math.random() * width;
        var y = Math.random() * height;
        console.log([x,y]);
        this.coquette.entities.create(Adversary, { pos:{ x:x, y:y }}); // adversary
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

      this.coquette.entities.create(Person, { pos:{ x:249, y:110 }, color:"#f07", // player

                                    update: function() {

                                      var speed = 2;
                                      var keys = {
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

                                      if (self.coquette.inputter.state(self.coquette.inputter.SPACE)){
                                        var attached = getCollidingEntities(self.coquette.collider.collideRecords, this);
                                        for (var i=0; i < attached.length; i++){
                                          console.log(attached[i].pos);
                                          attached[i].pos.x += 10 * Math.random * this.speed * plusMinus()
                                          attached[i].pos.y += 10 * Math.random * this.speed * plusMinus()
                                          //attached[i].angry = true;
                                        };

                                      };

                                      for (key in keys){
                                        if (self.coquette.inputter.state(self.coquette.inputter[key])){
                                          var dir = keys[key]
                                          this.pos.x += dir[0];
                                          this.pos.y += dir[1];
                                        }
                                      }

                                      for (key in bullets){
                                        if (self.coquette.inputter.state(self.coquette.inputter[key])){
                                          var dir = bullets[key]
                                          var vel = {x: dir[0], y: dir[1] }
                                          self.coquette.entities.create(Bullet, { pos: {x: this.pos.x, y: this.pos.y }, vector: vel });
                                        }
                                      }



                                    },

                                    collision: function(other) {
                                      // follow the player
                                      if (other.angry){
                                        console.log("You lose");
                                      }
                                      else {
                                        other.pos.x = this.pos.x - .2
                                        other.pos.y = this.pos.y - .2
                                      }
                                    }
                                  });
    };

    var Person = function(_, settings) {
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

    var Adversary = function(_, settings){
      for (var i in settings) {
        this[i] = settings[i];
      }
      this.size = { x:9, y:9 };

      this.angry = false;
      this.vel = {x: makeVel(), y: makeVel()}

    };

    Adversary.prototype = {

      draw: function(ctx) {
        ctx.fillStyle = this.color();
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
      },
      
      color: function(){
        if (this.angry){
          return "#c3c";
        } else {
          return "#09c";
        }
      },

      
      update: function(tick) {
        if (Math.random() < .01){
          this.angry = !this.angry;
        };
        
        var mx = this.vel.x * tick;
        var my = this.vel.y * tick;
        this.pos.x += mx;
        this.pos.y += my;
        
        //if (!this.game.coquette.renderer.onScreen(this)) {
        //  this.kill();
        //}
      },
    }


    var Bullet = function(game, settings) {
      this.game = game;
      this.pos = settings.pos;
      this.vel = settings.vector;
    };

    Bullet.prototype = {
        size: { x:3, y:3 },
        speed: .4,

        update: function(tick) {

          var mx = this.vel.x * tick * this.speed;
          var my = this.vel.y * tick * this.speed;
          this.pos.x += mx;
          this.pos.y += my;

          if (!this.game.coquette.renderer.onScreen(this)) {
            this.kill();
          }
        },

        //draw: function(ctx) {
          //this.game.startClip(ctx);
          //this.game.circle(this.pos, this.size.x / 2, "#fff");
          //this.game.endClip(ctx);
        //},

        draw: function(ctx) {
          ctx.fillStyle = "#ccc";
          ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        },



        collision: function(other) {
          //if (other instanceof Asteroid) {
          //  this.kill();
        },

        kill: function() {
          //this.game.coquette.entities.destroy(this);
        }
    }
  






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
