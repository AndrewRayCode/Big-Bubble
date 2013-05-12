if ( !window.Detector.webgl ) {
    window.Detector.addGetWebGLMessage();
}

var pointLight1 = new THREE.PointLight(0x888888);
var pointLight2 = new THREE.PointLight(0x8888FF);
var pointLight3 = new THREE.PointLight(0xAA00AA);

var Game, Utils, Level, Player, World, Factory, Camera, BubbleManager;

//(function() {

Utils = {

    // Thank you SO
    //http://stackoverflow.com/questions/2353268/java-2d-moving-a-point-p-a-certain-distance-closer-to-another-point
    vecMoveOffset: function( vec1, vec2, dist ) {
        var vecA = new THREE.Vector3( vec1.x, vec1.y, 0 ),
            vecB = new THREE.Vector3( vec2.x, vec2.y, 0 );

        return vecA.add( vecB.sub( vecA ).normalize().multiply(
            new THREE.Vector3( dist, dist, dist )
        ));
    },

    sign: function( num ) {
        return num ? num < 0 ? -1 : 1 : 0;
    },

    sphereCollision: function( position1, position2, radius1, radius2 ) {
        return Math.pow( position2.x - position1.x, 2 ) +
            Math.pow( position1.y - position2.y, 2 ) <= Math.pow( radius1 + radius2, 2);
    },

    extend: function( mixin, obj ) {
        if( Game.initted ) {
            return $.extend( obj, Game.mixins[ mixin ] );
        } else {
            Game.mixers.push({ mixin: mixin, obj: obj });
            return obj;
        }
    },

    keyListen: function(key) {
        Mousetrap.bind(key, function() {
            World.keysDown[key] = true;
        });
        Mousetrap.bind(key, function() {
            delete World.keysDown[key];
        }, 'keyup');
    }

};

Game = {
    mixers: [],

    init: function() {
        this.initted = true;

        this.mixins = {
            entity: {
                lockTo: function( master, offset ) {
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
                moveLockTowards: function( entity, dist ) {
                    var computed = Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, dist ),
                        me = this;

                    this.lockOffset = {
                        x: computed.x - me.master.mesh.position.x,
                        y: computed.y - me.master.mesh.position.y
                    };

                },
                moveTowards: function( entity, dist ) {
                    var computed = Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, dist );

                    this.mesh.position.x = computed.x;
                    this.mesh.position.y = computed.y;

                },
                updateLocks: function() {
                    var me = this,
                        locks = this.locks;

                    if( locks ) {
                        for( var x = 0; x < locks.length; x++ ) {
                            locks[x].pos({
                                x: me.mesh.position.x + locks[x].lockOffset.x,
                                y: me.mesh.position.y + locks[x].lockOffset.y,
                                z: me.mesh.position.z + locks[x].lockOffset.z
                            });
                        }
                    }
                },
                scaleTo: function( scale ) {
                    this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = scale;
                }
            }
        };

        for( var x = 0; x < this.mixers.length; x++ ) {
            $.extend( this.mixers[x].obj, this.mixins[ this.mixers[x].mixin ]);
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

        // set its position
        pointLight1.position.z = 1030;
        pointLight2.position.z = 1030;
        pointLight3.position.z = 1030;

        // add to the scene
        World.scene.add(pointLight1);
        World.scene.add(pointLight2);
        World.scene.add(pointLight3);

        World.scene.matrixAutoUpdate = false;

        var sharkMaterial = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture( 'media/shark.png' ),
            transparent: true
        });
        var sharkGeometry = new THREE.PlaneGeometry(300, 300, 1, 1);
        var shark = new THREE.Mesh(sharkGeometry, sharkMaterial);
        shark.position.set( 50, 50, -100 );
        World.scene.add( shark );
        World.shark = shark;

        this.reqFrame();
    },

    reqFrame: function() {
        window.requestAnimationFrame( Game.reqFrame );
        Game.loop();
    },

    loop: function() {
        var timer = 0.0001 * Date.now();

        World.pu.time.value = ((new Date().getTime() / 10000000) % 1) * 10000;

        Player.update();
        Player.constrain();

        pointLight1.position.x = Player.mesh.position.x + 1000;
        pointLight1.position.y = Player.mesh.position.y;

        pointLight2.position.x = Player.mesh.position.x - 1000;
        pointLight2.position.y = Player.mesh.position.y;

        pointLight3.position.x = Player.mesh.position.x + 1000;
        pointLight3.position.y = Player.mesh.position.y + 1000;

        // This kind of makes me want to throw up
        //Camera.main.lookAt({
            //x: Player.mesh.position.x / 10,
            //y: Player.mesh.position.y / 10,
            //z: Player.mesh.position.z / 10
        //});

        var floater, id;

        for( id in BubbleManager.forgotten ) {
            floater = BubbleManager.forgotten[ id ];
            floater.moveLockTowards( Player, 0.01 );
            if( new Date() - floater.lockTime > 2600 ) {
                floater.unlock();
                BubbleManager.freeFloater( floater );
                Player.grow( floater.r / 12 );

                if( Player.build.radius > Level.level.next ) {
                    Level.advance();

                    Camera.main.zoomTimer = 30;
                }
            }
        }

        for( id in BubbleManager.floaters ) {
            floater = BubbleManager.floaters[ id ];
            floater.upate();

            if ( floater.mesh.position.y + floater.r * 2 < -Camera.data.frustrum.y ) {
                // TODO: fix this, bubbles should free sooner
                BubbleManager.freeFloater( floater );

            } else if( Player.isCollidingWith( floater ) ) {

                BubbleManager.forgetFloater( floater );
                floater.lockTo( Player );
                floater.moveLockTowards( Player, floater.r );
                floater.lockTime = new Date();
            }
        }

        if( Math.random() > 0.98 ) {
            BubbleManager.makeFloater({
                radius: 10 + Math.random() * 10
            });
        }


        World.shark.rotation.x += Math.sin( 50 * ( timer % 1 ) ) / 100;
        World.shark.position.x += Math.sin( 50 * ( timer % 1 ) );

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
        next: 100
    }, {
        next: 120
    }, {
        next: 140
    }],
    init: function() {
        this.index = -1;
        this.advance();
    },
    advance: function() {
        this.index++;
        this.level = this.levels[ this.index ];
    }
};

