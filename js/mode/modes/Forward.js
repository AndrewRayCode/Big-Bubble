Bub.ModeManager.modes.forward = new Bub.Mode({

    entities: Bub.Mode.defaultEntities,

    initBind: function( thing ) {
        if( thing instanceof Bub.Floater ) {
            thing.fadeSpeed = 0.05;

            thing.replaceUpdater( 'fade', function() {
                var zPos = thing.mesh.position.z;

                if( zPos > -Bub.player.build.radius * 6.0 ) {
                    //if( thing.inertia.z > 0.1 ) {
                        //thing.inertia.z -= Bub.Utils.speed( 80.0 );
                    //}
                    thing.mesh.material.uniforms.opacity.value -= Bub.Utils.speed( 0.01 );

                    if( thing.mesh.material.uniforms.opacity.value <= 0 ) {
                        Bub.trigger( 'free', thing );
                    }
                } else {
                    thing.mesh.material.uniforms.opacity.value = 0.5 - ((-1 * zPos) / 1000) * 0.5;
                }
                
            });
        } else if( thing instanceof Bub.Mine ) {

            thing.fadeSpeed = 0.05;

            thing.replaceUpdater( 'fade', function() {
                var zPos = thing.mesh.position.z;

                if( zPos > 0 ) {
                    thing.mesh.material.opacity -= Bub.Utils.speed( 0.5 );

                    if( thing.mesh.material.opacity <= 0 ) {
                        Bub.trigger('free', thing);
                    }
                } else {
                    thing.mesh.material.opacity = 0.5 - ((-1 * zPos) / 1000) * 0.5;

                    if( zPos > -200 ) {
                        this.mesh.material.color.r += Bub.Utils.speed( 0.01 );
                    }
                }
                
            });
        }
    },
    updateSpawner: function() {
        var frustrum = Bub.camera.data.frustrum;

        this.spawner.position.set( 0, 0, -100 );
        this.spawner.scale.set( frustrum.max.x - frustrum.min.x, frustrum.max.y - frustrum.min.y, 0 );
        this.spawner.update();
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
