// http://www.brandonheyer.com/2013/04/24/maze-generating-algorithms-fun-with-html-and-javascript/

Bub.Graph = function( options ) {
    this.options = options || {};
};

Bub.Graph.prototype.addBend = function( parentNode, endOffset ) {
    var start = parentNode.line[1].clone(),
        end = start.clone().add( endOffset ),
        bend = new Bub.Graph.Bend( start, end ),

        newLines = parentNode.chamfer( bend.line, this.options.pathRadius, 4 ),
        parent = parentNode,
        newNode;

    for( var x = 0; x < newLines.length; x++ ) {
        newNode = newLines[ x ];

        newNode.parent = parent;
        parent.child = newNode;

        parent = newNode;
    }

    bend.parent = parent;
    parent.child = bend;

    parentNode.recalculate();
    bend.recalculate();

    return bend;
};

Bub.Graph.prototype.addZig = function( parentNode, dist ) {

    var sign = parentNode.angle > 90 ? -1 : 1,
        angle = parentNode.angle + ( sign * 90 );

    //Bub.Utils.dot( startNode.line[1] );

    // Hyptoenuse of icosolese right triangle is root2 * side
    var hypot = this.options.pathRadius * Math.SQRT2,
        newAngle = THREE.Math.degToRad( parentNode.angle + (sign * 135) );

    var start = parentNode.line[1].clone().add( new THREE.Vector3(
        Math.cos( newAngle ) * hypot,
        Math.sin( newAngle ) * hypot,
        0
    ));

    // SOH CAH TOA to get second point of line
    var end = start.clone().add( new THREE.Vector3(
        Math.cos( THREE.Math.degToRad( angle ) ) * dist,
        Math.sin( THREE.Math.degToRad( angle ) ) * dist,
        0
    ));

    var zig = new Bub.Graph.Zig( start, end );

    zig.parent = parentNode;
    parentNode.child = zig;

    return zig;
};

Bub.Graph.prototype.addStairs = function( parentNode, zigged, options ) {
    var start, end;

    if( zigged ) {
        var sign = parentNode.angle > 90 ? -1 : 1,
            angle = parentNode.angle + ( sign * 90 );

        // Hyptoenuse of icosolese right triangle is root2 * side
        var hypot = this.options.pathRadius * Math.SQRT2,
            newAngle = THREE.Math.degToRad( parentNode.angle + (sign * 135) );

        start = parentNode.line[1].clone().add( new THREE.Vector3(
            Math.cos( newAngle ) * hypot,
            Math.sin( newAngle ) * hypot,
            0
        ));

        // SOH CAH TOA to get second point of line
        end = start.clone().add( new THREE.Vector3(
            Math.cos( THREE.Math.degToRad( angle ) ) * options.length,
            Math.sin( THREE.Math.degToRad( angle ) ) * options.length,
            options.rise
        ));
    } else {
        start = parentNode.line[1].clone();
        end = start.clone().add( new THREE.Vector3(
            Math.cos( THREE.Math.degToRad( parentNode.angle ) ) * options.length,
            Math.sin( THREE.Math.degToRad( parentNode.angle ) ) * options.length,
            options.rise
        ));
    }

    var stair = new Bub.Graph.Stairs( start, end );

    $.extend( stair, options );

    stair.parent = parentNode;
    parentNode.child = stair;

    return stair;
};
