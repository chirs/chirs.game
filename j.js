(function() {

  $(document).ready(function() {

    var DIRECTIONS = {
        UP: 0,
        RIGHT: 1,
        DOWN: 2,
        LEFT: 3,
    };

    
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


      // State management.
      this.STATE = {
        PLAY: 0,
        LOSE: 1
      }

      this.state = this.STATE.PLAY


      this.score = 0;
      this.pills = 10;
      this.pillsEaten = 0;


      for (var i=0; i < this.pills; i++){
        var x = Math.random() * width;
        var y = Math.random() * height;
        this.coquette.entities.create(Pill, { pos:{ x:x, y:y }, });
      };

      // Pacman.

      this.coquette.entities.create(Pacman, { 
        game: self,
        pos: { x: 249, y: 110 },
        color: "#ccc",
        direction: DIRECTIONS.LEFT,
        speed: 1,

        update: function() {
          var keys = {
            'UP_ARROW': DIRECTIONS.UP,
            'DOWN_ARROW': DIRECTIONS.DOWN,
            'LEFT_ARROW': DIRECTIONS.LEFT,
            'RIGHT_ARROW': DIRECTIONS.RIGHT,
          }
          
          for (key in keys){
            if (self.coquette.inputter.state(self.coquette.inputter[key])){
              this.direction = keys[key];
            };
          };

          switch (this.direction) {
          case DIRECTIONS.UP:
            this.pos.y -= this.speed; break;
          case DIRECTIONS.DOWN:
            this.pos.y += this.speed; break;
          case DIRECTIONS.LEFT:
            this.pos.x -= this.speed; break;
          case DIRECTIONS.RIGHT:
            this.pos.x += this.speed; break;
          }
        },


        collision: function(other) {
          if (other instanceof Pill){
            other.eat();
          }

          if (other instanceof Ghost){
                self.state = self.STATE.LOSE;
          }
        }
      });

      // Ghosts.
      var GHOSTS = ["red", "green", "blue", "purple"]

      for (var i=0; i < 4; i++){
        this.coquette.entities.create(Ghost, { pos:{ x:200, y:200 }, color: GHOSTS[i]}); 
      };

      // Blocks

      var BLOCKS = [
        //{color: "#999", pos: {x: 100, y: 100 }, width: 100, height: 200},
        //{color: "#999", pos: {x: 300, y: 100 }, width: 100, height: 200},
        //{color: "#999", pos: {x: 400, y: 100 }, width: 100, height: 200}
        {color: "#999", pos: {x: 400, y: 100 }}
      ]

      //for (var i=0; i < BLOCKS.length; i++){
      //  this.coquette.entities.create(Block, BLOCKS[i])
      //};
      


    };

    Game.prototype =  {
      draw: function(ctx) {

        if (this.state === this.STATE.LOSE){
        }

        ctx.lineWidth=1;
        ctx.fillStyle = "#390";
        ctx.font = "18px sans-serif";
        ctx.fillText("Score: " + this.score, 20, 20);

      }

    };



    // Pacman
    
    var Pacman = function(game, settings) {
      for (var i in settings) {
        this[i] = settings[i];
      }
      this.size = { x:20, y:20 };
      this.draw = function(ctx) {
        ctx.fillStyle = settings.color;
        ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
      };
    };



    // Block
    
    var Block = function(game, settings) {
      for (var i in settings) {
        this[i] = settings[i];
      }
      this.height = 20;
      this.width = 20;
      //this.height = settings.height;
      //this.width = settings.width;
      this.draw = function(ctx) {
        ctx.fillStyle = settings.color;
        //ctx.fillRect(this.pos.x, this.pos.y, this.height, this.width);
        ctx.fillRect(this.pos.x, this.pos.y, 20, 20);
      };
    };

    Block.prototype = {

      collision: function(other) {
        other.direction = null;
      }
      
    }
      


    // Ghosts 


    var Pill = function(game, settings){
      this.value = 10
      this.game = game
      this.pos = settings.pos;
      this.size = { height:10, width:10 };
    };


    Pill.prototype = {
      draw: function(ctx) {
        ctx.fillStyle = "#777";
        ctx.fillRect(this.pos.x, this.pos.y, this.size.height, this.size.width);
      },

      eat: function() {
        this.game.score += this.value;
        this.game.coquette.entities.destroy(this);
      },

    }

    var Ghost = function(game, settings){
      this.game = game
      for (var i in settings) {
        this[i] = settings[i];
      }
      this.size = { x:20, y:20 };


      this.shielded = false;
      this.shieldTime = new Date();
      this.direction = DIRECTIONS.RIGHT;
      this.speed = 1;
    };


    Ghost.prototype = {

      draw: function(ctx) {
        ctx.fillStyle = this.color;
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
        if ((this.shielded === false) && (Math.random() < .01)){
          this.shielded = true;
          this.shieldTime = new Date()
        };

        if ((this.shielded === true) && (new Date() - this.shieldTime > 1000)){
          this.shielded = false;
        };

        if (Math.random() < .1){
          this.direction = Math.floor(Math.random() * 4);
        };

        switch (this.direction) {
        case DIRECTIONS.UP:
          this.pos.y -= this.speed; break;
        case DIRECTIONS.DOWN:
          this.pos.y += this.speed; break;
        case DIRECTIONS.LEFT:
          this.pos.x -= this.speed; break;
        case DIRECTIONS.RIGHT:
          this.pos.x += this.speed; break;

        }

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
