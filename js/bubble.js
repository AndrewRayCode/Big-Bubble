if ( !window.Detector.webgl ) {
    window.Detector.addGetWebGLMessage();
}

var pointLight1 = new THREE.PointLight(0xffffff);
//var pointLight2 = new THREE.PointLight(0xffffff);
//var pointLight3 = new THREE.PointLight(0xffffff);
            
//var bgColor = new THREE.Color( 0x0094f2 );

var Game, Utils, Level, Player, World, Factory, Camera, Thing;

//(function() {

Utils = {

    create: function( obj ) {
        var made = {};

        for( var key in obj ) {
            made[ key ] = $.isPlainObject( obj[ key ] ) ? Utils.create( obj[ key ] ) : obj[ key ];
        }

        return made;
    },

    randFloat: function( min, max ) {
        return Math.random() * ( max - min ) + min;
    },

    randInt: function( min, max ) {
        return Math.floor( Math.random() * ( max - min + 1 ) + min );
    },

    // Thank you SO // http://stackoverflow.com/questions/2353268/java-2d-moving-a-point-p-a-certain-distance-closer-to-another-point
    // Given two positions A and B, figure out where to put B so that is has
    // moved dist closer to A
    vecMoveOffset: function( vec1, vec2, speed ) {
        var vecA = new THREE.Vector3( vec1.x, vec1.y, vec1.z ),
            vecB = new THREE.Vector3( vec2.x, vec2.y, vec1.z );

        speed = speed * Game.time.delta;

        return vecA.add( vecB.sub( vecA ).normalize().multiply(
            new THREE.Vector3( speed, speed, speed )
        ));
    },

    sign: function( num ) {
        return num ? num < 0 ? -1 : 1 : 0;
    },

    distance3d: function( a, b ) {
        // this uses sqrt internally, fyi
        return a.clone().sub( b ).length();
    },

    sphereCollision: function( position1, position2, radius1, radius2 ) {
        return Utils.distance3d( position1, position2 ) < radius1 + radius2;
    },

    extend: function( mixin, obj ) {
        if( Game.initted ) {
            return this._extend( mixin, obj );
        } else {
            Game.mixers.push({ mixin: mixin, obj: obj });
            return obj;
        }
    },

    _extend: function( mixin, obj ) {
        var extended = $.extend( obj, Game.mixins[ mixin ] );

        if( extended._init ) {
            extended._init.call( extended );
        }

        return extended;
    },

    keyListen: function(key) {
        Mousetrap.bind(key, function() {
            World.keysDown[key] = true;
        });
        Mousetrap.bind(key, function() {
            delete World.keysDown[key];
        }, 'keyup');
    },

    loader: new THREE.JSONLoader(),

    loadModel: function( data ) {
        var deferred = Q.defer();
        this.loader.load( data, deferred.resolve );
        return deferred.promise;
    }
};

