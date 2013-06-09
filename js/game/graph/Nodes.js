(function( global ) {

var point = function( x, y ) {
    var z = this.z || -40;
    return y !== undefined ?
        new THREE.Vector3( x, y, z ) :
        new THREE.Vector3( x.x, x.y, z );
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
            start = GraphNode.point( points[ x ] );
            end = GraphNode.point( points[ x + 1 ] );

            lines.push( new Chamfer( start, end ) );
        }

        this.line[1] = newA;
        nextLine[0].copy( newB );

        return lines;
    }

});

GraphNode.point = point;
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

var Stairs = global.Stairs = GraphNode.extend({ });

}(this));
