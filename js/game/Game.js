(function( global ) {

var pointLight1 = new THREE.SpotLight(0xffffff);
pointLight1.shadowDarkness = 0.5;
pointLight1.intensity = 1;
pointLight1.castShadow = true;

var Game = function() {};

Game.prototype.activate = function() {
    Bub.Factory.loadAssets();

    this.initted = true;

    ['right', 'left', 'up', 'down'].forEach(function(key) {
        Bub.Utils.keyListen(key);
    });

    $( window ).blur(function() {
        Bub.World.keysDown = {};
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

Game.prototype.restart = function() {
    this.running = true;

    Bub.World.shark.position.set( 50, 50, -300 );

    this.time = {
        start: Date.now(),
        then: Date.now()
    };

    Bub.Level.reset();
    Bub.Level.advance();
    Bub.Cache.reset();
    Bub.player.reset();
};

Game.prototype.reqFrame = function() {
    window.requestAnimationFrame( this.reqFrame.bind( this ) );

    if( this.running ) {
        if( Bub.World.newSize ) {
            Bub.World.setSize( Bub.World.newSize );

            _.each( Bub.Shader.cache, function( shader, name ) {
                shader.uniforms.resolution.value = Bub.World.size.clone();
            });
        }
        this.loop();
    }
};

Game.prototype.loop = function() {
    var timer = 0.0001 * Date.now(),
        me = this;

    this.time.now = Date.now();
    this.time.delta = (this.time.now - this.time.then) / 1000;
    this.time.then = this.time.now;
    this.time.total = ( Date.now() - this.time.start ) / 1000;

    if( Bub.World.transition ) {
        Bub.World.transition();
    }

    // Update global shader uniform values
    _.each( Bub.Shader.cache, function( shader, name ) {
        if( 'time' in shader.uniforms ) {
            shader.uniforms.time.value = me.time.total;
        }
        if( 'viewVector' in shader.uniforms ) {
            shader.uniforms.viewVector.value = Bub.camera.main.position.clone();
        }
    });
    

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

    Bub.Offset.offset();
    Bub.camera.update();
    Bub.Offset.reset();
};

Bub.Game = new Game();

}(this));
