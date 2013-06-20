(function( global ) {

var speed = function( val ) {
    if( val instanceof THREE.Vector3 ) {
        return val.clone().multiplyScalar( Game.time.delta );
    }
    return val * Game.time.delta;
};

var Utils = global.Utils = {

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
        var geometry = new THREE.SphereGeometry( 4, 4, 4 );
        var mesh = this.mesh = new THREE.Mesh( geometry, material );

        mesh.position.copy( vec );
        (parent || World.scene).add( mesh );
    },

    relativeToWorld: function( pos, vec ) {
        return new THREE.Vector3().addVectors( pos, vec );
    },

    worldToRelative: function( pos, vec ) {
        return new THREE.Vector3().subVectors( vec, pos );
    },

    create: function( obj ) {
        var made = {};

        for( var key in obj ) {
            made[ key ] = $.isPlainObject( obj[ key ] ) ? Utils.create( obj[ key ] ) : obj[ key ];
        }

        return made;
    },

    randFloat: function( min, max ) {
        return Math.random() * ( max - min ) + min;
    },

    randInt: function( min, max ) {
        return Math.floor( Math.random() * ( max - min + 1 ) + min );
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
        return Utils.vecMoveOffset( vec1, vec2, speed(speed) );
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
        return Utils.distance3d( position1, position2 ) < radius1 + radius2;
    },

    extend: function( mixin, obj ) {
        if( Game.initted ) {
            return this._extend( mixin, obj );
        } else {
            Game.mixers.push({ mixin: mixin, obj: obj });
            return obj;
        }
    },

    _extend: function( mixin, obj ) {
        var extended = $.extend( obj, Game.mixins[ mixin ] );

        if( extended._init ) {
            extended._init.call( extended );
        }

        return extended;
    },

    keyListen: function(key) {
        Mousetrap.bind(key, function() {
            World.keysDown[key] = true;
        });
        Mousetrap.bind(key, function() {
            delete World.keysDown[key];
        }, 'keyup');
    },

    loader: new THREE.JSONLoader(),

    loadModel: function( data ) {
        var deferred = Q.defer();
        this.loader.load( data, deferred.resolve );
        return deferred.promise;
    }
};

}(this));
