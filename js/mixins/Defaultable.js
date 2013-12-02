Bub.Mixins.defaultable = {

    resetDefaults: function() {
        if( _.isFunction( this.defaults ) ) {
            _.extend( this, this.defaults() );
        } else {
            for( var key in this.defaults ) {
                this[ key ] = _.isObject( this.defaults[ key ] ) ?
                    _.clone( this.defaults[ key ] ) :
                    this.defaults[ key ];
            }
        }
    }
};
