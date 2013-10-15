Bub.Fireball = function() {

    this.defaults = {};

    // todo: player and this use this silly scale system, divided by orig
    // radius. We should just set starting radius to 1 and go from there
    // for everything?
    this.build = {
        scale: 1,
        radius: 80
    };

    Bub.Mixin.Entity.call( this );
};
    
Bub.Fireball.prototype = Object.create( Bub.Mixin.Entity.prototype );

Bub.Fireball.prototype.material = function() {
    return Bub.Shader.shaders.fireball();
};

Bub.Fireball.prototype.geometry = new THREE.SphereGeometry( 0.5, 32, 32 );

Bub.Fireball.prototype.duration = 10000;

Bub.Fireball.prototype.loadGeometry = function() {
    return this.mesh = new THREE.Mesh( this.geometry, this.material() );
};

// todo: load is a dumb thing along with init and loadgeometry
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

        this.mesh.rotation.x -= Bub.Utils.speed( 1.1 );

        if ( this.mesh.position.y + this.r * 2 < Bub.camera.data.frustrum.min.y ) {
            Bub.trigger( 'free', this );
        }
    },
    collision: function() {
        if( Bub.player.isCollidingWith( this ) ) {
            var text = new Bub.Text3d({
                text: 'Fire Bubble!',
                material: Bub.Shader.shaders.fireball()
            });
            text.introduce();
            Bub.trigger( 'fireup', this ).trigger( 'free', this );
        }
    }
};

Bub.Fireball.prototype.scale = function( radius ) {
    this.build.radius = radius;
    var scale = this.build.scale = radius * 2;
    this.mesh.scale.set( scale, scale, scale );

    if( 'diameter' in this.mesh.material.uniforms ) {
        this.mesh.material.uniforms.diameter.value = this.build.scale;
    }
};
