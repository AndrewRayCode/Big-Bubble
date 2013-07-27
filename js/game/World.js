(function( global ) {

var World = global.World = Mixin.Doodad.create({
    keysDown: {},

    scene: new THREE.Scene(),

    defaults: {
        size: new THREE.Vector2( 300, 500 ),
    },

    calculateAspect: function() {
        return ( this.aspect = this.size.x / this.size.y );
    },

    grow: function( dim ) {
        this.growTarget = this.size.clone().add( dim );
    },

    setSize: function( dim ) {
        this.size.copy( dim );
        this.calculateAspect();

        this.renderer.setSize( dim.x, dim.y );
        this.$container.css({
            width: dim.x + 'px',
            height: dim.y  + 'px'
        });

        Game.trigger( 'resize', dim );
    },

    init: function() {
        this._super();

        this.renderer = new THREE.WebGLRenderer( { autoClear: false, antialias: true } );
        this.renderer.shadowMapEnabled = true;

        this.$container = $('#game');
        this.setSize( this.size );

        this.$container.append( this.renderer.domElement );

        this.reset();
    },

    reset: function() {
        this.bgColor = new THREE.Color( 0x002462 );
        this.resetDefaults();
        this.setSize( this.size );
    },

    populate: function() {
        var skyBox = this.skyBox = Mixin.Entity.create({
            mesh: Factory.makeGradientCube(
                Camera.data.frustrum.height * 10, 0x2185C5
            )
        });
        skyBox.mesh.visible = false;
        this.scene.add( skyBox.mesh );
    },

    update: function() {

        if( this.growTarget ) {
            var delta = this.growTarget.clone().sub( World.size );

            if( Math.abs( delta.x ) > 0.1 || Math.abs( delta.y ) > 0.1 ) {
                this.newSize = new THREE.Vector2(
                    this.size.x + ( delta.x / 6 ) + 0.01,
                    this.size.y + ( delta.y / 6 ) + 0.01
                );
            } else {
                delete this.growTarget;
            }
        }
    }
});

}(this));
