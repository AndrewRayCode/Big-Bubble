Bub.Fireball = function() {

    this.defaults = {};

    // todo: player and this use this silly scale system, divided by orig
    // radius. We should just set starting radius to 1 and go from there
    // for everything?
    this.build = {
        scale: 1,
        radius: 10
    };

    Bub.Mixin.Entity.call( this );
};
    
Bub.Fireball.prototype = Object.create( Bub.Mixin.Entity.prototype );

Bub.Fireball.prototype.material = function() {
    return Bub.Shader.shaders.fireball();
};

Bub.Fireball.prototype.geometry = new THREE.SphereGeometry( 1, 32, 32 );

Bub.Fireball.prototype.loadGeometry = function() {
    return this.mesh = new THREE.Mesh( this.geometry, this.material() );
};

Bub.Fireball.prototype.load = function( options ) {
    options = options || {};

    var radius = options.radius || 10 + 5 * Math.random(),
        frustrum = Bub.camera.data.frustrum;

    this.mesh.position = new THREE.Vector3(
        options.x || Bub.Utils.randFloat( frustrum.min.x, frustrum.max.x ),
        options.y || frustrum.max.y + ( radius * 2 ),
        options.z || 0
    );

    this.inertia = options.inertia || new THREE.Vector3(
        0, -100 - ( Math.random() ), 0
    );

    this.scale( radius );
    this.r = radius;

    Bub.trigger( 'initted', this );
};

Bub.Fireball.prototype.updateFns = {
    move: function() {
        this.move( this.inertia );

        if ( this.mesh.position.y + this.r * 2 < Bub.camera.data.frustrum.min.y ) {
            Bub.trigger( 'free', this );
        }
    },
    collision: function() {
        var initBind = function( thing ) {
            if( thing instanceof Bub.Floater ) {
                thing.mesh.material = Bub.Shader.shaders.fireball();
                thing.replaceUpdater( 'collision', function() {
                    if( Bub.player.isCollidingWith( this ) ) {
                        Bub.trigger( 'free', this );

                        Bub.player.grow( this.r );

                        if( Bub.player.build.radius > Bub.Level.level.next ) {
                            Bub.Level.advance();
                        }
                    }
                });
            }
        };

        if( Bub.player.isCollidingWith( this ) ) {
            Bub.bind( 'initted', initBind );

            setTimeout( function() {
                Bub.player.mesh.material = Bub.Shader.shaders.fresnel();
                Bub.unbind( 'initted', initBind );
            }, 6000);

            var text = new Bub.Text3d('Fire Bubble!');
            text.introduce();
            Bub.trigger( 'free', this );
            Bub.player.mesh.material = Bub.Shader.shaders.fireball();
        }
    }
};

Bub.Fireball.prototype.scale = function( radius ) {
    this.build.radius = radius;
    var scale = this.build.scale = radius;
    this.mesh.scale.set( scale, scale, scale );
};
