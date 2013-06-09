(function( global ) {

var Graph = global.Graph = Class.extend({
    init: function( options ) {
        this.options = options || {};
    },

    addBend: function( parentNode, endOffset ) {
        //end.x = Math.min( Math.max( end.x, -limit.x + pathRadius ), limit.x - pathRadius );
        var start = parentNode.line[1].clone(),
            end = start.clone().add( endOffset ),
            bend = new Bend( start, end ),

            newLines = parentNode.chamfer( bend.line, 40, 4 ),
            parent = parentNode,
            newNode;

        for( var x = 0; x < newLines.length; x++ ) {
            newNode = newLines[ x ];
            console.log(newNode);

            newNode.parent = parent;
            parent.child = newNode;

            parent = newNode;
        }

        bend.parent = parent;
        parent.child = bend;

        parentNode.recalculate();
        bend.recalculate();

        return bend;
    },

    addZig: function( parentNode, dist ) {

        var sign = parentNode.angle > 90 ? -1 : 1,
            angle = parentNode.angle + ( sign * 90 );

        //Utils.dot( startNode.line[1] );

        // Hyptoenuse of icosolese right triangle is root2 * side
        var hypot = this.options.pathRadius * Math.SQRT2,
            newAngle = THREE.Math.degToRad( parentNode.angle + (sign * 135) );

        var start = parentNode.line[1].clone().add( new THREE.Vector3(
            Math.cos( newAngle ) * hypot,
            Math.sin( newAngle ) * hypot,
            0
        ));
        //for(var x = 0; x < 360; x+= 45 ) {
            //Utils.dot( startNode.line[1].clone().add(new THREE.Vector3(
                //Math.cos(THREE.Math.degToRad(x + startNode.angle)) * hypot,
                //Math.sin(THREE.Math.degToRad(x + startNode.angle)) * hypot,
                //0
            //)));
        //}

        // SOH CAH TOA to get second point of line
        var end = start.clone().add( new THREE.Vector3(
            Math.cos( THREE.Math.degToRad( angle ) ) * dist,
            Math.sin( THREE.Math.degToRad( angle ) ) * dist,
            0
        ));

        var zig = new Zig( start, end );

        zig.parent = parentNode;
        parentNode.child = zig;

        return zig;
    }

});

}(this));
