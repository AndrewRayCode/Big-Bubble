(function( global ) {

var pointLight1 = new THREE.SpotLight(0xffffff);
pointLight1.shadowDarkness = 0.5;
pointLight1.intensity = 1;
pointLight1.castShadow = true;

var GameClass = function() {};

// This assumes there is only one game running at a time, so maybe this class
// should be refactored into a plain old object?
GameClass.prototype.triggers = {};
GameClass.prototype.timeouts = {};
GameClass.prototype._toId = 0;
GameClass.prototype.pauseTime = 0;

GameClass.prototype.releaseKeys = function() {
    this.triggers = {};
    this.keysDown = {};
};

// Release all known keybindings
GameClass.prototype.unbindKeys = function() {
    _.each( Bub.KeyActions, function( group ) {
        Mousetrap.unbind( group.keys );
    });
};

// Bind all keys based on the contents of KeyActions
GameClass.prototype.bindKeys = function() {
    var me = this;
    me.releaseKeys();

    _.each( Bub.KeyActions, function( keys, trigger ) {
        var group = Bub.KeyActions[ trigger ];

        // Is this a key that shouldn't repeat when held down?
        if( group.once ) {

            // Broadcast this keypress if it's not being held down
            Mousetrap.bind(group.keys, function() {
                if( !me.keysDown[ trigger ] ) {
                    me.keysDown[ trigger ] = true;
                    Bub.trigger( trigger );
                }
            });

            // On key release, let the world know it's ok to continue
            Mousetrap.bind(group.keys, function() {
                me.keysDown[ trigger ] = null;
            }, 'keyup');
        } else {

            // For regular repeatable keys, listen for the down...
            Mousetrap.bind(group.keys, function() {
                me.triggers[ trigger ] = true;
            });

            // And release on the up
            Mousetrap.bind(group.keys, function() {
                me.triggers[ trigger ] = null;
            }, 'keyup');
        }
    });
};

// On pause, track how long we are paused for (to resume Tween.update at
// correct time) and update all timeouts
GameClass.prototype.pause = function() {
    var me = this;
    me.pauseStart = Bub.Utils.now();
    _.each( me.timeouts, function( group ,id) {
        clearTimeout( group.id );
        group.remaining = group.duration - ( Bub.Utils.now() - group.start );
    });
};

// Same thing for unpause, but backwards
GameClass.prototype.unpause = function() {
    var me = this;
    me.pauseTime += Bub.Utils.now() - me.pauseStart;
    _.each( me.timeouts, function( group, id ) {
        group.id = setTimeout( group.fn, group.remaining );
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

    // Listen for the key event(s) that pauses toggling
    Bub.bind( 'pauseToggle', function() {
        me.running = !me.running;
        Bub.trigger( ( me.running ? 'un' : '' ) + 'pause' );
    });

    Bub.bind( 'pause', _.bind( me.pause, me ) );
    Bub.bind( 'unpause', _.bind( me.unpause, me ) );

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
        start: Bub.Utils.now(),
        then: Bub.Utils.now()
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
    var timer = 0.0001 * Bub.Utils.now(),
        me = this;

    this.time.now = Bub.Utils.now();
    this.time.delta = (this.time.now - this.time.then) / 1000;
    this.time.then = this.time.now;
    this.time.total = ( Bub.Utils.now() - this.time.start ) / 1000;

    // Update global shader uniform values
    _.each( Bub.Shader.cache, function( shader, name ) {
        if( 'time' in shader.uniforms ) {
            shader.uniforms.time.value = me.time.total;
        }
        if( 'viewVector' in shader.uniforms ) {
            shader.uniforms.viewVector.value = Bub.camera.main.position.clone();
        }
    });

    // Only update certain things if the game is unpaused
    if( this.running ) {
        if( Bub.World.transition ) {
            Bub.World.transition();
        }
        
        //TWEEN.update( this.time.now - this.pauseTime );
        TWEEN.update();
        Bub.Particle.update();
        Bub.TextManager.update();
        Bub.World.update();
        Bub.player.update();

        pointLight1.position.x = Bub.player.mesh.position.x;
        pointLight1.position.y = Bub.player.mesh.position.y;

        Bub.Cache.updateThings();

        Bub.World.shark.position.y -= 0.4;
    }

    Bub.World.shark.rotation.x += Math.sin( 50 * ( timer % 1 ) ) / 100;
    Bub.World.shark.position.x += Math.sin( 50 * ( timer % 1 ) );

    Bub.Offset.offset();
    Bub.camera.update();
    Bub.Offset.reset();
};

// Set a timeout that is pausible by storing metadata about it. This is a very
// likely place to look for memory leaks!
GameClass.prototype.timeout = function( duration, fn ) {
    var me = this;
    if(!fn){throw new Error('nofn');}

    me._toId++;

    // When this timeout completes, delete it from our cache and execute the
    // timeout function
    var complete = (function( id ) {
        return function() {
            delete me.timeouts[ id ];
            fn();
        };

    }( me._toId ));

    var id = setTimeout( complete, duration );

    return this.timeouts[ me._toId ] = {
        key: me._toId,
        id: id,
        start: Bub.Utils.now(),
        duration: duration,
        fn: complete
    };
};

// Stop a timeout from executing and remove it from our knowledge
GameClass.prototype.clearTimeout = function( timeout ) {
    if( timeout ) {
        clearTimeout( timeout.id );
        delete this.timeouts[ timeout.key ];
    }
};

Bub.Game = new GameClass();

}(this));