Game = {
    mixers: [],

    binder: $( {} ),
    bounds: {},

    trigger: function() {
        this.binder.trigger.apply( this.binder, arguments );
    },

    bind: function( evt, fn ) {
        var me = this;

        var newFn = function() {
            fn.apply(me.binder, Array.prototype.slice.call(arguments, 1) );
        };
        var evts = this.bounds[ evt ];
        if( !evts ) {
            evts = this.bounds[ evt ] = [];
        }
        evts.push( {orig: fn, bound: newFn } );
        this.binder.bind( evt, newFn );
    },

    unbind: function( evt, fn ) {
        if( !fn ) {
            this.binder.unbind( evt );
        } else {
            for( var x = 0; x < this.bounds[ evt ].length; x++ ) {
                if( this.bounds[ evt ][ x ].orig === fn ) {
                    this.binder.unbind( evt, this.bounds[ evt ][ x ].bound );
                    break;
                }
            }
        }
    },

    init: function() {
        this.initted = true;

        var resetDefaults = function() {
            for( var key in this.defaults ) {
                this[ key ] = $.isPlainObject( this.defaults[ key ] ) ?
                    $.extend({}, this.defaults[ key ]) :
                    this.defaults[ key ];
            }
        };

        this.mixins = {
            entity: {

                _init: function() {
                    this.resetDefaults();

                    if( this.updateFns ) {
                        this.update = function() {
                            for( var key in this.updateFns ) {
                                if( 'id' in this ) {
                                    this.updateFns[ key ].apply( this );
                                }
                            }
                        };
                    }
                },

                replaceUpdater: function( key, fn ) {
                    this.replaced = this.replaced || {};
                    this.replaced[ key ] = this.updateFns[ key ];
                    this.updateFns[ key ] = fn;
                },

                undoUpdaters: function() {
                    for( var key in this.replaced ) {
                        this.updateFns[ key ] = this.replaced[ key ];
                    }
                    delete this.replaced;
                },

                resetDefaults: resetDefaults,

                lockTo: function( master, offset ) {
                    this.locking = true;
                    this.lockTime = new Date();

                    this.lockOffset = offset || {
                        x: this.mesh.position.x - master.mesh.position.x,
                        y: this.mesh.position.y - master.mesh.position.y,
                        z: this.mesh.position.z - master.mesh.position.z
                    };

                    master.locks = master.locks || [];
                    master.locks.push( this );

                    this.master = master;
                },

                unlock: function() {
                    this.locking = false;

                    var mLocks = this.master.locks;

                    for( var x = 0; x < mLocks.length; x++ ) {
                        if( mLocks[x] === this ) {
                            mLocks.splice(x, 1);
                            break;
                        }
                    }
                    delete this.master;
                },

                isCollidingWith: function( sphere ) {
                    var mesh = sphere.mesh;
                    return Utils.sphereCollision(
                        mesh.position, this.mesh.position, sphere.r, this.build.radius
                    );
                },
                pos: function( xyz ) {
                    xyz.x && ( this.mesh.position.x = xyz.x );
                    xyz.y && ( this.mesh.position.y = xyz.y );
                    xyz.z && ( this.mesh.position.z = xyz.z );

                    this.updateLocks();
                },
                move: function( xyz ) {
                    this.mesh.position.add(
                        new THREE.Vector3( xyz.x, xyz.y, xyz.z ).multiplyScalar( Game.time.delta )
                    );

                    this.updateLocks();
                },
                moveLockTowards: function( entity, speed ) {
                    var computed = Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, speed ),
                        me = this;

                    this.lockOffset = {
                        x: computed.x - me.master.mesh.position.x,
                        y: computed.y - me.master.mesh.position.y
                    };

                },
                setLockDistance: function( entity, speed ) {
                    var computed = Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, speed / Game.time.delta ),
                        me = this;

                    this.lockOffset = {
                        x: computed.x - me.master.mesh.position.x,
                        y: computed.y - me.master.mesh.position.y
                    };

                },
                moveTowards: function( entity, speed ) {
                    var computed = Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, speed );

                    this.mesh.position.x = computed.x;
                    this.mesh.position.y = computed.y;

                },
                updateLocks: function() {
                    var me = this,
                        locks = this.locks;

                    if( locks ) {
                        for( var x = 0; x < locks.length; x++ ) {
                            locks[x].pos( new THREE.Vector3().addVectors( me.mesh.position, locks[x].lockOffset ) );
                        }
                    }
                },
                scaleTo: function( scale ) {
                    this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = scale;
                }
            },

            doodad: {
                _init: function() {
                    this.resetDefaults();
                },

                resetDefaults: resetDefaults
            }
        };

        for( var x = 0; x < this.mixers.length; x++ ) {
            Utils._extend( this.mixers[x].mixin, this.mixers[x].obj );
        }

        ['right', 'left', 'up', 'down'].forEach(function(key) {
            Utils.keyListen(key);
        });

        $( window ).blur(function() {
            World.keysDown = {};
        });

        World.init();
        Camera.init();
        World.populate();
        Player.init();
        Level.init();
        Thing.init();

        // set its position
        pointLight1.position.z = 1030;
        //pointLight2.position.z = 2030;
        //pointLight3.position.z = 2030;

        // add to the scene
        World.scene.add(pointLight1);
        //World.scene.add(pointLight2);
        //World.scene.add(pointLight3);

        World.scene.matrixAutoUpdate = false;

        var sharkMaterial = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture( 'media/shark.png' ),
            transparent: true,
            opacity:0.2
        });
        var sharkGeometry = new THREE.PlaneGeometry(300, 300, 1, 1);
        var shark = new THREE.Mesh(sharkGeometry, sharkMaterial);
        World.scene.add( shark );
        World.shark = shark;

        this.restart();
        this.reqFrame();
    },

    restart: function() {
        this.running = true;

        World.reset();
        Level.reset();
        Player.reset();
        Camera.reset();
        Thing.reset();

        World.shark.position.set( 50, 50, -100 );

        this.time = {
            start: Date.now(),
            then: Date.now()
        };
    },

    reqFrame: function() {
        window.requestAnimationFrame( Game.reqFrame );

        if( Game.running ) {
            Game.loop();
        }
    },

    loop: function() {
        var timer = 0.0001 * Date.now(),
            bgColor = World.bgColor;

        this.time.now = Date.now();
        this.time.delta = (this.time.now - this.time.then) / 1000;
        this.time.then = this.time.now;
        this.time.total = ( Date.now() - this.time.start ) / 1000;

        if( World.transition ) {
            World.transition();
        }

        World.pu.time.value = this.time.total;

        bgColor.addScalar( 0.0001 );
        World.pu.bgColor.value = new THREE.Vector3( bgColor.r, bgColor.g, bgColor.b );

        //World.pu.bgColor.value.b += 0.0001;
        //World.pu.dModifier.value += 0.001;
        //World.pu.brightness.value += 0.1;

        Player.update();
        Player.constrain();

        pointLight1.position.x = Player.mesh.position.x;
        pointLight1.position.y = Player.mesh.position.y;

        //pointLight2.position.x = Player.mesh.position.x - 1000;
        //pointLight2.position.y = Player.mesh.position.y;

        //pointLight3.position.x = Player.mesh.position.x + 1000;
        //pointLight3.position.y = Player.mesh.position.y + 1000;

        // This kind of makes me want to throw up
        //Camera.main.lookAt({
            //x: Player.mesh.position.x / 10,
            //y: Player.mesh.position.y / 10,
            //z: Player.mesh.position.z / 10
        //});

        var floater, id;

        //for( id in Thing.things.floater.active ) {
            //floater = Thing.forgotten[ id ];
            //floater.moveLockTowards( Player, 0.02 );
            //if( new Date() - floater.lockTime > 1600 ) {
                //floater.unlock();
                //Thing.freeFloater( floater );
                //Player.grow( floater.r / 12 );

                //if( Player.build.radius > Level.level.next ) {
                    //Level.advance();

                    //Camera.main.zoomTimer = 30;
                //}
            //}
        //}

            //console.log(' --- up things ');
        Thing.updateThings();

        //for( id in Thing.things.floater.active ) {
            //floater = Thing.floaters[ id ];
            //floater.upate();

            //if ( floater.mesh.position.y + floater.r * 2 < -Camera.data.frustrum.y ) {
                //// TODO: fix this, bubbles should free sooner
                //Thing.freeFloater( floater );

            //} else if( Player.isCollidingWith( floater ) ) {

                //Thing.forgetFloater( floater );
                //floater.lockTo( Player );
                //floater.moveLockTowards( Player, floater.r );
                //floater.lockTime = new Date();
            //}
        //}

        if( Math.random() > 0.97 ) {
            Thing.create('floater', {
                radius: 10 + Math.random() * 10
            });
        } else if( Math.random() > 0.993 ) {
            Thing.create('mine', {
                radius: 0.5 + Math.random() * 0.1
            });
        }


        World.shark.rotation.x += Math.sin( 50 * ( timer % 1 ) ) / 100;
        World.shark.position.x += Math.sin( 50 * ( timer % 1 ) );
        World.shark.position.y -= 0.4;

        //bg.rotation.y += 0.01;

        //var face, numberOfSides;
        //for ( var i = 0; i < World.skyBox.geometry.faces.length; i++ ) {
            //face = World.skyBox.geometry.faces[ i ];
            //// determine if current face is a tri or a quad
            //numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
            //// assign color to each vertex of current face
            //for( var j = 0; j < numberOfSides; j++ ) {
                //face.vertexColors[ j ].b += 0.0001;
            //}
        //}
        //World.skyBox.colorsNeedUpdate = true;

        Camera.update();
    }
};

