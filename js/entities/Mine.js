Bub.Mine = function() {
    this.entityify();
};

_.extend( Bub.Mine.prototype, Bub.Mixins.entity );

Bub.Mine.prototype.collision = [ Bub.player ],

Bub.Mine.prototype.defaults = function() {
    return {
        fadeSpeed: 0.9,
        opacity: 0.5,
        phys: {
            friction: 0,
            mass: 100,
            velocity: new THREE.Vector3( 0, 0, 0 ),
            acceleration: new THREE.Vector3( 0, 0, 0 )
        }
    };
};

Bub.Mine.prototype.loadGeometry = function() {
    var me = this;

    return Bub.Utils.loadModel( 'media/mine.js' ).then( function( geometry ) {
        geometry.computeBoundingBox();

        me.dimensions = new THREE.Vector3(
            geometry.boundingBox.max.x - geometry.boundingBox.min.x,
            geometry.boundingBox.max.y - geometry.boundingBox.min.y,
            geometry.boundingBox.max.z - geometry.boundingBox.min.z
        );

        var material = new THREE.MeshLambertMaterial({
            shading: THREE.FlatShading,
            map: Bub.Utils.textures.metal,
            transparent: true
        });
        me.mesh = new THREE.Mesh( geometry, material );
    });
};

Bub.Mine.prototype.load = function( options ) {
    options = options || {};

    var radius = options.radius || 10;

    this.mesh.material.opacity = 0;
    this.mesh.position.x = options.x || Bub.Utils.randFloat( Bub.camera.data.frustrum.min.x, Bub.camera.data.frustrum.max.x );
    this.mesh.position.y = options.y || Bub.camera.data.frustrum.max.y + ( radius * 2 );
    this.mesh.position.z = 0;

    this.scaleTo( radius * 2 );

    this.r = radius;

    Bub.trigger( 'initted', this );
};

Bub.Mine.prototype.updateFns = [{
    name: 'main',
    fn: function() {
        this.updateLocks();
    }
}, {
    name: 'fade',
    fn: function() {
        if( this.mesh.material.opacity < 1 ) {
            this.mesh.material.opacity += Bub.Utils.speed( this.fadeSpeed );
        }
    }
}, {
    name: 'collision',
    fn: function() {
        if( Bub.player.isCollidingWith( this ) ) {
            Bub.trigger( 'mineCollision' );
        }
    }
}];
