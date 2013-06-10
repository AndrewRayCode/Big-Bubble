(function( global ) {

var Mine = global.Mine = Thing.register('mine', Mixin.Entity.create({
    collision: [ Player ],

    defaults: {
        fadeSpeed: 0.3,
        opacity: 0.5
    },

    loadGeometry: function() {
        var me = this;

        return Utils.loadModel( 'media/mine.js' ).then( function( geometry ) {
            var modelTex = THREE.ImageUtils.loadTexture( 'media/metal.jpg' );
            var material = new THREE.MeshLambertMaterial({
                shading: THREE.FlatShading,
                transparent: true
            });
            material = new THREE.MeshLambertMaterial({
                shading: THREE.FlatShading,
                map: modelTex,
                transparent: true
            });
            return me.mesh = new THREE.Mesh( geometry, material );
        });
    },

    load: function( options ) {
        options = options || {};

        var radius = options.radius || 1 + Math.random();

        this.mesh.material.opacity = 0;
        this.mesh.position.x = options.x || Utils.randFloat( Camera.data.frustrum.min.x, Camera.data.frustrum.max.x );
        this.mesh.position.y = options.y || Camera.data.frustrum.max.y + ( radius * 2 );
        this.mesh.position.z = 0;
        this.inertia = options.inertia || {
            x: 0,
            y: -100 - ( Math.random() ),
            z: 0
        };

        this.scaleTo( radius );

        this.mesh.geometry.computeBoundingSphere();
        var bounding = this.mesh.geometry.boundingSphere;
        this.r = bounding.radius / 3;

        Game.trigger( 'initted', this );
    },

    updateFns: {
        main: function() {
            this.move( this.inertia );
            this.updateLocks();
        },
        fade: function() {
            if( this.mesh.material.opacity < 1 ) {
                this.mesh.material.opacity += this.fadeSpeed * Game.time.delta;
            }
        },
        collision: function() {
            if( Player.isCollidingWith( this ) ) {
                Game.trigger( 'mineCollision' );
            }
        }
    }
}));

}(this));