Level = {
    levels: [{
        next: 10,
        zoom: 500
    }, {
        next: 50,
        zoom: 600
    }, {
        next: 80,
        zoom: 700,
        init: function() {
            World.Transition.run('forward');
        }
    }, {
        next: 90,
        zoom: 800,
        init: function() {
            World.Transition.end('forward');
        }
    }],
    reset: function() {
        this.init();
    },
    init: function() {
        this.index = -1;
        this.advance();
    },
    advance: function() {
        this.index++;
        this.level = this.levels[ this.index ];

        if( !this.level ) {
            this.levels[ this.index ] = $.extend({}, this.levels[ this.index - 1]);
            this.levels[ this.index ].next *= 1.5;
            this.levels[ this.index ].zoom += 100;
            this.level = this.levels[ this.index ];
        }

        if( this.level.init ) {
            this.level.init();
        }
    }
};

Player = Utils.extend('entity', {

    defaults: {
        build: {
            radius: 20,
            origRadius: 20,
            scale: 1,
            segments: 32
        },
        phys: {
            inertia: { x: 0, y: 0 },
            acceleration: 25,
            deceleration: 10,
            max: 400
        }
    },

    init: function() {
        var build = this.build,
            geometry = this.geometry = new THREE.SphereGeometry( this.build.radius, this.build.segments, this.build.segments );

        var fresnelShader = THREE.FresnelShader,
            uniforms = THREE.UniformsUtils.clone( fresnelShader.uniforms );

        var renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.NearestFilter,
            format: THREE.RGBFormat
        });

        uniforms.tCube.value = Camera.mirror.renderTarget;

        var fresnelMaterial = new THREE.ShaderMaterial({
            fragmentShader: fresnelShader.fragmentShader,
            vertexShader: fresnelShader.vertexShader,
            uniforms: uniforms
        });

        var mesh = this.mesh = new THREE.Mesh( geometry, fresnelMaterial );

        World.scene.add( mesh );
    },

    reset: function() {
        this.resetDefaults();

        this.mesh.position.x = 0;
        this.mesh.position.y = 0;
        this.mesh.position.z = 0;
        this.scaleTo( 1 );
    },

    update: function() {
        var phys = this.phys,
            inertia = this.phys.inertia;

        if( World.keysDown.right ) {
            inertia.x += phys.acceleration;

            if( inertia.x > phys.max ) {
                inertia.x = phys.max;
            }
        } else if( World.keysDown.left ) {
            inertia.x -= phys.acceleration;

            if( inertia.x < -phys.max ) {
                inertia.x = -phys.max;
            }
        } else if ( inertia.x ) {
            inertia.x -= Utils.sign( inertia.x ) * phys.deceleration;

            if( Math.abs( inertia.x ) <= phys.deceleration ) {
                inertia.x = 0;
            }
        }

        if( World.keysDown.up ) {
            inertia.y += phys.acceleration;

            if( inertia.y > phys.max ) {
                inertia.y = phys.max;
            }
        } else if( World.keysDown.down ) {
            inertia.y -= phys.acceleration;

            if( inertia.y < -phys.max ) {
                inertia.y = -phys.max;
            }
        } else if ( inertia.y ) {
            inertia.y -= Utils.sign( inertia.y ) * phys.deceleration;

            if( Math.abs( inertia.y ) <= phys.deceleration ) {
                inertia.y = 0;
            }
        }

        var me = this;
        this.move({
            x: inertia.x,
            y: inertia.y
        });
    },
    
    constrain: function() {
        var xLimit = Camera.data.frustrum.x / 2,
            yLimit = Camera.data.frustrum.y / 2,
            inertia = this.phys.inertia,
            mesh = this.mesh,
            radius = this.build.radius;

        if( mesh.position.y > yLimit - radius ) {
            mesh.position.y = yLimit - radius;
            inertia.y = 0;
        }
        if( mesh.position.y < -yLimit + radius ) {
            mesh.position.y = -yLimit + radius;
            inertia.y = 0;
        }
        if( mesh.position.x > xLimit - radius ) {
            mesh.position.x = xLimit - radius;
            inertia.x = 0;
        }
        if( mesh.position.x < -xLimit + radius ) {
            mesh.position.x = -xLimit + radius;
            inertia.x = 0;
        }
    },

    grow: function( radius ) {
        this.build.radius += radius;
        this.build.scale = this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = this.build.radius / this.build.origRadius;
    }
});

