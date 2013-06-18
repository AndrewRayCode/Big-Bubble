(function( global ) {

var to3dPoint = function( point, z ) {
    return new THREE.Vector3( point.x, point.y, z );
};

var line = function( point1, point2 ) {
    return [ point1, point2 ];
};

var GraphNode = global.GraphNode = Class.extend({

    init: function( line ) {
        this.line = line;
        this.recalculate();
    },

    recalculate: function() {
        var diff = new THREE.Vector3().subVectors( this.line[1], this.line[0] );
        this.angle = THREE.Math.radToDeg( Math.atan2( diff.y, diff.x ) );
        this.midPoint = Utils.midPoint( this.line[0], this.line[1] );
        this.length = Utils.distance3d( this.line[0], this.line[1] );
    },

    chamfer: function( nextLine, distance, subDivisions ) {
        var arr = arr || [],

            newA = Utils.vecMoveOffset( this.line[1], this.line[0], distance ),
            newB = Utils.vecMoveOffset( nextLine[0], nextLine[1], distance ),

            curve = new THREE.QuadraticBezierCurve( newA, this.line[1], newB ),

            points = curve.getPoints( subDivisions ),
            lines = [],
            start, end, geom;

        for( var x = 0; x < points.length - 1; x++ ) {
            start = GraphNode.to3dPoint( points[ x ], this.line[ 1 ].z );
            end = GraphNode.to3dPoint( points[ x + 1 ], this.line[ 1 ].z );

            lines.push( new Chamfer( start, end ) );
        }

        this.line[1] = newA;
        nextLine[0].copy( newB );

        return lines;
    }

});

GraphNode.to3dPoint = to3dPoint;
GraphNode.line = line;

var Bend = global.Bend = GraphNode.extend({
    init: function( start, end ) {
        this._super( line( start, end ) );
    }
});

var Zig = global.Zig = GraphNode.extend({
    init: function( start, end ) {
        this._super( line( start, end ) );
    }
});

var Chamfer = global.Chamfer = GraphNode.extend({
    init: function( start, end ) {
        this._super( line( start, end ) );
    }
});

var Stairs = global.Stairs = GraphNode.extend({
    init: function( start, end ) {
        this._super( line( start, end ) );
    }
});

}(this));
