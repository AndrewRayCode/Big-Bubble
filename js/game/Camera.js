(function( global ) {

var Camera = global.Camera = Mixin.Doodad.create({

    defaults: {
        data: {
            target: new THREE.Vector3( 0, 0, 0 ),
            fov: 60,
            frustrum: {}
        }
    },

    init: function() {
        this._super();
    },

    activate: function() {
        this.data.zoom = this.defaults.zoom = Level.levels[0].zoom;

        // PerspectiveCamera( fov, aspect, near, far )
        this.main = new THREE.PerspectiveCamera(
            this.data.fov, World.stage.width / World.stage.height, 1, 100000
        );

        var mirror = this.mirror = new THREE.CubeCamera( 0.1, 10000, 128 );
        mirror.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
        mirror.rotation.z += THREE.Math.degToRad( 180 );
        World.scene.add( mirror );

        mirror.material = new THREE.MeshBasicMaterial({
            envMap: mirror.renderTarget
        });

        this.zoom( this.data.zoom );
    },

    getFrustrumAt: function( distanceFromCamera ) {
        var frustumHeight = 2.0 * distanceFromCamera * Math.tan(this.data.fov * 0.5 * ( Math.PI / 180 ) ),
            box = new THREE.Box2(),
            size = new THREE.Vector2(
                frustumHeight * World.stage.aspect,
                frustumHeight
            );

        box.width = size.x;
        box.height = size.y;
        
        return box.setFromCenterAndSize( this.main.position, new THREE.Vector2(
            frustumHeight * World.stage.aspect,
            frustumHeight
        ));
    },

    calculateFrustrum: function( ) {
        this.data.frustrum = this.getFrustrumAt( this.data.zoom );
    },

    pan: function( vecOffset ) {
        vecOffset.z = vecOffset.z || 0;

        Camera.main.position.add( vecOffset );
        Camera.data.target.add( vecOffset );
        Camera.main.lookAt( Camera.data.target );

        World.plane.mesh.position.add( vecOffset );
        World.skyBox.mesh.position.add( vecOffset );

        this.calculateFrustrum();
    },

    zoom: function( level ) {
        var camera = this.main,
            data = this.data;

        data.zoom = camera.position.z = level;
        this.calculateFrustrum();

        if( World.skyBox ) {
            var planeScale = this.getFrustrumAt( data.zoom - World.plane.mesh.position.z );

            World.plane.scaleTo( planeScale.height );
        }
    },

    update: function() {
        if( Camera.data.zoom < Level.level.zoom ) {
            this.zoom( Camera.data.zoom + 10 );
        }

        this.mirror.position.x = Player.mesh.position.x * (World.dickx || 1.0);
        this.mirror.position.y = Player.mesh.position.y * (World.dickx || 1.0);
        this.mirror.position.z = Player.mesh.position.z + (Player.build.radius + 500);

        this.mirror.position.x = Player.mesh.position.x;
        this.mirror.position.y = Player.mesh.position.y;
        this.mirror.position.z = Player.mesh.position.z + Player.build.radius;

        Player.mesh.visible = false;

        _.each( Player.locks, function( lock ) {
            lock.mesh.visible = false;
        });
        this.mirror.updateCubeMap( World.renderer, World.scene );
        _.each( Player.locks, function( lock ) {
            lock.mesh.visible = true;
        });

        Player.mesh.visible = true;
        World.plane.mesh.visible = true;

        World.renderer.render( World.scene, Camera.main );
    }
});

}(this));
