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
                    thing.mesh.material.uniforms.opacity.value -= Bub.Utils.speed( 0.1 );

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
        var radius = ( Bub.camera.data.frustrum.max.x - Bub.camera.data.frustrum.min.x ) / 2;
        var geom = new THREE.CylinderGeometry(radius, radius, 900, 20, 20, true);
        //geom = new THREE.SphereGeometry(90,32,32);
        var material = Bub.Shader.shaders.wiggly();
        //material = new THREE.MeshPhongMaterial();
        material.side = THREE.BackSide;
        var mesh = new THREE.Mesh( geom, material );
        Bub.World.scene.add( mesh );
        mesh.rotation.x = THREE.Math.degToRad( 90 );
        //mesh.renderDepth = 1;

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
