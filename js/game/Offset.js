(function( global ) {

var Offset = global.Offset = Class.create({

    objects: [],

    manage: function( object ) {
        this.objects.push( object );
        object.offset = new THREE.Vector3();
    },

    set: function( object, offset ) {
        object.offset = offset;
    },

    free: function( object ) {
        this.objects.splice( this.objects.indexOf( object ), 1 );
    },

    offset: function() {
        _.each( this.objects, function( obj ) {
            obj.position.add( obj.offset );
        });
    },

    reset: function() {
        _.each( this.objects, function( obj ) {
            obj.position.sub( obj.offset );
        });
    }
});

}(this));
