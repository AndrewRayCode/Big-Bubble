(function( global ) {

var pointLight1 = new THREE.SpotLight(0xffffff);
pointLight1.shadowDarkness = 0.5;
pointLight1.intensity = 1;
pointLight1.castShadow = true;

var Game = global.Game = Class.create({
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

    activate: function() {
        Factory.loadAssets();

        this.initted = true;

        for( var x = 0; x < this.mixers.length; x++ ) {
            Utils._extend( this.mixers[x].mixin, this.mixers[x].obj );
        }

        ['right', 'left', 'up', 'down'].forEach(function(key) {
            Utils.keyListen(key);
        });

        $( window ).blur(function() {
            World.keysDown = {};
        });

        // set its position
        pointLight1.position.z = 1060;
        pointLight1.target = Player.mesh;
        Player.mesh.castShadow = true;
        //pointLight2.position.z = 2030;
        //pointLight3.position.z = 2030;

        // add to the scene
        World.scene.add( pointLight1 );
        //World.scene.add(pointLight2);
        //World.scene.add(pointLight3);

        World.scene.matrixAutoUpdate = false;

        var sharkMaterial = new THREE.MeshBasicMaterial({
            map: Utils.textures.shark,
            transparent: true,
            opacity:0.5
        });
        var sharkGeometry = new THREE.PlaneGeometry(300, 300, 1, 1);
        var shark = new THREE.Mesh( sharkGeometry, sharkMaterial );
        World.scene.add( shark );
        World.shark = shark;

        this.restart();
        this.reqFrame();
    },

    restart: function() {
        this.running = true;

        World.shark.position.set( 50, 50, -100 );

        this.time = {
            start: Date.now(),
            then: Date.now()
        };

        Level.reset();
        Level.advance();
        Thing.reset();
        Player.reset();
    },

    reqFrame: function() {
        window.requestAnimationFrame( Game.reqFrame );

        if( Game.running ) {
            Game.loop();
        }
    },

    loop: function() {
        Player.keyCheck();

        var timer = 0.0001 * Date.now(),
            bgColor = World.bgColor,
            me = this;

        this.time.now = Date.now();
        this.time.delta = (this.time.now - this.time.then) / 1000;
        this.time.then = this.time.now;
        this.time.total = ( Date.now() - this.time.start ) / 1000;

        if( World.transition ) {
            World.transition();
        }

        _.each( Shader.cache, function( shader, name ) {
            if( 'time' in shader.uniforms ) {
                shader.uniforms.time.value = me.time.total;
            }
            if( 'viewVector' in shader.uniforms ) {
                shader.uniforms.viewVector.value = Camera.main.position.clone();
            }
        });

        Player.mesh.lookAt( Camera.main.position );

        bgColor.addScalar( 0.0001 );
        //World.pu.bgColor.value = new THREE.Vector3( bgColor.r, bgColor.g, bgColor.b );

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

        Thing.updateThings();

        World.shark.rotation.x += Math.sin( 50 * ( timer % 1 ) ) / 100;
        World.shark.position.x += Math.sin( 50 * ( timer % 1 ) );
        World.shark.position.y -= 0.4;

        Camera.update();
    }
});

}(this));
