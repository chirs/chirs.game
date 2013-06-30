(function() {

  $(document).ready(function() {
    
    var loaded = false;

    var gameCanvas, gameContext;


    $("#game").click(function(){
      if (loaded === false){
        loaded = true;
        var t = $(this)
        t.html('');
        t.append($('<canvas/>', {'id': 'gameCanvas','Width': t.width(), 'Height': t.height()}));
        gameCanvas = document.getElementById("gameCanvas");
        gameContext = gameCanvas.getContext('2d');

        $("#gameCanvas").click(function(){
          alert("playing!");
        })

      }
    });

  });

}).call(this);
