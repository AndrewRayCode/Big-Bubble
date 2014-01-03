Bub.Camera = function() {
    this.resetDefaults();

    var me = this;

    Bub.bind( 'resize', function( dim ) {
        if( me.main ) {
            me.main.aspect = dim.x / dim.y;
            me.calculateFrustrum();
            me.main.updateProjectionMatrix();
        }
    });
};

_.extend( Bub.Camera.prototype, Bub.Mixins.defaultable );

Bub.Camera.prototype.defaults = {
    data: {
        target: new THREE.Vector3( 0, 0, 0 ),
        offset: new THREE.Vector3( 0, 0, 0 ),
        fov: 60,
        frustrum: {},
        zoom: 300
    }
};

Bub.Camera.prototype.activate = function() {

    // PerspectiveBub.Camera( fov, aspect, near, far )
    this.main = new THREE.PerspectiveCamera(
        this.data.fov, Bub.World.size.x / Bub.World.size.y, 1, 100000
    );

    Bub.World.scene.add( this.main );

    var mirror = this.mirror = new THREE.CubeCamera( 0.1, 10000, 128 );
    mirror.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
    mirror.rotation.z += THREE.Math.degToRad( 180 );
    Bub.World.scene.add( mirror );

    mirror.material = new THREE.MeshBasicMaterial({
        envMap: mirror.renderTarget
    });

    this.zoom( this.data.zoom );
};

Bub.Camera.prototype.getFrustrumAt = function( distanceFromCamera ) {
    var frustumHeight = 2.0 * distanceFromCamera * Math.tan(this.data.fov * 0.5 * ( Math.PI / 180 ) ),
        box = new THREE.Box2(),
        size = new THREE.Vector2(
            frustumHeight * Bub.World.aspect,
            frustumHeight
        );

    box.width = size.x;
    box.height = size.y;
    
    return box.setFromCenterAndSize( this.main.position, new THREE.Vector2(
        frustumHeight * Bub.World.aspect,
        frustumHeight
    ));
};

Bub.Camera.prototype.reset = function() {
    this.resetDefaults();
    this.calculateFrustrum();
};

Bub.Camera.prototype.calculateFrustrum = function() {
    this.data.frustrum = this.getFrustrumAt( this.data.zoom );
};

Bub.Camera.prototype.pan = function( vecOffset ) {
    vecOffset.z = vecOffset.z || 0;

    this.main.position.add( vecOffset );
    this.data.target.add( vecOffset );
    this.main.lookAt( this.data.target );

    Bub.World.plane.mesh.position.add( vecOffset );
    Bub.World.skyBox.mesh.position.add( vecOffset );

    this.calculateFrustrum();
};

Bub.Camera.prototype.zoom = function( level ) {
    var camera = this.main,
        data = this.data;

    data.zoom = camera.position.z = level;
    this.calculateFrustrum();

    if( Bub.World.skyBox ) {
        var planeScale = this.getFrustrumAt( data.zoom - Bub.World.plane.mesh.position.z );

        Bub.World.plane.scaleTo( planeScale.height );
    }
};

Bub.Camera.prototype.update = function() {
    if( this.data.zoom < Bub.Level.level.zoom ) {
        this.zoom( this.data.zoom + 10 );
        Bub.ModeManager.current.updateSpawner();
    }

    this.mirror.position.x = Bub.player.mesh.position.x * (Bub.World.dickx || 1.0);
    this.mirror.position.y = Bub.player.mesh.position.y * (Bub.World.dickx || 1.0);
    this.mirror.position.z = Bub.player.mesh.position.z + (Bub.player.build.radius + 500);

    this.mirror.position.x = Bub.player.mesh.position.x;
    this.mirror.position.y = Bub.player.mesh.position.y;
    this.mirror.position.z = Bub.player.mesh.position.z + Bub.player.build.radius;

    Bub.player.mesh.visible = false;

    _.each( Bub.player.locks, function( lock ) {
        lock.mesh.visible = false;
    });
    this.mirror.updateCubeMap( Bub.World.renderer, Bub.World.scene );
    _.each( Bub.player.locks, function( lock ) {
        lock.mesh.visible = true;
    });

    Bub.player.mesh.visible = true;
    Bub.World.plane.mesh.visible = true;

    Bub.World.renderer.render( Bub.World.scene, this.main );
};
