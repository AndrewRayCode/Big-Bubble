Bub.Obj3d = function( options ) {
    this.options = options || {};
    this.entityify();
};

_.extend( Bub.Obj3d.prototype, Bub.Mixins.entity );

Bub.Obj3d.prototype.collision = [ Bub.player ],

Bub.Obj3d.prototype.defaults = function() {
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

Bub.Obj3d.prototype.loadGeometry = function() {
    var me = this;
    var options = this.options;

    var radius = options.radius || 10;

    this.r = radius;

    Bub.trigger( 'initted', this );

    return Bub.Utils.loadScene( options.path ).then( function( geometry, materials ) {
        geometry.computeBoundingBox();

        me.dimensions = new THREE.Vector3(
            geometry.boundingBox.max.x - geometry.boundingBox.min.x,
            geometry.boundingBox.max.y - geometry.boundingBox.min.y,
            geometry.boundingBox.max.z - geometry.boundingBox.min.z
        );

        var material = new THREE.MeshLambertMaterial({
            map: Bub.Assets.textures.whaleSkin
        });
        me.mesh = new THREE.Mesh( geometry, material );
        me.mesh.position = options.position;
        me.scaleTo( radius * 2 );

        return me;
    });
};

Bub.Obj3d.prototype.updateFns = [];
