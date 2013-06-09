if ( !window.Detector.webgl ) {
    window.Detector.addGetWebGLMessage();
}

// terrain blending? http://realitymeltdown.com/WebGL/Walkable%20Terrain.html

//var pointLight2 = new THREE.PointLight(0xffffff);
//var pointLight3 = new THREE.PointLight(0xffffff);
            
//var bgColor = new THREE.Color( 0x0094f2 );

(function() {

World.load();
World.populate();
Camera.activate();
Player.load();
Level.reset();
Game.activate();

}());
