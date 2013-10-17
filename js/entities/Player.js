Bub.Player = function() {
    var player = this;

    this.id = 0;
    Bub.Mixin.Entity.call( this );

    // Fireball powerup binder
    Bub.bind( 'fireup', function( powerup ) {

        clearTimeout( player.deactivateTimeout );

        var baseBrightness = 0.7;

        var collide = function() {
            var bubble = this;
            if( player.isCollidingWith( bubble ) ) {

                if( bubble.state === 'fire' ) {
                    player.grow( bubble.r );
                    player.targetBrightness += 0.1;

                    if( player.build.radius > Bub.Level.level.next ) {
                        Bub.Level.advance();
                    }
                    Bub.trigger( 'free', bubble );

                // This could be an explosion or something
                } else if( bubble.state !== 'dying' ) {
                    bubble.state = 'dying';
                    bubble.mesh.material.uniforms.addColor.value = new THREE.Color( 0xffbb11 );
                    bubble.inertia = new THREE.Vector3( 0, 0, 0 );
                    setTimeout(function() {
                        Bub.trigger( 'free', bubble );
                    }, 500);
                }

            }
        };

        var initBind = function( thing ) {
            // Remove ripple on collision with floater
            if( thing instanceof Bub.Floater ) {
                //thing.mesh.material = Bub.Shader.shaders.fireball();
                thing.state = 'fire';
                thing.replaceUpdater( 'collision', collide );
            }
        };

        Bub.bind( 'initted', initBind );

        player.deactivateTimeout = setTimeout(function() {
            Bub.Particle.destroy( player.particleId );
            player.resetUpdater( 'shader' );
            player.mesh.material = Bub.Shader.shaders.fresnel();
            Bub.unbind( 'initted', initBind );
        }, powerup.duration );

        player.mesh.material = Bub.Shader.shaders.fireball();
        player.targetBrightness = player.mesh.material.uniforms.brightness.value = baseBrightness;
        player.mesh.material.uniforms.displacementHeight.value = 0.1;

        player.particleId = Bub.Particle.register({
            update: Bub.Particle.lockTo( player )
        }, {
            texture: THREE.ImageUtils.loadTexture('media/flame-1.png'),
            maxAge: 5
        }, {
            type: 'sphere',
            //position: new THREE.Vector3(0, 0, 0),
            positionSpread:new THREE.Vector3(10, 10, 0),
            //acceleration: new THREE.Vector3(0, 10, 0),
            velocity: new THREE.Vector3(0, 15, 0),
            speed: 7,
            sizeSpread: 10,
            particlesPerSecond: 4,
            sizeStart: player.build.radius,
            sizeEnd: player.build.radius + 300,
            opacityStart: 1,
            opacityEnd: 0
        });

        Bub.Cache.each(function( thing ) {
            thing.replaceUpdater( 'collision', collide );
        });

        player.replaceUpdater('shader', function() {
            player.mesh.rotation.x -= Bub.Utils.speed( 1.1 );

            var delta = player.targetBrightness - player.mesh.material.uniforms.brightness.value;
            if( Math.abs( delta ) > 0.01 ) {
                player.mesh.material.uniforms.brightness.value += delta / 4;
                player.mesh.material.uniforms.displacementHeight.value += delta / 30;
            }

            player.targetBrightness -= Bub.Utils.speed( 0.15 );
            player.targetBrightness = Bub.Utils.cap( player.targetBrightness, baseBrightness, 1.3 );
        });
    });
};

Bub.Player.prototype = Object.create( Bub.Mixin.Entity.prototype );

Bub.Player.prototype.defaults = {
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
};

Bub.Player.prototype.vertices = {
    back: [],
    bottom: []
};

Bub.Player.prototype.load = function() {
    var build = this.build,
        geometry = this.geometry = new THREE.SphereGeometry( 0.5, this.build.segments, this.build.segments ),
        mesh = this.mesh = new THREE.Mesh( geometry, Bub.Shader.shaders.fresnel() ),
        vertexIndex = mesh.geometry.vertices.length - 1,
        v;

    //mesh.material = Bub.Shader.shaders.fireball();

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

    Bub.World.scene.add( mesh );
};

Bub.Player.prototype.reset = function() {
    this.resetDefaults();
    this.build.targetRadius = this.build.radius;

    this.mesh.position.set( 0, 0, 0 );
    this.scale( this.build.radius );
};

Bub.Player.prototype.keyCheck = function() {
    var phys = this.phys,
        inertia = this.phys.inertia;

    if( Bub.World.keysDown.right ) {
        inertia.x += phys.acceleration;
    } else if( Bub.World.keysDown.left ) {
        inertia.x -= phys.acceleration;
    } else if ( inertia.x ) {
        inertia.x -= Bub.Utils.sign( inertia.x ) * phys.deceleration;

        if( Math.abs( inertia.x ) <= phys.deceleration ) {
            inertia.x = 0;
        }
    }

    if( Bub.World.keysDown.up ) {
        inertia.y += phys.acceleration;
    } else if( Bub.World.keysDown.down ) {
        inertia.y -= phys.acceleration;
    } else if ( inertia.y ) {
        inertia.y -= Bub.Utils.sign( inertia.y ) * phys.deceleration;

        if( Math.abs( inertia.y ) <= phys.deceleration ) {
            inertia.y = 0;
        }
    }

    Bub.Utils.vcap( inertia, phys.max );
};

Bub.Player.prototype.updateFns = {
    move: function() {
        var delta = this.build.targetRadius - this.build.radius;
        if( Math.abs( delta ) > 0.1 ) {
            this.scale( this.build.radius + ( delta / 5 ) + 0.01);
        }
        this.move( this.phys.inertia );
        this.constrain();
    },
    shader: function() {
        this.mesh.lookAt( Bub.camera.main.position );

        if( this.phys.amplitude > 0 ) {
            this.phys.amplitude -= Bub.Utils.speed( this.phys.friction );
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
};
    
Bub.Player.prototype.constrain = function() {
    var min = Bub.camera.data.frustrum.min,
        max = Bub.camera.data.frustrum.max,
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
};

Bub.Player.prototype.ripple = function( target, amplitude ) {
    if( this.phys.amplitude <= 3 ) {
        amplitude = 10 + ( amplitude * 0.05 );
        this.phys.amplitude = amplitude;

        if( 'amplitude' in this.mesh.material.uniforms ) {
            this.mesh.material.uniforms.frequency.value = Bub.Utils.randFloat( 100, 200 );
        }

        if( target ) {
            var p1 = this.mesh.position,
                p2 = target.mesh.position;
            this.build.zrot = Math.atan2( p2.y - p1.y, p2.x - p1.x ) - THREE.Math.degToRad( 90 );
        }
    }
};

Bub.Player.prototype.grow = function( amount ) {
    this.build.targetRadius += amount / 10;

    Bub.trigger( 'points', amount );
};

Bub.Player.prototype.scale = function( radius ) {
    this.build.radius = radius;
    var scale = this.build.scale = radius * 2;

    this.mesh.scale.set( scale, scale, scale );

    this.phys.acceleration = 11.0 + ( 0.054 * radius );
    this.phys.deceleration = 2.9 + ( 0.04 * radius );
    this.phys.max = 190 + ( 3 * radius );

    if( 'diameter' in this.mesh.material.uniforms ) {
        this.mesh.material.uniforms.diameter.value = this.build.scale;
    }
};
