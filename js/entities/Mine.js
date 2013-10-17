Bub.Mine = function() {
    Bub.Mixin.Entity.call( this );
};

Bub.Mine.prototype = Object.create( Bub.Mixin.Entity.prototype );

Bub.Mine.prototype.collision = [ Bub.player ],

Bub.Mine.prototype.defaults = {
    fadeSpeed: 0.9,
    opacity: 0.5
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
    this.inertia = options.inertia || new THREE.Vector3(
        0, -100 - ( Math.random() ), 0
    );

    this.scaleTo( radius * 2 );

    this.r = radius;

    Bub.trigger( 'initted', this );
};

Bub.Mine.prototype.updateFns = {
    main: function() {
        this.move( this.inertia );
        this.updateLocks();
    },
    fade: function() {
        if( this.mesh.material.opacity < 1 ) {
            this.mesh.material.opacity += Bub.Utils.speed( this.fadeSpeed );
        }
    },
    collision: function() {
        if( Bub.player.isCollidingWith( this ) ) {
            Bub.trigger( 'mineCollision' );
        }
    }
};
