(function( global ) {

var World = global.World = Class.create({
    keysDown: {},

    scene: new THREE.Scene(),

    stage: {
        width: 400,
        height: 600,

        calculateAspect: function() {
            return (this.aspect = this.width / this.height);
        },

        setSize: function( x, y ) {
            var me = this;
            this.width = x;
            this.height = y;

            World.renderer.setSize( x, y );
            World.$container.css({
                width: x + 'px',
                height: y  + 'px'
            });
        }
    },

    load: function() {
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setSize( this.stage.width, this.stage.height );
        this.renderer.shadowMapEnabled = true;

        this.stage.calculateAspect();

        var $container = this.$container = $('#game').css({
            width: this.stage.width + 'px',
            height: this.stage.height + 'px'
        });
        $container.append( this.renderer.domElement );

        this.reset();
    },

    reset: function() {
        this.bgColor = new THREE.Color( 0x002462 );
        this.stage.setSize(this.stage.width, this.stage.height);
    },

    populate: function() {

        //var bgCube = new THREE.Mesh( bgGeometry, bgMaterial );
        //bgCube.dynamic = true;
        //bgCube.position.set( 100, 50, 0 );
        //scene.add(bgCube);
        var skyBox = this.skyBox = Mixin.Entity.create({
            mesh: Factory.makeGradientCube(
                Camera.data.frustrum.height * 5, 0x2185C5
            )
        });
        World.scene.add( skyBox.mesh );
    },
});

}(this));
