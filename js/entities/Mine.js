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

    var material = new THREE.MeshLambertMaterial({
        shading: THREE.FlatShading,
        map: Bub.Assets.textures.metal,
        transparent: true
    });
    me.dimensions = Bub.Assets.models.mine.dimensions;
    me.mesh = new THREE.Mesh( Bub.Assets.models.mine, material );

    return me;
};

Bub.Mine.prototype.load = function( options ) {
    options = options || {};

    var radius = options.radius || 10;

    this.mesh.material.opacity = 0;
    this.mesh.position = options.position;
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
