Bub.ModeManager.modes.maze = new Bub.Mode({

    updateSpawner: function() {
        var frustrum = Bub.camera.data.frustrum,
            frustrumScale = 0.8,
            depth = -500;

        this.spawner.scale.set( frustrum.width * frustrumScale, frustrum.height * frustrumScale, 0 );
        this.spawner.position.set( 0, 0, depth );
        this.spawner.update();
    },

    initBind: function( thing ) {
        //if( thing.type === 'floater' ) {
        //} else if( thing.type === 'mine' ) {
        //}
    },

    end: function() {
        Bub.unbind( 'initted', this.initBind );
    },

    start: function() {

        Bub.bind( 'initted', this.initBind );

        this.cameraInertia = new THREE.Vector3( 0, 0, 0 );
        this.maze = Bub.Factory.maze();
        this.maze.group.position.z = -400;
        this.maze.group.traverse( function( node ) {
            if( node.material ) {
                node.material.opacity = 0;
            }
        });

        Bub.Cache.each(function( thing ) {
            if( thing instanceof Bub.Mine ) {
                Bub.Cache.free( thing );
            }
        });

        this.replaceFn( 'loop', this.startLoop );


        this.maze.inertia.z += 6;
        this.maze.group.traverse( function( node ) {
            if( node.material ) {
                node.material.opacity += 0.05;
            }
        });
        this.maze.group.position
            .add( Bub.Utils.speed( Bub.player.phys.inertia ) )
            .add( Bub.Utils.speed( this.maze.inertia ) );

        this.updateCamera();

        if( this.maze.group.position.z > Bub.player.build.radius - 100 ) {
            this.maze.inertia.z = 0;
            this.maze.inertia.y = -160;
            this.replaceFn( 'loop', this.playLoop );
        }
    },

    loop: function() {

        this.maze.inertia.y -= 0.2;
        var originPoint = Bub.player.mesh.position.clone(),
            bottomHit, bottomDist, backHit, i, vertex, directionVector, ray, collisionResults;

        for( i = 0; vertex = Bub.player.vertices.bottom[ i++ ]; ) {
            directionVector = vertex.clone().applyMatrix4( Bub.player.mesh.matrix ).sub( Bub.player.mesh.position );
            
            ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
            collisionResults = ray.intersectObjects( this.maze.tops );

            if ( collisionResults.length && collisionResults[0].distance < directionVector.length() ) {
                bottomHit = true;
                this.lastBottomHit = new Date();
                bottomDist = collisionResults[0].distance;
                break;
            }
        }

        for( i = 0; vertex = Bub.player.vertices.back[ i++ ]; ) {
            directionVector = vertex.clone().applyMatrix4( Bub.player.mesh.matrix ).sub( Bub.player.mesh.position );
            
            ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
            collisionResults = ray.intersectObjects( this.maze.sides );
            if ( collisionResults.length && collisionResults[0].distance < directionVector.length() ) {
                backHit = true;
                break;
            }
        }

        if( bottomHit ) {
            this.maze.inertia.z = 0;
            this.maze.group.position.z -= ( Bub.player.build.radius - bottomDist );
        } else {
            this.maze.inertia.z += 13;
        }

        if( this.maze.group.position.z > 2000 &&  this.maze.inertia.z > 100 ) {
            Bub.Level.advance();
        }

        if( new Date() - this.lastBottomHit < 500 ) {
            Bub.player.mesh.position.y += Bub.Utils.speed( this.maze.inertia.y );
        }

        if( backHit && Bub.player.phys.inertia.y < 0 ) {
            Bub.player.phys.inertia.y = 0;
        }
        this.maze.group.position.add( Bub.Utils.speed( this.maze.inertia ) );

        this.updateCamera();
    },

    updateCamera: function() {
        if( Bub.player.mesh.position.x < Bub.camera.main.position.x - 50 && Bub.player.phys.inertia.x < 0 ) {
            this.cameraInertia.x = Bub.Utils.speed( Bub.player.phys.inertia.x );
        } else if( Bub.player.mesh.position.x > Bub.camera.main.position.x + 50 && Bub.player.phys.inertia.x > 0) {
            this.cameraInertia.x = Bub.Utils.speed( Bub.player.phys.inertia.x );
        } else if( this.cameraInertia.x ) {
            this.cameraInertia.x += -Bub.Utils.sign( this.cameraInertia.x ) * 0.1;

            if( Math.abs( this.cameraInertia.x ) <= 0.1 ) {
                this.cameraInertia.x = 0;
            }
        }

        //Bub.Utils.cap( this.cameraInertia, Bub.player.phys.max );
        Bub.camera.pan( this.cameraInertia );
    }
});