World = {
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

    init: function() {
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setSize( this.stage.width, this.stage.height );

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

        var skyBox = this.skyBox = Utils.extend('entity', {
            mesh: Factory.makeGradientCube(
                Camera.data.frustrum.y * 5, 0x2185C5
            )
        });
        World.scene.add( skyBox.mesh );
    },

    Transition: {
        run: function( id ) {
            var trans =  World.Transition.transitions[ id ];

            World.transition = function() {
                trans.loop();
            };
            trans.init();
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
                init: function() {
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
            }
        }
    },

};

Factory = {

    // From vertex colors http://stemkoski.github.io/Three.js/Vertex-Colors.html
    makeGradientCube: function( size, hex ) {

        var rgbPoint, face, numberOfSides, vertexIndex, color;

        size = size / 2;
        var material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors,
            side: THREE.BackSide
        });

        var geometry = new THREE.CubeGeometry( size, size, size, 1, 1, 1 ),
            faceIndices = [ 'a', 'b', 'c', 'd' ];

        for ( var i = 0; i < geometry.faces.length; i++ ) {
            face = geometry.faces[ i ];

            // determine if current face is a tri or a quad
            numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;

            // assign color to each vertex of current face
            for( var j = 0; j < numberOfSides; j++ ) {
                vertexIndex = face[ faceIndices[ j ] ];
                // store coordinates of vertex
                rgbPoint = geometry.vertices[ vertexIndex ];

                color = new THREE.Color( hex );

                //0.5 + rgbPoint.y / cubeSide, 0.5 + rgbPoint.z / cubeSide );
                color.r -= 0.3 * ( 0.5 - rgbPoint.x / size );
                color.g -= 0.3 * ( 0.5 - rgbPoint.y / size );
                color.b -= 0.3 * ( 0.5 - rgbPoint.z / size );
                face.vertexColors[ j ] = color;
            }
        }

        //var cube = new THREE.Mesh( geometry, material );
        //cube.dynamic = true;

        World.pu = {
            time: {value: 0, type:'f' },
            resolution: { value: new THREE.Vector2( World.stage.width , World.stage.height ), type:'v2' },
            mouse: { value: new THREE.Vector2( 10, 10 ), type:'v2' },
            beamSpeed: {value: 0.26, type:'f' },
            beamColor: {value: new THREE.Vector3( 0.1, 0.2, 0.8 ), type:'v3' },
            bgColor: {value: new THREE.Vector3( World.bgColor.r, World.bgColor.g, World.bgColor.b ), type:'v3' },
            dModifier: {value: 0, type:'f' },
            brightness: {value: 0.8, type:'f' },
            slantBrightness: {value: 0.1, type:'f' },
            numBeams: {value: 13, type:'i' }
        };
        var bgShader = new THREE.ShaderMaterial( {
            uniforms: World.pu,
            vertexShader:   $('#vshader').text(),
            fragmentShader: $('#fshader').text()
        });

        var cube = new THREE.Mesh(
            geometry,
            material
        );

        var plane = Utils.extend('entity', {
            mesh: new THREE.Mesh(
                new THREE.PlaneGeometry( Camera.data.frustrum.x * 1.5, Camera.data.frustrum.y * 1.5, 1, 1),
                bgShader
            )
        });
        plane.mesh.position.set( 0, 0, -1000 );
        World.plane = plane;
        World.scene.add( plane.mesh );

        return cube;
    }
};

