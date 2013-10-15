(function() {

var powerups = [{
    type: Bub.Fireball,
    options: function() {
        return {
            radius: Bub.player.build.radius
        };
    }
}];

Bub.Transition = function( props ) {
    $.extend( this, props );
};

Bub.Transition.prototype = {

    update: function() {
        for( var key in this.fns ) {
            if( 'id' in this ) {
                this[ key ].apply( this );
            }
        }
    },

    replaceFn: function( key, fn ) {
        this.replaced = this.replaced || {};
        this.replaced[ key ] = this[ key ];
        this[ key ] = fn;
    }

};

Bub.Transitions = {

    run: function( id ) {
        var trans = this.transitions[ id ],
            timeouts = [];

        _.each( trans.entities, function( entity ) {

            var timeout = function() {
                entity.timeout = setTimeout(function() {

                    var actual = _.isArray( entity.type ) ? Bub.Utils.randArr( entity.type ) : entity;

                    var opts = actual.options ? ( actual.options.call ?
                        actual.options() : actual.options
                    ) : {};
                    Bub.Cache.birth( actual.type, opts );

                    timeout();

                }, entity.offset + ( Math.random() * entity.frequency ));
            };

            timeout();

        });

        Bub.World.transition = function() {
            trans.loop();
        };
        trans.start();
    },

    end: function( id ) {
        var trans = this.transitions[ id ];

        _.each( trans.entities, function( entity ) {
            if( entity.timeout ) {
                clearTimeout( entity.timeout );
            }
        });

        delete Bub.World.transition;
        trans.end();
    },

    transitions: {
        descend: new Bub.Transition({

            entities: [{
                type: Bub.Mine,
                options: { radius: 0.5 },
                frequency: 3000,
                offset: 1000
            }, {
                type: Bub.Floater,
                options: function() {
                    return {
                        radius: Bub.Utils.randInt(
                            Bub.player.build.radius / 10, Bub.player.build.radius / 2
                        )
                    };
                },
                frequency: 100,
                offset: 100
            }, {
                type: powerups,
                frequency: 10000,
                offset: 3000
            }],

            start: function() {
            },
            end: function() {
                Bub.Cache.each(function( thing ) {
                    if( thing.inertia.y !== 0 ) {
                        thing.inertia.y += 0.03;
                        thing.inertia.z += 1;
                    }
                    if( thing.inertia.y > -0.03 ) {
                        thing.inertia.y = 0;
                    }
                });
            },
            loop: function() {}
        }),

        forward: new Bub.Transition({
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
        }),

        maze: new Bub.Transition({
            initBind: function( thing ) {
                //if( thing.type === 'floater' ) {
                //} else if( thing.type === 'mine' ) {
                //}
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
            },
            end: function() {
                Bub.unbind( 'initted', this.initBind );
            },
            loop: function() {
                this.update();
            },
            startLoop: function() {
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
            playLoop: function() {
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
        })
    }
};

}());
