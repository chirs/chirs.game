var timePassed = function(last, interval) { return last + interval < new Date().getTime(); };

var plusMinus = function(){
    // 50/50 [coin flip]
    if (Math.random() < .5){
	return -1;
    }
    return 1;
};

var wrapPoint = function(s, smax){
    if (s < 0){ return s + smax; };
    if (s > smax){ return s - smax; };
    return s;
};

var makeVel = function(){
    return (Math.random() - .5) / 10;
}

var getWallEnd = function(pos, direction, length){
    if (direction == 'x'){
	return { x: pos.x, y: pos.y + length };
    } else {
	return { x: pos.x + length, y: pos.y };
    }
};

var oppositeDirection = function(d){
    if (d == 'x'){
	return 'y';
    } else {
	return 'x';
    }
};

var createWall = function(width, height, game){
    
    var x = Math.random() * width;
    var y = Math.random() * height;	    
    
    
    var length = Math.random() * height / 4;
    if (Math.random() > .5){
	var direction = 'x';
    } else {
	var direction = 'y';
    }
    
    var pos = { x: x, y: y }
    
    game.coquette.entities.create(Wall, {
	game: self,
	pos: pos,
	length: length,
	direction: direction 
    })
    
    var nPos = getWallEnd(pos, direction, length);
    
    var length = Math.random() * height / 4;
    
    var x = nPos.x
    var y = nPos.y
    
    game.coquette.entities.create(Wall, {
	game: self,
	pos: { x: x, y: y },
	length: length,
	direction: oppositeDirection(direction)
    })		
};	
	