Camera = Utils.extend('doodad', {

    defaults: {
        data: {
            zoom: 500,
            fov: 60,
            frustrum: {}
        }
    },

    init: function() {
        // PerspectiveCamera( fov, aspect, near, far )
        this.main = new THREE.PerspectiveCamera(
            this.data.fov, World.stage.width / World.stage.height, 1, 100000
        );

        var mirror = this.mirror = new THREE.CubeCamera( 0.1, 10000, 128 );
        mirror.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
        World.scene.add( mirror );

        mirror.material = new THREE.MeshBasicMaterial({
            envMap: mirror.renderTarget
        });

        this.reset();
    },

    reset: function() {
        this.resetDefaults();
        Camera.zoom( this.data.zoom );
    },

    getFrustrumAt: function( distanceFromCamera ) {
        var frustumHeight = 2.0 * distanceFromCamera * Math.tan(this.data.fov * 0.5 * ( Math.PI / 180 ) );

        return {
            x: frustumHeight * World.stage.aspect,
            y: frustumHeight
        };
    },

    zoom: function( level ) {
        var camera = this.main,
            data = this.data;

        this.data.zoom = level;
        data.zoom = camera.position.z = level;
        data.frustrum = this.getFrustrumAt( data.zoom );

        if( World.skyBox ) {
            World.skyBox.scaleTo(
                ( data.frustrum.y * 2 ) / ( Camera.data.frustrum.y * 2 ) * 2
            );

            var planeScale = this.getFrustrumAt( data.zoom - World.plane.mesh.position.z );
            World.plane.scaleTo(
                ( planeScale.y * 2 ) / ( Camera.data.frustrum.y * 2 ) * 2
            );
        }
    },

    update: function() {
        if( Camera.data.zoom < Level.level.zoom ) {
            this.zoom( Camera.data.zoom + 10 );
        }

        this.mirror.position.x = Player.mesh.position.x;
        this.mirror.position.y = Player.mesh.position.y;
        this.mirror.position.z = Player.mesh.position.z - 10;

        Player.mesh.visible = false;
        World.plane.mesh.visible = false;

        //var floater, id;
        //for( id in BubbleManager.forgotten ) {
            //floater = BubbleManager.forgotten[ id ];
            //floater.scaleTo( floater.mesh.scale.x + 2 );
        //}
        //for( id in BubbleManager.floaters ) {
            //floater = BubbleManager.floaters[ id ];
            //floater.scaleTo( floater.mesh.scale.x + 2 );
        //}

        //var cubeGeometry = World.skyBox.geometry,
            //faceIndices = [ 'a', 'b', 'c', 'd' ],
            //size = Camera.data.frustrum.y * 2,
            //face, numberOfSides, vertexIndex, point, color, i, j, rgbPoint;

        //for ( i = 0; i < cubeGeometry.faces.length; i++ ) {
            //face = cubeGeometry.faces[ i ];
            //// determine if current face is a tri or a quad
            //numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
            //// assign color to each vertex of current face
            //for( j = 0; j < numberOfSides; j++ ) {
                //vertexIndex = face[ faceIndices[ j ] ];
                //// store coordinates of vertex
                //point = cubeGeometry.vertices[ vertexIndex ];
                //// initialize color variable
                ////color = new THREE.Color( 0xffffff );
                ////color.setRGB( 0.5 + point.x / size, 0.5 + point.y / size, 0.5 + point.z / size );
                ////face.vertexColors[ j ] = color;
            //}
        //}

        //World.skyBox.colorsNeedUpdate = true;
        this.mirror.updateCubeMap( World.renderer, World.scene );

        //for ( i = 0; i < cubeGeometry.faces.length; i++ ) {
            //face = cubeGeometry.faces[ i ];

            //// determine if current face is a tri or a quad
            //numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;

            //// assign color to each vertex of current face
            //for( j = 0; j < numberOfSides; j++ ) {
                //vertexIndex = face[ faceIndices[ j ] ];
                //// store coordinates of vertex
                //rgbPoint = cubeGeometry.vertices[ vertexIndex ];

                //color = new THREE.Color( 0x2185C5 );

                ////0.5 + rgbPoint.y / cubeSide, 0.5 + rgbPoint.z / cubeSide );
                ////color.r -= 0.3 * ( 0.5 - rgbPoint.x / size );
                ////color.g -= 0.3 * ( 0.5 - rgbPoint.y / size );
                ////color.b -= 0.3 * ( 0.5 - rgbPoint.z / size );
                //color.setRGB( 0.5 + rgbPoint.x / size, 0.5 + rgbPoint.y / size, 0.5 + rgbPoint.z / size );
                //face.vertexColors[ j ] = color;
            //}
        //}
        //World.skyBox.colorsNeedUpdate = true;

        //for( id in BubbleManager.forgotten ) {
            //floater = BubbleManager.forgotten[ id ];
            //floater.scaleTo( floater.mesh.scale.x - 2 );
        //}
        //for( id in BubbleManager.floaters ) {
            //floater = BubbleManager.floaters[ id ];
            //floater.scaleTo( floater.mesh.scale.x - 2 );
        //}
        Player.mesh.visible = true;
        World.plane.mesh.visible = true;

        World.renderer.render( World.scene, Camera.main );
    }
});

