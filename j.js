(function() {

  $(document).ready(function() {
    
    var loaded = false;


    var Game = function(canvasId, width, height) {
      var self = this
      this.coquette = new Coquette(this, canvasId, width, height, "#000");

      for (var i=0; i < 20; i++){
        var x = Math.random() * width;
        var y = Math.random() * height;
        console.log([x,y]);
        this.coquette.entities.create(Adversary, { pos:{ x:x, y:y }, color:"#099" }); // paramour

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

                                      for (key in keys){
                                        if (self.coquette.inputter.state(self.coquette.inputter[key])){
                                          var dir = keys[key]
                                          this.pos.x += dir[0];
                                          this.pos.y += dir[1];
                                        }
                                      }


                                    },
                                    collision: function(other) {
                                      // follow the player
                                      other.pos.x = this.pos.x - .2
                                      other.pos.y = this.pos.y - .2
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
      this.draw = function(ctx) {
        ctx.fillStyle = settings.color;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
      };

      this.vel = {x: makeVel(), y: makeVel()}

    };

    Adversary.prototype = {
      update: function(tick) {


        var mx = this.vel.x * tick;
        var my = this.vel.y * tick;
        this.pos.x += mx;
        this.pos.y += my;

        //if (!this.game.coquette.renderer.onScreen(this)) {
        //  this.kill();
        //}
      },
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
