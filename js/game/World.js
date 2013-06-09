(function( global ) {

var World = global.World = Class.create({
    keysDown: {},

    scene: new THREE.Scene(),

    stage: {
        width: 400,
        height: 600,

        calculateAspect: function() {
            return (this.aspect = this.width / this.height);
        },

        setSize: function( x, y ) {
            var me = this;
            this.width = x;
            this.height = y;

            World.renderer.setSize( x, y );
            World.$container.css({
                width: x + 'px',
                height: y  + 'px'
            });
        }
    },

    load: function() {
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setSize( this.stage.width, this.stage.height );
        this.renderer.shadowMapEnabled = true;

        this.stage.calculateAspect();

        var $container = this.$container = $('#game').css({
            width: this.stage.width + 'px',
            height: this.stage.height + 'px'
        });
        $container.append( this.renderer.domElement );

        this.reset();
    },

    reset: function() {
        this.bgColor = new THREE.Color( 0x002462 );
        this.stage.setSize(this.stage.width, this.stage.height);
    },

    populate: function() {

        //var bgCube = new THREE.Mesh( bgGeometry, bgMaterial );
        //bgCube.dynamic = true;
        //bgCube.position.set( 100, 50, 0 );
        //scene.add(bgCube);

        var skyBox = this.skyBox = Mixin.Entity.create({
            mesh: Factory.makeGradientCube(
                Camera.data.frustrum.y * 5, 0x2185C5
            )
        });
        World.scene.add( skyBox.mesh );
    },

    Transition: {
        run: function( id ) {
            var trans = World.Transition.transitions[ id ];

            World.transition = function() {
                trans.loop();
            };
            trans.start();
        },

        end: function( id ) {
            var trans =  World.Transition.transitions[ id ];
            delete World.transition;
            trans.end();
        },

        transitions: {
            forward: {
                initBind: function( thing ) {
                    var halfX, halfY;

                    if( thing.type === 'floater' ) {
                        halfX = Camera.data.frustrum.x / 2;
                        halfY = Camera.data.frustrum.y / 2;
                        thing.fadeSpeed = 0.05;

                        thing.mesh.position.x = Utils.randFloat( -halfX, halfX );
                        thing.mesh.position.y = Utils.randFloat( -halfY, halfY );
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
                        halfX = Camera.data.frustrum.x / 2;
                        halfY = Camera.data.frustrum.y / 2;

                        thing.fadeSpeed = 0.05;
                        thing.mesh.position.x = Utils.randFloat( -halfX, halfX );
                        thing.mesh.position.y = Utils.randFloat( -halfY, halfY );
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
                    var halfX, halfY;

                    //if( thing.type === 'floater' ) {
                    //} else if( thing.type === 'mine' ) {
                    //}
                },
                start: function() {
                    Game.bind( 'initted', this.initBind );

                    World.penus = 0;
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
                    Player.constrain();
                }
            }
        }
    },

});

}(this));
