if ( !window.Detector.webgl ) {
    window.Detector.addGetWebGLMessage();
}

// terrain blending? http://realitymeltdown.com/WebGL/Walkable%20Terrain.html

(function() {

World.load();
Camera.activate();
Player.load();
World.populate();
Level.reset();
Camera.zoom( Camera.data.zoom );
Game.activate();

}());
