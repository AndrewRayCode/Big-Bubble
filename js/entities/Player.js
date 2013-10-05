(function( global ) {

var Player = global.Player = Mixin.Entity.create({

    defaults: {
        build: {
            radius: 10,
            scale: 1,
            segments: 36
        },
        phys: {
            inertia: new THREE.Vector3( 0, 0, 0 ),
            acceleration: 27,
            deceleration: 15,
            max: 400,
            amplitude: 0,
            friction: 2
        }
    },

    vertices: {
        back: [],
        bottom: []
    },

    init: function() {
        this.id = 0;
        this._super();
    },

    load: function() {
        var build = this.build,
            geometry = this.geometry = new THREE.SphereGeometry( this.build.radius, this.build.segments, this.build.segments ),
            mesh = this.mesh = new THREE.Mesh( geometry, Shader.shaders.fresnel() ),
            vertexIndex = mesh.geometry.vertices.length - 1,
            v;

        // Force player bubble drawing over all other bubbles to avoid
        // z-fighting during bubble intersection
        mesh.renderDepth = 1000;

        while( v = mesh.geometry.vertices[ vertexIndex-- ] ) {
            if( v.z <= 0 && v.z > -8) {
                if( v.y < 0 ) {
                    this.vertices.back.push( v );
                }
            } else if( v.z < -8 && v.y <= 4 ) {
                this.vertices.bottom.push( v );
            }
        }

        this.vertices.bottom.sort(function( a, b ) {
            return a.z - b.z;
        });

        World.scene.add( mesh );
    },

    reset: function() {
        this.resetDefaults();
        this.build.origRadius = this.build.targetRadius = this.build.radius;

        this.mesh.position.x = 0;
        this.mesh.position.y = 0;
        this.mesh.position.z = 0;
        this.scale( this.build.radius );
    },

    keyCheck: function() {
        var phys = this.phys,
            inertia = this.phys.inertia;

        if( World.keysDown.right ) {
            inertia.x += phys.acceleration;
        } else if( World.keysDown.left ) {
            inertia.x -= phys.acceleration;
        } else if ( inertia.x ) {
            inertia.x -= Utils.sign( inertia.x ) * phys.deceleration;

            if( Math.abs( inertia.x ) <= phys.deceleration ) {
                inertia.x = 0;
            }
        }

        if( World.keysDown.up ) {
            inertia.y += phys.acceleration;
        } else if( World.keysDown.down ) {
            inertia.y -= phys.acceleration;
        } else if ( inertia.y ) {
            inertia.y -= Utils.sign( inertia.y ) * phys.deceleration;

            if( Math.abs( inertia.y ) <= phys.deceleration ) {
                inertia.y = 0;
            }
        }

        Utils.cap( inertia, phys.max );
    },

    updateFns: {
        move: function() {
            var delta = this.build.targetRadius - this.build.radius;
            if( Math.abs( delta ) > 0.1 ) {
                this.scale( this.build.radius + ( delta / 5 ) + 0.01);
            }
            this.move( this.phys.inertia );
            this.constrain();
        },
        shader: function() {

            Player.mesh.lookAt( Camera.main.position );

            if( this.phys.amplitude > 0 ) {
                this.phys.amplitude -= Utils.speed( this.phys.friction );
                if( this.phys.amplitude < 0 ) {
                    this.phys.amplitude = 0;
                }
                if( 'amplitude' in this.mesh.material.uniforms ) {
                    this.mesh.material.uniforms.amplitude.value = this.phys.amplitude;
                }
                this.mesh.rotation.z = this.build.zrot;
            }

        },
        keyCheck: function() {
            this.keyCheck();
        }
    },
    
    constrain: function() {
        var min = Camera.data.frustrum.min,
            max = Camera.data.frustrum.max,
            inertia = this.phys.inertia,
            mesh = this.mesh,
            radius = this.build.radius;

        if( mesh.position.y > max.y - radius ) {
            mesh.position.y = max.y - radius;
            if( inertia.y > 0 ) {
                inertia.y = 0;
            }
        }
        if( mesh.position.y < min.y + radius ) {
            mesh.position.y = min.y + radius;
            if( inertia.y < 0 ) {
                inertia.y = 0;
            }
        }
        if( mesh.position.x > max.x - radius ) {
            mesh.position.x = max.x - radius;
            inertia.x = 0;
        }
        if( mesh.position.x < min.x + radius ) {
            mesh.position.x = min.x + radius;
            inertia.x = 0;
        }
    },

    ripple: function( target, amplitude ) {
        if( this.phys.amplitude <= 3 ) {
            amplitude = 4 + ( amplitude * 0.05 );
            this.phys.amplitude = amplitude;

            if( 'amplitude' in this.mesh.material.uniforms ) {
                this.mesh.material.uniforms.frequency.value = Utils.randFloat( 0.3, 3 );
            }

            if( target ) {
                var p1 = Player.mesh.position,
                    p2 = target.mesh.position;
                this.build.zrot = Math.atan2( p2.y - p1.y, p2.x - p1.x ) - THREE.Math.degToRad( 90 );
            }
        }
    },

    grow: function( amount ) {
        this.build.targetRadius += amount / 10;
    },

    scale: function( radius ) {
        this.build.radius = radius;
        var scale = this.build.scale = radius / this.build.origRadius;
        this.mesh.scale.set( scale, scale, scale );

        this.phys.acceleration = 11.0 + ( 0.054 * radius );
        this.phys.deceleration = 2.9 + ( 0.04 * radius );
        this.phys.max = 190 + ( 3 * radius );

        if( 'diameter' in this.mesh.material.uniforms ) {
            this.mesh.material.uniforms.diameter.value = this.build.radius * 2;
            this.mesh.material.uniforms.scale.value = this.build.scale;
        }
    }
});

}(this));
