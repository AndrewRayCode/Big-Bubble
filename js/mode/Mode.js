Bub.Mode = function( props ) {
    _.extend( this, props );
};

Bub.Mode.prototype = {

    replaceFn: function( key, fn ) {
        this.replaced = this.replaced || {};
        this.replaced[ key ] = this[ key ];
        this[ key ] = fn;
    }

};