Player = Utils.extend('entity', {
    build: {
        radius: 20,
        origRadius: 20,
        scale: 1,
        segments: 32
    },
    phys: {
        inertia: { x: 0, y: 0 },
        acceleration: 0.6,
        deceleration: 0.8,
        max: 17
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

        mesh.position.x = 0;
        mesh.position.y = 0;
        mesh.position.z = 0;
        mesh.scale.x = mesh.scale.y = mesh.scale.z = 1;

        World.scene.add( mesh );
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
        this.pos({
            x: me.mesh.position.x + inertia.x,
            y: me.mesh.position.y + inertia.y
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

        this.stage.setSize(this.stage.width, this.stage.height);
    },

    populate: function() {

        //var bgCube = new THREE.Mesh( bgGeometry, bgMaterial );
        //bgCube.dynamic = true;
        //bgCube.position.set( 100, 50, 0 );
        //scene.add(bgCube);

        var skyBox = this.skyBox = Factory.makeGradientCube(
            Camera.data.frustrum.y * 2, 0x2185C5
        );
        World.scene.add( skyBox );
    }
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
            time: {value: 0.0, type:'f' },
            resolution: { value: new THREE.Vector2( World.stage.width , World.stage.height ), type:'v2' },
            mouse: { value: new THREE.Vector2( 10, 10 ), type:'v2' }
        };
        var bgShader = new THREE.ShaderMaterial( {
            uniforms: World.pu,
            vertexShader:   $('#vshader').text(),
            fragmentShader: $('#fshader').text()
            ,side: THREE.BackSide
        });

        var cube = new THREE.Mesh(
            geometry,
            bgShader
        );
        //scene.add(bg);
        return cube;
    }
};

Camera = {

    data: {
        zoom: 500,
        fov: 60,
        frustrum: {}
    },

    init: function() {
        // PerspectiveCamera( fov, aspect, near, far )
        this.main = new THREE.PerspectiveCamera(
            this.data.fov, World.stage.width / World.stage.height, 1, 100000
        );
        this.main.zoomTimer = 0;

        var mirror = this.mirror = new THREE.CubeCamera( 0.1, 10000, 128 );
        mirror.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
        World.scene.add( mirror );

        mirror.material = new THREE.MeshBasicMaterial({
            envMap: mirror.renderTarget
        });

        Camera.zoom( this.data.zoom );
    },

    zoom: function( level ) {
        var camera = this.main,
            data = this.data;

        data.zoom = camera.position.z = level;

        var frustumHeight = 2.0 * data.zoom * Math.tan(data.fov * 0.5 * ( Math.PI / 180 ) );

        data.frustrum = {
            x: frustumHeight * World.stage.aspect,
            y: frustumHeight
        };

        if( World.skyBox ) {
            World.skyBox.scale.x = World.skyBox.scale.y = World.skyBox.scale.z =
                ( data.frustrum.y * 2 ) / ( Camera.data.frustrum.y * 2 );
        }
    },

    update: function() {
        if( this.main.zoomTimer ) {
            this.main.zoomTimer--;
            this.zoom( Camera.data.zoom + 10 );
        }

        this.mirror.position.x = Player.mesh.position.x;
        this.mirror.position.y = Player.mesh.position.y;
        this.mirror.position.z = Player.mesh.position.z - 10;

        Player.mesh.visible = false;

        var floater, id;
        for( id in BubbleManager.forgotten ) {
            floater = BubbleManager.forgotten[ id ];
            floater.scaleTo( floater.mesh.scale.x + 2 );
        }
        for( id in BubbleManager.floaters ) {
            floater = BubbleManager.floaters[ id ];
            floater.scaleTo( floater.mesh.scale.x + 2 );
        }

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

        for( id in BubbleManager.forgotten ) {
            floater = BubbleManager.forgotten[ id ];
            floater.scaleTo( floater.mesh.scale.x - 2 );
        }
        for( id in BubbleManager.floaters ) {
            floater = BubbleManager.floaters[ id ];
            floater.scaleTo( floater.mesh.scale.x - 2 );
        }
        Player.mesh.visible = true;

        World.renderer.render( World.scene, Camera.main );
    }
};

var makeBubbleManager = function() {
    var floaters = {},
        forgotten = {},
        stickers = {},
        id = -1,
        freeFloaters = [];

    var floaterMaterial = new THREE.MeshPhongMaterial({
        color: new THREE.Color( 0x2185C5 ),
        transparent: true,
        opacity: 0.5
    });
    var floaterGeometry = new THREE.SphereGeometry( 1, 32, 32 );

    this.makeFloater = function( options ) {
        options = options || {};

        var floater,
            radius = options.radius || 10 + 5 * Math.random();

        if( freeFloaters.length ) {
            floater = freeFloaters.pop();
        } else {
            floater = Utils.extend('entity', {
                mesh: new THREE.Mesh( floaterGeometry, floaterMaterial ),
                upate: function() {
                    this.mesh.position.y += this.inertia.y;
                    this.updateLocks();
                }
            });
        }
        id++;

        floater.id = id;

        floater.mesh.position.x = options.x || -(Camera.data.frustrum.x / 2) + (( Math.random() * Camera.data.frustrum.x));
        floater.mesh.position.y = options.y || Camera.data.frustrum.y + ( radius * 2 );
        floater.mesh.position.z = 0;
        floater.inertia = options.inertia || {
            x: 0,
            y: -1 - ( Math.random() )
        };

        floater.scaleTo( 1 + radius );
        floater.r = radius;

        floaters[ id ] = floater;
        World.scene.add( floater.mesh );
    };

    this.forgetFloater = function( floater, free ) {
        delete floaters[ floater.id ];

        if( free ) {
            delete forgotten[ floater.id ];
            freeFloaters.push( floater );
            World.scene.remove( floater.mesh );
        } else {
            forgotten[ floater.id ] = floater;
        }
    };

    this.freeFloater = function( bubble ) {
        this.forgetFloater( bubble, true );
    };

    this.floaters = floaters;
    this.forgotten = forgotten;
    this.stickers = stickers;

    return this;
};
BubbleManager = makeBubbleManager();

Game.init();

//}());
