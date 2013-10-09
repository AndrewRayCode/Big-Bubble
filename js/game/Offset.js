(function() {

var Offset = function() {
    this.objects = [];
};

Offset.prototype.manage = function( object ) {
    this.objects.push( object );
    object.offset = new THREE.Vector3();
};

Offset.prototype.set = function( object, offset ) {
    object.offset = offset;
};

Offset.prototype.free = function( object ) {
    this.objects.splice( this.objects.indexOf( object ), 1 );
};

Offset.prototype.offset = function() {
    _.each( this.objects, function( obj ) {
        obj.position.add( obj.offset );
    });
};

Offset.prototype.reset = function() {
    _.each( this.objects, function( obj ) {
        obj.position.sub( obj.offset );
    });
};

Bub.Offset = new Offset();

}());
