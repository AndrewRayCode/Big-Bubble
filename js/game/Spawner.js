Bub.Spawner = function() {
    THREE.Object3D.call( this );
};

Bub.Spawner.prototype = Object.create( THREE.Object3D.prototype );
Bub.Spawner.constructor = Bub.Spawner;

Bub.Spawner.prototype.getRandomPoint = function() {
    var pos = new THREE.Vector3(
        Bub.Utils.randFloat( -0.5, 0.5 ),
        Bub.Utils.randFloat( -0.5, 0.5 ),
        Bub.Utils.randFloat( -0.5, 0.5 )
    );
    this.localToWorld( pos );
    return pos;
};

Bub.Spawner.prototype.update = function() {
    this.updateMatrixWorld();
};
