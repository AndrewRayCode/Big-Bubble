Bub.ModeManager.modes.forward = new Bub.Mode({

    entities: Bub.Mode.defaultEntities,

    initBind: function( thing ) {
        if( thing instanceof Bub.Floater ) {
            thing.addUpdater( 'zPos', function() {
                thing.scaleTo( Bub.player.build.radius );
                var zPos = thing.mesh.position.z;

                if( zPos > -Bub.player.build.radius * 3.1 ) {
                    thing.phys.dragCoefficient += Bub.Utils.speed( 0.3 );
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
        var frustrum = Bub.camera.data.frustrum,
            depth = -1000;

        this.spawner.scale.set( frustrum.width, frustrum.height, 0 );
        this.spawner.position.set( 0, 0, depth );
        this.spawner.update();

        Bub.Utils.dot( new THREE.Vector3(
            this.spawner.position.x - frustrum.width / 2,
            this.spawner.position.y - frustrum.height / 2,
            depth
        ));
        Bub.Utils.dot( new THREE.Vector3(
            this.spawner.position.x + frustrum.width / 2,
            this.spawner.position.y - frustrum.height / 2,
            depth
        ));
        Bub.Utils.dot( new THREE.Vector3(
            this.spawner.position.x - frustrum.width / 2,
            this.spawner.position.y + frustrum.height / 2,
            depth
        ));
        Bub.Utils.dot( new THREE.Vector3(
            this.spawner.position.x + frustrum.width / 2,
            this.spawner.position.y + frustrum.height / 2,
            depth
        ));
    },
    start: function() {
        var radius = ( Bub.camera.data.frustrum.max.x - Bub.camera.data.frustrum.min.x ) / 1;
        var geom = new THREE.CylinderGeometry(radius, radius, 2500, 20, 100, true);
        //geom = new THREE.SphereGeometry(90,32,32);
        var material = Bub.Shader.shaders.wiggly();
        //material = new THREE.MeshPhongMaterial();
        material.side = THREE.BackSide;
        var mesh = new THREE.Mesh( geom, material );
        Bub.World.scene.add( mesh );
        mesh.position.z -= 1000;
        mesh.rotation.x = THREE.Math.degToRad( 90 );
        mesh.renderDepth = 0.00;

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
