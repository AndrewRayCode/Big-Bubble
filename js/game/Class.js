(function( global ) {

var Class = global.Class = function() {};

Class.extend = function( props ) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)

    var proto = Object.create( _super );

    // Copy the properties over onto the new prototype
    for ( var name in props ) {
        // Check if we're overwriting an existing function
        if( typeof props[name] === 'function' && typeof _super[name] === 'function' && /\b_super\b/.test(props[name]) ) {
            proto[name] = (function(name, fn) {
                return function() {
                    var tmp = this._super;

                    // Add a new ._super() method that is the same method
                    // but on the super-class
                    this._super = _super[name];

                    // The method only need to be bound temporarily, so we
                    // remove it when we're done executing
                    var ret = fn.apply(this, arguments);
                    this._super = tmp;

                    return ret;
                };
            })(name, props[name]);
        } else {
            proto[name] = props[name];
        }
    }

    // The new constructor
    var newClass = typeof proto.init === 'function' ?
        proto.init : // All construction is actually done in the init method
        function() {};

    // Populate our constructed prototype object
    newClass.prototype = proto;

    // Enforce the constructor to be what we expect
    proto.constructor = newClass;

    // And make this class extendable
    newClass.extend = Class.extend;
    newClass.create = Class.create;

    return newClass;
};

Class.create = function( props ) {
    return new ( this.extend.call( this, props ) )();
};

}(this));
