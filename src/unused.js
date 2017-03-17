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
