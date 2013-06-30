(function() {

  $(document).ready(function() {
    
    var loaded = false;


    var Game = function(canvasId, width, height) {
      var coq = new Coquette(this, canvasId, width, height, "#000");

      coq.entities.create(Person, { pos:{ x:843, y:40 }, color:"#099" }); // paramour
      coq.entities.create(Person, 
                          { pos:{ x:849, y:210 }, color:"#f07", // player
                            update: function() {
                              var SPEED = 2.4;

                              var directions = {
                              }

                              for (key in directions){
                                if (coq.inputter.state(key)){
                                  var d = directions[key];
                                  this.pos.x += d[0]
                                  this.pos.y += d[1]
                                }
                              }
                            },
                            collision: function(other) {
                              other.pos.y = this.pos.y; // follow the player
                            }
                          });
    };

    var Person = function(_, settings) {
      for (var i in settings) {
        this[i] = settings[i];
      }
      this.size = { x:20, y:20 };
      this.draw = function(ctx) {
        ctx.fillStyle = settings.color;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
      };
    };


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
