(function( global ) {

var pointLight1 = new THREE.SpotLight(0xffffff);
pointLight1.shadowDarkness = 0.5;
pointLight1.intensity = 1;
pointLight1.castShadow = true;

var GameClass = function() {};

// This assumes there is only one game running at a time, so maybe this class
// should be refactored into a plain old object?
GameClass.prototype.triggers = {};

GameClass.prototype.releaseKeys = function() {
    Bub.Game.triggers = {};
    Bub.Game.keysDown = {};
};

GameClass.prototype.unbindKeys = function() {
    _.each( Bub.KeyActions, function( group ) {
        Mousetrap.unbind( group.keys );
    });
};

GameClass.prototype.bindKeys = function() {
    this.releaseKeys();

    _.each( Bub.KeyActions, function( keys, trigger ) {
        var group = Bub.KeyActions[ trigger ];

        if( group.once ) {
            Mousetrap.bind(group.keys, function() {
                if( !Bub.Game.keysDown[ trigger ] ) {
                    Bub.Game.keysDown[ trigger ] = true;
                    Bub.trigger( trigger );
                }
            });
            Mousetrap.bind(group.keys, function() {
                Bub.Game.keysDown[ trigger ] = null;
            }, 'keyup');
        } else {
            Mousetrap.bind(group.keys, function() {
                Bub.Game.triggers[ trigger ] = true;
            });
            Mousetrap.bind(group.keys, function() {
                Bub.Game.triggers[ trigger ] = null;
            }, 'keyup');
        }
    });
};

GameClass.prototype.activate = function() {
    var me = this;
    Bub.Factory.loadAssets();

    this.initted = true;

    $( window ).blur(function() {
        me.releaseKeys();
    });

    this.releaseKeys();
    this.unbindKeys();
    this.bindKeys();

    Bub.bind( 'pause', function() {
        Bub.Game.running = !Bub.Game.running;
    });

    // set its position
    pointLight1.position.z = 1060;
    pointLight1.target = Bub.player.mesh;
    Bub.player.mesh.castShadow = true;

    // add to the scene
    Bub.World.scene.add( pointLight1 );

    Bub.World.scene.matrixAutoUpdate = false;

    var sharkMaterial = new THREE.MeshBasicMaterial({
        map: Bub.Utils.textures.shark,
        transparent: true,
        opacity:0.5
    });
    var sharkGeometry = new THREE.PlaneGeometry(300, 300, 1, 1);
    var shark = new THREE.Mesh( sharkGeometry, sharkMaterial );
    Bub.World.scene.add( shark );
    Bub.World.shark = shark;

    this.restart();
    this.reqFrame();
};

GameClass.prototype.restart = function() {
    this.running = true;

    Bub.World.shark.position.set( 50, 50, -300 );

    this.time = {
        start: Date.now(),
        then: Date.now()
    };

    Bub.TextManager.reset();
    Bub.Transitions.reset();
    Bub.Level.reset();
    Bub.Level.advance();
    Bub.camera.reset();
    Bub.Cache.reset();
    Bub.player.reset();
};

GameClass.prototype.reqFrame = function() {
    window.requestAnimationFrame( this.reqFrame.bind( this ) );

    if( Bub.World.newSize ) {
        Bub.World.setSize( Bub.World.newSize );

        _.each( Bub.Shader.cache, function( shader, name ) {
            shader.uniforms.resolution.value = Bub.World.size.clone();
        });
    }
    this.loop();
};

GameClass.prototype.loop = function() {
    var timer = 0.0001 * Date.now(),
        me = this;

    this.time.now = Date.now();
    this.time.delta = (this.time.now - this.time.then) / 1000;
    this.time.then = this.time.now;
    this.time.total = ( Date.now() - this.time.start ) / 1000;

    // Update global shader uniform values
    _.each( Bub.Shader.cache, function( shader, name ) {
        if( 'time' in shader.uniforms ) {
            shader.uniforms.time.value = me.time.total;
        }
        if( 'viewVector' in shader.uniforms ) {
            shader.uniforms.viewVector.value = Bub.camera.main.position.clone();
        }
    });

    if( this.running ) {
        if( Bub.World.transition ) {
            Bub.World.transition();
        }
        
        TWEEN.update();
        Bub.Particle.update();
        Bub.TextManager.update();
        Bub.World.update();
        Bub.player.update();

        pointLight1.position.x = Bub.player.mesh.position.x;
        pointLight1.position.y = Bub.player.mesh.position.y;

        Bub.Cache.updateThings();

        Bub.World.shark.rotation.x += Math.sin( 50 * ( timer % 1 ) ) / 100;
        Bub.World.shark.position.x += Math.sin( 50 * ( timer % 1 ) );
        Bub.World.shark.position.y -= 0.4;
    }

    Bub.Offset.offset();
    Bub.camera.update();
    Bub.Offset.reset();
};

Bub.Game = new GameClass();

}(this));
