Bub.ModeManager.modes.forward = new Bub.Mode({

    entities: [{
        type: Bub.Mine,
        options: function() {
            return {
                radius: Bub.player.build.radius
            };
        },
        frequency: 3000,
        offset: 1000
    }, {
        type: Bub.Floater,
        options: function() {
            return {
                radius: Bub.player.build.radius
            };
        },
        frequency: 200,
        offset: 100
    }],

    initBind: function( thing ) {

        if( thing instanceof Bub.Floater ) {

            thing.mesh.material.uniforms.glowColor.value = new THREE.Color( 0x2d4963 );

            thing.replaceUpdater( 'collision', function() {
                if( thing.mesh.position.z >= -Bub.player.build.radius - 10 &&
                        Bub.player.lockedZisCollidingWith( thing ) ) {
                    thing.attachToPlayer();
                }
            });

            thing.addUpdater( 'zPos', function() {
                var zPos = thing.mesh.position.z,
                    fadeTime = 4000;

                if( !thing.tweening && zPos > -Bub.player.build.radius * 12.1 ) {
                    thing.fadeSpeed = 0.5;
                    thing.tweening = true;
                    thing.tween({
                        shader: {
                            addColor: new THREE.Color( 0x999999 )
                        }
                    }, fadeTime );
                    thing.tween({
                        shader: {
                            glowColor: new THREE.Color( 0xffffff )
                        }
                    }, fadeTime );
                }
                if( zPos > -Bub.player.build.radius * 3.1 ) {
                    thing.phys.dragCoefficient += Bub.Utils.speed( 0.25 );
                    thing.opacity = 0;

                    if( thing.mesh.material.uniforms.opacity.value <= 0 ) {
                        Bub.trigger( 'free', thing );
                    }
                }
                
            });
        } else if( thing instanceof Bub.Mine ) {
            thing.addUpdater( 'zPos', function() {
                var zPos = thing.mesh.position.z;

                if( zPos > 0 ) {
                    thing.opacity = 0;

                    if( thing.mesh.material.opacity <= 0 ) {
                        Bub.trigger('free', thing);
                    }
                } else {
                    if( zPos > -200 ) {
                        this.mesh.material.color.r += Bub.Utils.speed( 0.01 );
                    }
                }
                
            });
        }
    },

    updateSpawner: function() {
        var frustrum = Bub.camera.data.frustrum,
            frustrumScale = 0.8,
            depth = -500;

        this.spawner.scale.set( frustrum.width * frustrumScale, frustrum.height * frustrumScale, 0 );
        this.spawner.position.set( 0, 0, depth );
        this.spawner.update();
    },

    intro: function() {

        var deferred = Q.defer();

        function ensureLoop( animation ) {

            for ( var i = 0; i < animation.hierarchy.length; i ++ ) {

                var bone = animation.hierarchy[ i ];

                var first = bone.keys[ 0 ];
                var last = bone.keys[ bone.keys.length - 1 ];

                last.pos = first.pos;
                last.rot = first.rot;
                last.scl = first.scl;

            }

        }

        var collada = Bub.Assets.colladas.whale;
        var dae = collada.scene;
        var whale = new Bub.Obj3d({
            position: new THREE.Vector3( 0, -1000, 0 )
        });
        whale.mesh = dae.children[1];
        whale.mesh.scale.set( 1, 1, 1 );
        whale.mesh.position.set( -200, 0, -500 );
        whale.mesh.updateMatrix();

        Bub.World.scene.add( whale.mesh );

        var delay = 5000;
        //delay = 0;

        whale.tween({
            position: {
                z: Bub.Level.level.zoom,
                x: 4,
                y: -13
            }
        }, delay );
        whale.tween({
            rotation: {
                y: THREE.Math.degToRad( -90 ),
                x: 0
            }
        }, delay );

        Bub.Game.timeout( delay, function() {
            Bub.World.scene.remove( whale.mesh );

            var radius = Bub.World.size.x / 2;
            var geom = new THREE.CylinderGeometry( radius, radius, 2500, 20, 100, true );
            var material = Bub.Shader.shaders.wiggly();
            material.side = THREE.BackSide;
            var mesh = new THREE.Mesh( geom, material );

            Bub.tube = mesh;
            Bub.camera.main.add( mesh );
            mesh.position.z -= 1000;
            mesh.rotation.x = THREE.Math.degToRad( 90 );
            //mesh.renderDepth = 0.00;
            deferred.resolve();
        });

        return deferred.promise;
    },

    start: function() {
        Bub.bind( 'initted', this.initBind );
        Bub.World.phys.gravity = new THREE.Vector3( 0, 0, 100 );
    },

    end: function() {
        Bub.unbind( 'initted', this.initBind );
    },

    loop: function() {},

    // todo: offset camera based on player position
    //updateBub.camera: function() {
        //Bub.camera.offset( new THREE.Vector3(
            //Bub.player.mesh.position.x / 10,
            //Bub.player.mesh.position.y / 10,
            //0
        //));
    //}
});
