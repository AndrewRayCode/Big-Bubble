(function() {

var World = function() {
    this.resetDefaults();

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ autoClear: false, antialias: true });
    this.renderer.shadowMapEnabled = true;

    this.$container = $('#game');
    this.$wrapper = this.$container.parent();
    this.setSize( this.size );

    this.$container.append( this.renderer.domElement );

    this.reset();
};

_.extend( World.prototype, Bub.Mixins.defaultable );

World.prototype.phys = {
    gravity: new THREE.Vector3( 0, -100, 0 ),
    dragCoefficient: 0.02,
    minCap: 9
};

World.prototype.defaults = {
    size: new THREE.Vector2( 300, 500 ),
};

World.prototype.calculateAspect = function() {
    return ( this.aspect = this.size.x / this.size.y );
};

World.prototype.grow = function( dim ) {
    this.growTarget = this.size.clone().add( dim );

};

World.prototype.setSize = function( dim ) {
    this.size.copy( dim );
    this.calculateAspect();

    this.renderer.setSize( dim.x, dim.y );
    this.$container.css({
        width: dim.x + 'px',
        height: dim.y  + 'px'
    });
    this.$wrapper.css({
        width: ( 240 + dim.x ) + 'px',
    });

    Bub.trigger( 'resize', dim );
};

World.prototype.reset = function() {
    this.bgColor = new THREE.Color( 0x002462 );
    this.resetDefaults();
    this.setSize( this.size );
};

World.prototype.populate = function() {
    var skyBox = this.skyBox = new Bub.GenericEntity();
    skyBox.mesh = Bub.Factory.makeGradientCube(
        Bub.camera.data.frustrum.height * 10, 0x2185C5
    );
    skyBox.mesh.visible = false;
    this.scene.add( skyBox.mesh );
};

World.prototype.update = function() {

    if( this.growTarget ) {
        var delta = this.growTarget.clone().sub( Bub.World.size );

        if( Math.abs( delta.x ) > 0.1 || Math.abs( delta.y ) > 0.1 ) {
            this.newSize = new THREE.Vector2(
                this.size.x + ( delta.x / 6 ) + 0.01,
                this.size.y + ( delta.y / 6 ) + 0.01
            );
        } else {
            delete this.growTarget;
        }
    }
};

Bub.World = new World();

}());
