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
      this.draw = function(ctx) {
        ctx.fillStyle = this.color();
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
      };

      this.angry = false;
      this.vel = {x: makeVel(), y: makeVel()}

    };

    Adversary.prototype = {

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
