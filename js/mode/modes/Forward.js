Bub.ModeManager.modes.forward = new Bub.Mode({
    initBind: function( thing ) {
        if( thing instanceof Bub.Floater ) {
            thing.fadeSpeed = 0.05;

            thing.mesh.position.x = Bub.Utils.randFloat( Bub.camera.data.frustrum.min.x, Bub.camera.data.frustrum.max.x );
            thing.mesh.position.y = Bub.Utils.randFloat( Bub.camera.data.frustrum.min.y, Bub.camera.data.frustrum.max.y );
            thing.mesh.position.z = -1000;
            thing.inertia = new THREE.Vector3( 0, 0, 100 - ( Math.random() ) );

            thing.replaceUpdater( 'fade', function() {
                var zPos = thing.mesh.position.z;

                if( zPos > -Bub.player.build.radius * 6.0 ) {
                    if( thing.inertia.z > 0.1 ) {
                        thing.inertia.z -= Bub.Utils.speed( 80.0 );
                    }
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
            thing.mesh.position.x = Bub.Utils.randFloat( Bub.camera.data.frustrum.min.x, Bub.camera.data.frustrum.max.x );
            thing.mesh.position.y = Bub.Utils.randFloat( Bub.camera.data.frustrum.min.y, Bub.camera.data.frustrum.max.y );
            thing.mesh.position.z = -1000;
            thing.inertia = new THREE.Vector3( 0, 0, 100 - ( Math.random() ) );

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
    start: function() {
        //this.cameraInertia = new THREE.Vector3( 0, 0, 0 );
        Bub.bind( 'initted', this.initBind );
    },
    end: function() {
        Bub.unbind( 'initted', this.initBind );
    },
    loop: function() {
        var rand = Math.random();

        if( rand > 0.993 ) {
            Bub.Cache.birth( Bub.Mine, {
                radius: 0.5 + Math.random() * 0.1
            });
        } else if( rand > 0.91 ) {
            Bub.Cache.birth( Bub.Floater, {
                radius: Bub.player.build.radius
            });
        }

        Bub.Cache.each(function( thing ) {
            if( thing.inertia.y !== 0 ) {
                thing.inertia.y += 0.03;
                thing.inertia.z += 1;
            }
            if( thing.inertia.y > -0.03 ) {
                thing.inertia.y = 0;
            }
        });
        //this.updateBub.camera();
    },

    // todo: offset camera based on player position
    //updateBub.camera: function() {
        //Bub.camera.offset( new THREE.Vector3(
            //Bub.player.mesh.position.x / 10,
            //Bub.player.mesh.position.y / 10,
            //0
        //));
    //}
});
