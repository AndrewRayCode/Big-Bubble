Bub.GraphNode = function( line ) {
    this.line = line;
    this.recalculate();
};

Bub.GraphNode.prototype.recalculate = function() {
    var diff = new THREE.Vector3().subVectors( this.line[1], this.line[0] );
    this.angle = THREE.Math.radToDeg( Math.atan2( diff.y, diff.x ) );
    this.midPoint = Bub.Utils.midPoint( this.line[0], this.line[1] );
    this.length = Bub.Utils.distance3d( this.line[0], this.line[1] );
};

Bub.GraphNode.prototype.chamfer = function( nextLine, distance, subDivisions ) {
    var arr = arr || [],

        newA = Bub.Utils.vecMoveOffset( this.line[1], this.line[0], distance ),
        newB = Bub.Utils.vecMoveOffset( nextLine[0], nextLine[1], distance ),

        curve = new THREE.QuadraticBezierCurve( newA, this.line[1], newB ),

        points = curve.getPoints( subDivisions ),
        lines = [],
        start, end, geom;

    for( var x = 0; x < points.length - 1; x++ ) {
        start = Bub.GraphNode.to3dPoint( points[ x ], this.line[ 1 ].z );
        end = Bub.GraphNode.to3dPoint( points[ x + 1 ], this.line[ 1 ].z );

        lines.push( new Bub.Graph.Chamfer( start, end ) );
    }

    this.line[1] = newA;
    nextLine[0].copy( newB );

    return lines;
};

Bub.GraphNode.to3dPoint = function( point, z ) {
    return new THREE.Vector3( point.x, point.y, z );
};

Bub.GraphNode.line = function( point1, point2 ) {
    return [ point1, point2 ];
};

Bub.Graph.Bend = function( start, end ) {
    Bub.GraphNode.call( this, Bub.GraphNode.line( start, end ) );
};

Bub.Graph.Bend.prototype = Object.create( Bub.GraphNode.prototype );

Bub.Graph.Zig = function( start, end ) {
    Bub.GraphNode.call( this, Bub.GraphNode.line( start, end ) );
};

Bub.Graph.Zig.prototype = Object.create( Bub.GraphNode.prototype );

Bub.Graph.Chamfer = function( start, end ) {
    Bub.GraphNode.call( this, Bub.GraphNode.line( start, end ) );
};

Bub.Graph.Chamfer.prototype = Object.create( Bub.GraphNode.prototype );

Bub.Graph.Stairs = function( start, end ) {
    Bub.GraphNode.call( this, Bub.GraphNode.line( start, end ) );
};

Bub.Graph.Stairs.prototype = Object.create( Bub.GraphNode.prototype );
