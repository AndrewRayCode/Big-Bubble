(function( global ) {

var Fireball = global.Fireball = Mixin.Entity.extend({

    defaults: {},

    // todo: player and this use this silly scale system, divided by orig
    // radius. We should just set starting radius to 1 and go from there
    // for everything?
    build: {
        scale: 1,
        radius: 10
    },

    material: function() {
        return Shader.shaders.fireball();
    },

    geometry: new THREE.SphereGeometry( 10, 32, 32 ),

    loadGeometry: function() {
        return this.mesh = new THREE.Mesh( this.geometry, this.material() );
    },

    load: function( options ) {
        options = options || {};
        this.build.origRadius = this.build.radius;

        var radius = options.radius || 10 + 5 * Math.random();

        this.mesh.position = new THREE.Vector3(
            options.x || Utils.randFloat( Camera.data.frustrum.min.x, Camera.data.frustrum.max.x ),
            options.y || Camera.data.frustrum.max.y + ( radius * 2 ),
            options.z || 0
        );

        this.inertia = options.inertia || new THREE.Vector3(
            0, -100 - ( Math.random() ), 0
        );

        this.scale( radius );
        this.r = radius;

        Game.trigger( 'initted', this );
    },

    updateFns: {
        move: function() {
            this.move( this.inertia );

            if ( this.mesh.position.y + this.r * 2 < Camera.data.frustrum.min.y ) {
                Game.trigger( 'free', this );
            }
        },
        collision: function() {
            var bind = function( thing ) {
                // todo, refactor this and utils.create
                if( thing.type === 'floater' ) {
                    thing.mesh.material = Shader.shaders.fireball();
                    thing.replaceUpdater( 'collision', function() {
                        if( Player.isCollidingWith( this ) ) {
                            Game.trigger( 'free', this );

                            Player.grow( this.r );

                            if( Player.build.radius > Level.level.next ) {
                                Level.advance();
                            }
                        }
                    });
                }
            };

            if( Player.isCollidingWith( this ) ) {
                Game.bind( 'initted', bind );

                setTimeout( function() {
                    Player.mesh.material = Shader.shaders.fresnel();
                    Game.unbind( 'initted', bind );
                }, 6000);

                var text = new Text3d('Fire Bubble!');
                text.introduce();
                Game.trigger( 'free', this );
                Player.mesh.material = Shader.shaders.fireball();
            }
        }
    },

    scale: function( radius ) {
        this.build.radius = radius;
        var scale = this.build.scale = radius / this.build.origRadius;
        this.mesh.scale.set( scale, scale, scale );
    }
});

Thing.register( 'fireball', new Fireball() );

}(this));
