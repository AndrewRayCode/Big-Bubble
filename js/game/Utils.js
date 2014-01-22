(function() {

var speed = function( val ) {
    if( val instanceof THREE.Vector3 || val instanceof THREE.Vector2 ) {
        return val.clone().multiplyScalar( Bub.Game.time.delta );
    }
    return val * Bub.Game.time.delta;
};

Bub.Utils = {

    explosion: function( position, size ) {
        position = position.clone();

        var radius = size / 2,
            sparks1, sparks2, fireSparks, smoke, flame1, flame2;
            
        sparks1 = Bub.Particle.register( {}, {
            //texture: Bub.Assets.textures.explosionParticle,
            maxAge: 0.4
        }, {
            position: position,
            type: 'sphere',
            radius: radius * 0.1,
            speed: 300,
            colorize: true,
            colorStart: new THREE.Color( 0xff0000 ),
            colorEnd: new THREE.Color( 0xff0000 ),
            opacityStart: 1.0,
            opacityEnd: 1.0,
            sizeStart: 10,
            sizeEnd: 5,
            particlesPerSecond: 2000,
            emitterDuration: 0.01,
        });

        sparks2 = Bub.Particle.register( {}, {
            //texture: THREE.ImageUtils.loadTexture('./img/smokeparticle.png'),
            maxAge: 0.8
        }, {
            position: position,
            type: 'sphere',
            radius: radius * 0.2,
            speed: 350,
            colorize: true,
            colorStart: new THREE.Color( 0xffffff ),
            colorEnd: new THREE.Color( 0xffffff ),
            opacityStart: 1.0,
            opacityEnd: 1.0,
            sizeStart: 10,
            sizeEnd: 5,
            particlesPerSecond: 1000,
            emitterDuration: 0.05,
        });

        fireSparks = Bub.Particle.register( {}, {
            texture: Bub.Assets.textures.explosionParticle,
            maxAge: 0.75,
            blending: THREE.AdditiveBlending
        }, {
            position: position,
            type: 'sphere',
            radius: radius * 0.1,
            angle: 0,
            angularVelocity: 0,
            angularVelocitySpread: 4,
            speed: 70,
            colorize: true,
            colorStartSpread: new THREE.Vector3( 1.2, 1.2, 1.2 ),
            colorStart: new THREE.Color( 0xffff00 ),
            colorEnd: new THREE.Color( 0x882200 ),
            opacityStart: 0.1,
            opacityMiddle: 0.7,
            opacityEnd: 0.0,
            sizeStart: 100,
            sizeEnd: 80,
            particlesPerSecond: 1000,
            emitterDuration: 0.05,
        });

        Bub.Game.timeout( 50, function() {
            //smoke = Bub.Particle.register( {}, {
                //texture: Bub.Assets.textures.volumeParticle3,
                //blending: THREE.NormalBlending,
                //maxAge: 0.8,
                //renderDepth: 0.0
            //}, {
                //position: position.clone().setZ( -100 ),
                //type: 'sphere',
                //colorize: true,
                //colorStart: new THREE.Color( 0x222222 ),
                //colorEnd: new THREE.Color( 0x000000 ),
                //radius: radius * 0.5,
                //speed: 30,
                //sizeSpread: 10,
                //particlesPerSecond: 1000,
                //particleRotation: 0,
                //particleRotationSpread: Math.PI,
                //sizeStart: size * 1.5,
                //opacityStart: 0.0,
                //opacityMiddle: 0.5,
                //opacityEnd: 0,
                //emitterDuration: 0.3
            //});
        });

        flame1 = Bub.Particle.register( {}, {
            texture: Bub.Assets.textures.flame,
            blending: THREE.NormalBlending,
            maxAge: 0.8,
            renderDepth: 1
        }, {
            type: 'sphere',
            radius: radius * 0.3,
            colorize: true,
            colorStart: new THREE.Color( 0xfefeda ),
            colorStartSpread: new THREE.Vector3( 1.2, 1.2, 1.2 ),
            //colorEnd: new THREE.Color( 0xf87115 ),
            colorEnd: new THREE.Color( 0xf84515 ),
            //colorStart: new THREE.Color( 0xffffff ),
            //colorEnd: new THREE.Color( 0xffffff ),
            position: position,
            speed: 15,
            sizeSpread: 10,
            angle: 0,
            angularVelocity: 0,
            angularVelocitySpread: 2,
            particleRotation: 0,
            particleRotationSpread: Math.PI,
            particlesPerSecond: 4000,
            sizeStart: size * 2,
            sizeEnd: size * 2,
            opacityStart: 0,
            opacityMiddle: 0.2,
            opacityEnd: 0,
            emitterDuration: 0.01
        });

        Bub.Game.timeout( 20, function() {
            flame2 = Bub.Particle.register( {}, {
                texture: Bub.Assets.textures.volumeParticle1,
                blending: THREE.AdditiveBlending,
                maxAge: 0.8
            }, {
                position: position,
                type: 'sphere',
                colorize: true,
                colorStart: new THREE.Color( 0xfefeda ),
                colorEnd: new THREE.Color( 0xf87115 ),
                //colorStart: new THREE.Color( 0xffffff ),
                //colorEnd: new THREE.Color( 0xffffff ),
                radius: radius * 0.4,
                speed: 10,
                //velocity: new THREE.Vector3( 0, 0, 0 ),
                //acceleration: new THREE.Vector3( 0, 0, 0 ),
                sizeSpread: 10,
                particleRotation: 0,
                particleRotationSpread: Math.PI,
                particlesPerSecond: 100,
                angle: 0,
                angularVelocity: 1,
                //angularVelocitySpread: 3,
                sizeStart: size * 2,
                sizeEnd: size * 2,
                opacityStart: 0,
                opacityMiddle: 0.7,
                opacityEnd: 0,
                emitterDuration: 0.04
            });
        });

        Bub.Game.timeout( 1000, function() {
            Bub.Particle.destroy( sparks1 );
            Bub.Particle.destroy( sparks2 );
            Bub.Particle.destroy( fireSparks );
            //Bub.Particle.destroy( smoke );
            Bub.Particle.destroy( flame1 );
            Bub.Particle.destroy( flame2 );
        });
    },

    getKey: function( obj ) {
        return Object.keys( obj )[0];
    },

    getValue: function( obj ) {
        for( var key in obj ) {
            return obj[ key ];
        }
    },

    limit: function( vector, cap ) {
        if( vector.length() > cap ) {
            vector.normalize().multiplyScalar( cap );
        }
    },

    vcap: function( vector, min, max ) {
        if( max === undefined ) {
            min = -min;
            max = -min;
        }

        if( vector.x > max ) {
            vector.x = max;
        }
        if( vector.x < min ) {
            vector.x = min;
        }
        if( vector.y > max ) {
            vector.y = max;
        }
        if( vector.y < min ) {
            vector.y = min;
        }
        if( vector.z > max ) {
            vector.z = max;
        }
        if( vector.z < min ) {
            vector.z = min;
        }
    },

    cap: function( val, min, max ) {
        if( max === undefined ) {
            min = max;
            max = -min;
        }

        if( val > max ) {
            return max;
        }
        if( val < min ) {
            return min;
        }

        return val;
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

    // This should probably just be distanceTo?
    distance3d: function( a, b ) {
        // this uses sqrt internally, fyi
        return a.clone().sub( b ).length();
    },

    roughDistance: function( a, b ) {
        return a.clone().sub( b ).lengthManhattan();
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

    promisfy: function( scope, fName, names ) {
        return function() {
            var deferred = Q.defer(),
                args = Array.prototype.slice.call(arguments, 0) || [];

            args.push(function() {
                var ret = {};

                if( names ) {
                    for( var x = 0; x < names.length; x++ ) {
                        ret[ names[ x ] ] = arguments[ x ];
                    }
                } else {
                    ret = arguments[ 0 ];
                }
                deferred.resolve( ret );
            });

            scope[ fName ].apply( scope, args );

            return deferred.promise;
        };
    }

};

// Default a now() function to use window performance API if we have it. This
// is currently mainly to match what Tween.js uses so our Tween.update( time )
// call is passed the correct time type
Bub.Utils.now = window.performance ? function() {
    return window.performance.now();
} : function() {
    return Date.now();
};

}());
