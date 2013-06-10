(function( global ) {

var Player = global.Player = Mixin.Entity.create({

    defaults: {
        build: {
            radius: 20,
            origRadius: 20,
            scale: 1,
            segments: 26
        },
        phys: {
            inertia: { x: 0, y: 0, z: 0 },
            acceleration: 25,
            deceleration: 10,
            max: 400
        }
    },

    vertices: {
        back: [],
        bottom: []
    },

    init: function() {
        this._super();
    },

    load: function() {
        var build = this.build,
            geometry = this.geometry = new THREE.SphereGeometry( this.build.radius, this.build.segments, this.build.segments );

        var fresnelShader = THREE.FresnelShader,
            uniforms = THREE.UniformsUtils.clone( fresnelShader.uniforms );

        var renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBFormat
        });

        uniforms.tCube.value = Camera.mirror.renderTarget;

        var fresnelMaterial = new THREE.ShaderMaterial({
            fragmentShader: fresnelShader.fragmentShader,
            vertexShader: fresnelShader.vertexShader,
            uniforms: uniforms
        });

        var mesh = this.mesh = new THREE.Mesh( geometry, fresnelMaterial ),
            v;

        var vertexIndex = mesh.geometry.vertices.length - 1;
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

        this.mesh.position.x = 0;
        this.mesh.position.y = 0;
        this.mesh.position.z = 0;
        this.scaleTo( 1 );
    },

    keyCheck: function() {
        var phys = this.phys,
            inertia = this.phys.inertia;

        if( World.keysDown.right ) {
            inertia.x += phys.acceleration;

            if( inertia.x > phys.max ) {
                inertia.x = phys.max;
            }
        } else if( World.keysDown.left ) {
            inertia.x -= phys.acceleration;

            if( inertia.x < -phys.max ) {
                inertia.x = -phys.max;
            }
        } else if ( inertia.x ) {
            inertia.x -= Utils.sign( inertia.x ) * phys.deceleration;

            if( Math.abs( inertia.x ) <= phys.deceleration ) {
                inertia.x = 0;
            }
        }

        if( World.keysDown.up ) {
            inertia.y += phys.acceleration;

            if( inertia.y > phys.max ) {
                inertia.y = phys.max;
            }
        } else if( World.keysDown.down ) {
            inertia.y -= phys.acceleration;

            if( inertia.y < -phys.max ) {
                inertia.y = -phys.max;
            }
        } else if ( inertia.y ) {
            inertia.y -= Utils.sign( inertia.y ) * phys.deceleration;

            if( Math.abs( inertia.y ) <= phys.deceleration ) {
                inertia.y = 0;
            }
        }
    },

    update: function() {
        this.move({
            x: this.phys.inertia.x,
            y: this.phys.inertia.y
        });
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

    grow: function( radius ) {
        this.build.radius += radius;
        this.build.scale = this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = this.build.radius / this.build.origRadius;
    }
});

}(this));
