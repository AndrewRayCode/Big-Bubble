Bub.Player = function() {
    var player = this;

    this.entityify();
    this.id = 0;
    this.noGravity = true;

    // Fireball powerup binder
    Bub.bind( 'fireup', function( powerup ) {

        player.resetShader = function() {
            player.resetShader = null;
            Bub.Particle.destroy( player.particleId );
            player.particleId = null;
            player.resetUpdater( 'shader' );
            player.mesh.material = Bub.Shader.shaders.fresnel();
            Bub.Game.clearTimeout( player.deactivateTimeout );
            player.deactivateTimeout = null;
            Bub.unbind( 'initted', initFireBind );
        };

        if( player.deactivateTimeout ) {
            Bub.Game.clearTimeout( player.deactivateTimeout );
            player.deactivateTimeout = Bub.Game.timeout( powerup.duration, player.resetShader );
            return;
        }

        var baseBrightness = 0.6;

        var floaterCollide = function() {
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
                    Bub.Game.timeout(500, function() {
                        Bub.trigger( 'free', bubble );
                    });
                }

            }
        };

        var mineCollide = function() {
            var mine = this;
            if( player.isCollidingWith( mine ) ) {
                Bub.Cache.each( function( thing ) {
                    if( thing.applyForce ) {
                        var force = thing.mesh.position.clone().sub( mine.mesh.position ),
                            distance = force.length();

                        //strength = (G * mass * m.mass) / (distance * distance);
                        thing.applyForce( force.normalize().multiplyScalar( Math.max( 50000 - ( distance * distance ), 0 ) ) );
                    }

                });

                Bub.Utils.explosion( mine.mesh.position, Bub.camera.data.frustrum.width / 2 );
                Bub.trigger( 'free', mine );
            }
        };

        var initFireBind = function( thing ) {
            // Remove ripple on collision with floater
            if( thing instanceof Bub.Floater ) {
                thing.mesh.material = Bub.Shader.shaders.lava();
                thing.state = 'fire';
                thing.replaceUpdater( 'collision', floaterCollide );
                thing.scaleTo( thing.r * Bub.Fireball.floaterScale );

            } else if( thing instanceof Bub.Mine ) {
                thing.replaceUpdater( 'collision', mineCollide );
            }
        };

        Bub.bind( 'initted', initFireBind );
        Bub.Cache.each( function( thing ) {
            if( thing instanceof Bub.Floater ) {
                thing.replaceUpdater( 'collision', floaterCollide );
            } else if( thing instanceof Bub.Mine ) {
                thing.replaceUpdater( 'collision', mineCollide );
            }
        });

        player.deactivateTimeout = Bub.Game.timeout( powerup.duration, player.resetShader );

        player.mesh.material = Bub.Shader.shaders.fireball();
        player.targetBrightness = player.mesh.material.uniforms.brightness.value = baseBrightness;
        player.mesh.material.uniforms.displacementHeight.value = 0.1;

        player.particleId = Bub.Particle.register({
            update: Bub.Particle.lockTo( player )
        }, {
            texture: Bub.Assets.textures.flame,
            maxAge: 4
        }, {
            type: 'sphere',
            positionSpread: new THREE.Vector3(10, 10, 0),
            velocity: new THREE.Vector3(0, 15, 0),
            speed: 7,
            sizeSpread: 10,
            particlesPerSecond: 4,
            sizeStart: player.build.radius,
            sizeEnd: player.build.radius * 10,
            opacityStart: 1,
            opacityEnd: 0
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

_.extend( Bub.Player.prototype, Bub.Mixins.entity );

Bub.Player.prototype.defaults = function() {
    return {
        build: {
            radius: 10,
            scale: 1,
            segments: 36
        },
        phys: {
            friction: 20,
            minCap: Bub.World.phys.minCap,
            mass: 100,
            velocity: new THREE.Vector3( 0, 0, 0 ),
            acceleration: new THREE.Vector3( 0, 0, 0 ),
            max: 800,
            speed: 5000,
            amplitude: 0,
            waveFriction: 2
        }
    };
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
    mesh.renderDepth = 1;

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
    this.resetShader && this.resetShader();
    this.undoUpdaters();
    this.resetDefaults();
    this.build.targetRadius = this.build.radius;

    this.mesh.position.set( 0, 0, 0 );
    this.scale( this.build.radius );
};

Bub.Player.prototype.keyCheck = function() {
    var phys = this.phys,
        triggers= Bub.Game.triggers;

    if( triggers.right ) {
        this.applyForce( new THREE.Vector3( phys.speed, 0, 0 ) );
    } else if( triggers.left ) {
        this.applyForce( new THREE.Vector3( -phys.speed, 0, 0 ) );
    }

    if( triggers.up ) {
        this.applyForce( new THREE.Vector3( 0, phys.speed, 0 ) );
    } else if( triggers.down ) {
        this.applyForce( new THREE.Vector3( 0, -phys.speed, 0 ) );
    }

    Bub.Utils.limit( phys.acceleration, phys.max );
};

Bub.Player.prototype.updateFns = [{
    name: 'move',
    fn: function() {
        var delta = this.build.targetRadius - this.build.radius;
        if( Math.abs( delta ) > 0.1 ) {
            this.scale( this.build.radius + ( delta / 5 ) + 0.01 );
        }
        this.updateLocks();
        this.constrain();
    }
}, {
    name: 'shader',
    fn: function() {
        this.mesh.lookAt( Bub.camera.main.position );

        if( this.phys.amplitude > 0 ) {
            this.phys.amplitude -= Bub.Utils.speed( this.phys.waveFriction );
            if( this.phys.amplitude < 0 ) {
                this.phys.amplitude = 0;
            }
            if( 'amplitude' in this.mesh.material.uniforms ) {
                this.mesh.material.uniforms.amplitude.value = this.phys.amplitude;
            }
            this.mesh.rotation.z = this.build.zrot;
        }

    }
}, {
    name: 'keyCheck',
    fn: function() {
        this.keyCheck();
    }
}];
    
Bub.Player.prototype.constrain = function() {
    var min = Bub.camera.data.frustrum.min,
        max = Bub.camera.data.frustrum.max,
        velocity = this.phys.velocity,
        mesh = this.mesh,
        radius = this.build.radius;

    if( mesh.position.y > max.y - radius ) {
        mesh.position.y = max.y - radius;
        if( velocity.y > 0 ) {
            velocity.y = 0;
        }
    }
    if( mesh.position.y < min.y + radius ) {
        mesh.position.y = min.y + radius;
        if( velocity.y < 0 ) {
            velocity.y = 0;
        }
    }
    if( mesh.position.x > max.x - radius ) {
        mesh.position.x = max.x - radius;
        velocity.x = 0;
    }
    if( mesh.position.x < min.x + radius ) {
        mesh.position.x = min.x + radius;
        velocity.x = 0;
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

    //this.phys.acceleration = 11.0 + ( 0.054 * radius );
    //this.phys.deceleration = 2.9 + ( 0.04 * radius );
    //this.phys.max = 190 + ( 3 * radius );

    if( 'diameter' in this.mesh.material.uniforms ) {
        this.mesh.material.uniforms.diameter.value = this.build.scale;
    }
};
