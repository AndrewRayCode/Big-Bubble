(function( global ) {

var Floater = Thing.register('floater', Mixin.Entity.create({

    material: function() {
        var bgColor = World.bgColor,
            me = this;

        return new THREE.MeshPhongMaterial({
            color: new THREE.Color().copy( World.bgColor ),
            transparent: true,
            opacity: this.opacity
        });
    },

    defaults: {
        fadeSpeed: 0.3,
        opacity: 0.5
    },

    geometry: new THREE.SphereGeometry( 1, 32, 32 ),

    loadGeometry: function() {
        return this.mesh = new THREE.Mesh( this.geometry, this.material() );
    },

    load: function( options ) {
        this.mesh.material = this.material();
        this.mesh.material.opacity = 0;

        options = options || {};

        var radius = options.radius || 10 + 5 * Math.random();

        this.mesh.position.x = options.x || Utils.randFloat( Camera.data.frustrum.min.x, Camera.data.frustrum.max.x );
        this.mesh.position.y = options.y || Camera.data.frustrum.max.y + ( radius * 2 );
        this.mesh.position.z = 0;
        this.inertia = options.inertia || {
            x: 0,
            y: -100 - ( Math.random() ),
            z: 0
        };

        this.scaleTo( 1 + radius );
        this.r = radius;

        Game.trigger( 'initted', this );
    },

    updateFns: {
        move: function() {
            this.move( this.inertia );
            this.updateLocks();

            if ( this.mesh.position.y + this.r * 2 < Camera.data.frustrum.min.y ) {
                Game.trigger( 'free', this );
            }
        },
        fade: function() {
            if( this.mesh.material.opacity < this.opacity ) {
                this.mesh.material.opacity += Utils.speed( this.fadeSpeed );
            }
        },
        collision: function() {
            if( Player.isCollidingWith( this ) ) {
                this.mesh.position.z = 0;
                this.lockTo( Player );

                this.setLockDistance( Player, this.r );

                this.replaceUpdater( 'move', function() {

                    this.mesh.material.color.r += 0.01;
                    this.mesh.material.color.b += 0.01;
                    this.moveLockTowards( Player, 4 );

                    if( new Date() - this.lockTime > 1600 ) {
                        Game.trigger( 'free', this );

                        Player.grow( this.r / 12 );

                        if( Player.build.radius > Level.level.next ) {
                            Level.advance();
                        }
                    }
                });
                this.replaceUpdater( 'collision', function() {});
            }
        }
    }
}));

}(this));
