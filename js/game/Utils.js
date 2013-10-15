(function() {

var speed = function( val ) {
    if( val instanceof THREE.Vector3 || val instanceof THREE.Vector2 ) {
        return val.clone().multiplyScalar( Bub.Game.time.delta );
    }
    return val * Bub.Game.time.delta;
};

Bub.Utils = {

    textures: {},

    cap: function( vector, cap ) {
        if( vector.x > cap ) {
            vector.x = cap;
        }
        if( vector.x < -cap ) {
            vector.x = -cap;
        }
        if( vector.y > cap ) {
            vector.y = cap;
        }
        if( vector.y < -cap ) {
            vector.y = -cap;
        }
        if( vector.z > cap ) {
            vector.z = cap;
        }
        if( vector.z < -cap ) {
            vector.z = -cap;
        }
    },

    dot: function( vec, color, parent ) {

        var material = new THREE.MeshLambertMaterial({
            color: color || 0xff0000
        });
        var geometry = new THREE.SphereGeometry( 2, 4, 4 );
        var mesh = this.mesh = new THREE.Mesh( geometry, material );

        mesh.position.copy( vec );
        (parent || Bub.World.scene).add( mesh );
    },

    relativeToWorld: function( pos, vec ) {
        return new THREE.Vector3().addVectors( pos, vec );
    },

    worldToRelative: function( pos, vec ) {
        return new THREE.Vector3().subVectors( vec, pos );
    },

    randFloat: function( min, max ) {
        return Math.random() * ( max - min ) + min;
    },

    randInt: function( min, max ) {
        return Math.floor( Math.random() * ( max - min + 1 ) + min );
    },

    randArr: function( arr ) {
        return arr[ this.randInt( 0, arr.length - 1) ];
    },

    midPoint: function( a, b ) {
        return new THREE.Vector3().addVectors( a, b ).multiplyScalar( 0.5 );
    },

    // Thank you SO // http://stackoverflow.com/questions/2353268/java-2d-moving-a-point-p-a-certain-distance-closer-to-another-point
    // Given two positions A and B, figure out where to put B so that is has
    // moved dist closer to A
    vecMoveOffset: function( vec1, vec2, distance ) {
        var vecA = vec1.clone(),
            vecB = vec2.clone();

        return vecA.add( vecB.sub( vecA ).normalize().multiplyScalar( distance ));
    },

    vecSpeedOffset: function( vec1, vec2, speed ) {
        return Bub.Utils.vecMoveOffset( vec1, vec2, speed(speed) );
    },

    speed: speed,

    sign: function( num ) {
        return num ? num < 0 ? -1 : 1 : 0;
    },

    distance3d: function( a, b ) {
        // this uses sqrt internally, fyi
        return a.clone().sub( b ).length();
    },

    sphereCollision: function( position1, position2, radius1, radius2 ) {
        return Bub.Utils.distance3d( position1, position2 ) <= radius1 + radius2;
    },

    _extend: function( mixin, obj ) {
        var extended = $.extend( obj, Bub.Game.mixins[ mixin ] );

        if( extended._init ) {
            extended._init.call( extended );
        }

        return extended;
    },

    keyListen: function(key) {
        Mousetrap.bind(key, function() {
            Bub.World.keysDown[key] = true;
        });
        Mousetrap.bind(key, function() {
            delete Bub.World.keysDown[key];
        }, 'keyup');
    },

    loader: new THREE.JSONLoader(),

    loadModel: function( data ) {
        var deferred = Q.defer();
        this.loader.load( data, deferred.resolve );
        return deferred.promise;
    }
};

}());
