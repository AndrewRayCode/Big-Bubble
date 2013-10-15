if ( !window.Detector.webgl ) {
    window.Detector.addGetWebGLMessage();
}

// terrain blending? http://realitymeltdown.com/WebGL/Walkable%20Terrain.html

(function() {

var bubbleApp = angular.module( 'bubbleApp', [] );

bubbleApp.controller('body', function($scope) {
    $scope.score = 0;

    Bub.bind( 'points', function( radius ) {
        $scope.$apply(function() {
            $scope.score += Math.round( radius );
        });
    });
});

Bub.camera = new Bub.Camera();
Bub.player = new Bub.Player();

//in middle of refactor, need to namespace all classes and instantaite all
//singletons and sleep on this. singletons should just be objects probably
Bub.Shader.load();
Bub.camera.activate();
Bub.player.load();
Bub.World.populate();
Bub.camera.zoom( Bub.camera.data.zoom );
Bub.Game.activate();

}());