Thing = {
    things: {},

    id: 0,

    init: function() {
        var me = this;
        Game.bind( 'free', function( thing ) {
            me.free( thing );
        });

        Game.bind( 'mineCollision', function( thing ) {
            Game.restart();
        });
    },

    reset: function() {
        var cache = this.things;
        for( var id in this.things ) {
            cache = this.things[ id ].active;
            for( var thingId in cache ) {
                this.free( cache[ thingId ] );
            }
        }
    },

    register: function( id, thing ) {
        thing.type = id;

        this.things[ id ] = {
            thing: thing,
            active: {},
            free: []
        };
    },
    
    create: function( thingId, options ) {
        var me = this;

        var complete = function() {
            thing.id = me.id;
            thing.init( options );
            cache.active[ thing.id ] = thing;

            World.scene.add( thing.mesh );

            me.id++;
        };

        var thing,
            cache = this.things[ thingId ],
            freeCache = cache.free;

        if( freeCache.length ) {
            thing = freeCache.pop();
            complete();
        } else {
            thing = Utils.create( cache.thing );
            var p = thing.loadGeometry( options );
            thing.type = thingId;

            p.then ? p.then( complete ) : complete();
        }
    },

    free: function( thing ) {

        if( thing.locking ) {
            thing.unlock();
        }
        if( thing.undoUpdaters ) {
            thing.undoUpdaters();
        }

        var cache = this.things[ thing.type ];
        delete cache.active[ thing.id ];
        delete thing.id;
        cache.free.push( thing );

        World.scene.remove( thing.mesh );
    },

    updateThings: function() {
        this.eachThing( function( thing ) {
            thing.update();
        });
    },

    eachThing: function( fn ) {
        var cache = this.things;
        for( var id in this.things ) {
            cache = this.things[ id ].active;
            for( var thingId in cache ) {
                fn( cache[ thingId ] );
            }
        }
    }
};

