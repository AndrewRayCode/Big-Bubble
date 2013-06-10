(function( global ) {

var Transition = global.Transition = Class.create({
    run: function( id ) {
        var trans = Transition.transitions[ id ];

        World.transition = function() {
            trans.loop();
        };
        trans.start();
    },

    end: function( id ) {
        var trans =  Transition.transitions[ id ];
        delete World.transition;
        trans.end();
    },

    transitions: {
        forward: {
            initBind: function( thing ) {
                if( thing.type === 'floater' ) {
                    thing.fadeSpeed = 0.05;

                    thing.mesh.position.x = Utils.randFloat( Camera.data.frustrum.min.x, Camera.data.frustrum.max.x );
                    thing.mesh.position.y = Utils.randFloat( Camera.data.frustrum.min.y, Camera.data.frustrum.may.y );
                    thing.mesh.position.z = -1000;
                    thing.inertia = {
                        x: 0,
                        y: 0,
                        z: 100 - ( Math.random() )
                    };

                    thing.replaceUpdater( 'fade', function() {
                        var zPos = thing.mesh.position.z;

                        if( zPos > 0 ) {
                            thing.mesh.material.opacity -= 0.5 * Game.time.delta;

                            if( thing.mesh.material.opacity <= 0 ) {
                                Game.trigger('free', thing);
                            }
                        } else {
                            thing.mesh.material.opacity = 0.5 - ((-1 * zPos) / 1000) * 0.5;

                            if( zPos > -300 ) {
                                this.mesh.material.color.g += 0.1 * Game.time.delta;
                            }
                        }
                        
                    });
                } else if( thing.type === 'mine' ) {

                    thing.fadeSpeed = 0.05;
                    thing.mesh.position.x = Utils.randFloat( Camera.data.frustrum.min.x, Camera.data.frustrum.max.x );
                    thing.mesh.position.y = Utils.randFloat( Camera.data.frustrum.min.y, Camera.data.frustrum.may.y );
                    thing.mesh.position.z = -1000;
                    thing.inertia = {
                        x: 0,
                        y: 0,
                        z: 100 - ( Math.random() )
                    };

                    thing.replaceUpdater( 'fade', function() {
                        var zPos = thing.mesh.position.z;

                        if( zPos > 0 ) {
                            thing.mesh.material.opacity -= 0.5 * Game.time.delta;

                            if( thing.mesh.material.opacity <= 0 ) {
                                Game.trigger('free', thing);
                            }
                        } else {
                            thing.mesh.material.opacity = 0.5 - ((-1 * zPos) / 1000) * 0.5;

                            if( zPos > -200 ) {
                                this.mesh.material.color.r += 0.01 * Game.time.delta;
                            }
                        }
                        
                    });
                }
            },
            start: function() {
                Game.bind( 'initted', this.initBind );
            },
            end: function() {
                Game.unbind( 'initted', this.initBind );
            },
            loop: function() {
                Thing.eachThing(function( thing ) {
                    if( thing.inertia.y !== 0 ) {
                        thing.inertia.y += 0.03;
                        thing.inertia.z += 1;
                    }
                    if( thing.inertia.y > -0.03 ) {
                        thing.inertia.y = 0;
                    }
                });
            }
        },

        maze: {
            initBind: function( thing ) {
                //if( thing.type === 'floater' ) {
                //} else if( thing.type === 'mine' ) {
                //}
            },
            start: function() {
                Game.bind( 'initted', this.initBind );

                this.cameraInertia = new THREE.Vector2( 0, 0 );
                this.maze = Factory.maze();
                this.maze.inertia.y = -2.8;
            },
            end: function() {
                Game.unbind( 'initted', this.initBind );
            },
            loop: function() {
                var originPoint = Player.mesh.position.clone(),
                    bottomHit, bottomDist, backHit, i, vertex, directionVector, ray, collisionResults;

                for( i = 0; vertex = Player.vertices.bottom[ i++ ]; ) {
                    directionVector = vertex.clone().applyMatrix4( Player.mesh.matrix ).sub( Player.mesh.position );
                    
                    ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
                    collisionResults = ray.intersectObjects( this.maze.tops );

                    if ( collisionResults.length && collisionResults[0].distance < directionVector.length() ) {
                        bottomHit = true;
                        bottomDist = collisionResults[0].distance;
                        break;
                    }
                }

                for( i = 0; vertex = Player.vertices.back[ i++ ]; ) {
                    directionVector = vertex.clone().applyMatrix4( Player.mesh.matrix ).sub( Player.mesh.position );
                    
                    ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
                    collisionResults = ray.intersectObjects( this.maze.sides );
                    if ( collisionResults.length && collisionResults[0].distance < directionVector.length() ) {
                        backHit = true;
                        break;
                    }
                }
                
                if( bottomHit ) {
                    this.maze.inertia.z = 0;
                    this.maze.group.position.z -= ( Player.build.radius - bottomDist );
                } else {
                    this.maze.inertia.z += 0.10;
                }
                if( backHit && Player.phys.inertia.y < 0 ) {
                    Player.phys.inertia.y = 0;
                }
                this.maze.group.position.y += this.maze.inertia.y;
                this.maze.group.position.z += this.maze.inertia.z;
                Player.mesh.position.y += this.maze.inertia.y;

                if( Player.mesh.position.x < Camera.data.frustrum.min.x + 50 ) {
                    this.cameraInertia = new THREE.Vector2( -1.5, 0 );
                    Camera.pan( this.cameraInertia );
                } else if( Player.mesh.position.x > Camera.data.frustrum.max.x - 50 ) {
                    this.cameraInertia = new THREE.Vector2( 1.5, 0 );
                    Camera.pan( this.cameraInertia );
                } else if( this.cameraInertia.x ) {
                    this.cameraInertia.x += -Utils.sign( this.cameraInertia.x ) * 0.1;

                    if( Math.abs( this.cameraInertia.x ) <= 0.1 ) {
                        this.cameraInertia.x = 0;
                    }
                    Camera.pan( this.cameraInertia );
                }
            }
        }
    }
});

}(this));