var Mine = Thing.register('mine', Utils.extend('entity', {
    collision: [ Player ],

    defaults: {
        fadeSpeed: 0.3,
        opacity: 0.5
    },

    loadGeometry: function() {
        var me = this;

        return Utils.loadModel( 'media/mine.js' ).then( function( geometry ) {
            var modelTex = THREE.ImageUtils.loadTexture( 'media/metal.jpg' );
            var material = new THREE.MeshLambertMaterial({
                shading: THREE.FlatShading,
                transparent: true
            });
            material = new THREE.MeshLambertMaterial({
                shading: THREE.FlatShading,
                map: modelTex,
                transparent: true
            });
            return me.mesh = new THREE.Mesh( geometry, material );
        });
    },

    init: function( options ) {
        options = options || {};

        var radius = options.radius || 1 + Math.random();

        this.mesh.material.opacity = 0;
        this.mesh.position.x = options.x || -(Camera.data.frustrum.x / 2) + (( Math.random() * Camera.data.frustrum.x));
        this.mesh.position.y = options.y || Camera.data.frustrum.y + ( radius * 2 );
        this.mesh.position.z = 0;
        this.inertia = options.inertia || {
            x: 0,
            y: -100 - ( Math.random() ),
            z: 0
        };

        this.scaleTo( radius );

        this.mesh.geometry.computeBoundingSphere();
        var bounding = this.mesh.geometry.boundingSphere;
        this.r = bounding.radius / 3;

        Game.trigger( 'initted', this );
    },

    updateFns: {
        main: function() {
            this.move( this.inertia );
            this.updateLocks();
        },
        fade: function() {
            if( this.mesh.material.opacity < 1 ) {
                this.mesh.material.opacity += this.fadeSpeed * Game.time.delta;
            }
        },
        collision: function() {
            if( Player.isCollidingWith( this ) ) {
                Game.trigger( 'mineCollision' );
            }
        }
    }
}));

var Floater = Thing.register('floater', Utils.extend('entity', {

    material: function() {
        var bgColor = World.bgColor,
            me = this;

        return new THREE.MeshPhongMaterial({
            color: new THREE.Color().copy( World.bgColor ),
            transparent: true,
            opacity: this.opacity
        });
    },

    defaults: {
        fadeSpeed: 0.3,
        opacity: 0.5
    },

    geometry: new THREE.SphereGeometry( 1, 32, 32 ),

    loadGeometry: function() {
        return this.mesh = new THREE.Mesh( this.geometry, this.material() );
    },

    init: function( options ) {
        this.mesh.material = this.material();
        this.mesh.material.opacity = 0;

        options = options || {};

        var radius = options.radius || 10 + 5 * Math.random();

        this.mesh.position.x = options.x || -(Camera.data.frustrum.x / 2) + (( Math.random() * Camera.data.frustrum.x));
        this.mesh.position.y = options.y || Camera.data.frustrum.y + ( radius * 2 );
        this.mesh.position.z = 0;
        this.inertia = options.inertia || {
            x: 0,
            y: -100 - ( Math.random() ),
            z: 0
        };

        this.scaleTo( 1 + radius );
        this.r = radius;

        Game.trigger( 'initted', this );
    },

    updateFns: {
        move: function() {
            this.move( this.inertia );
            this.updateLocks();

            if ( this.mesh.position.y + this.r * 2 < -Camera.data.frustrum.y ) {
                Game.trigger( 'free', this );
            }
        },
        fade: function() {
            if( this.mesh.material.opacity < this.opacity ) {
                this.mesh.material.opacity += this.fadeSpeed * Game.time.delta;
            }
        },
        collision: function() {
            if( Player.isCollidingWith( this ) ) {
                this.mesh.position.z = 0;
                this.lockTo( Player );

                this.setLockDistance( Player, this.r );

                this.replaceUpdater( 'move', function() {

                    this.mesh.material.color.r += 0.01;
                    this.mesh.material.color.b += 0.01;
                    this.moveLockTowards( Player, 4 );

                    if( new Date() - this.lockTime > 1600 ) {
                        Game.trigger( 'free', this );

                        Player.grow( this.r / 12 );

                        if( Player.build.radius > Level.level.next ) {
                            Level.advance();
                        }
                    }
                });
                this.replaceUpdater( 'collision', function() {});
            }
        }
    }
}));

Game.init();

//}());
