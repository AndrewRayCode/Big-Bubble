Bub.Mixins.updatable = {

    initUpdaters: function() {
        this.replaced = {};

        // Copy update functions so we aren't replacing updaters on the
        // object's prototype, affecting all instances of this object
        this.updateFns = _.map( this.updateFns, _.clone );
    },

    getUpdateFn: function( name ) {
        return _.find( this.updateFns, function( obj ) {
            return obj.name === name;
        });
    },

    replaceUpdater: function( name, fn ) {
        var updater = this.getUpdateFn( name );
        this.replaced[ name ] = updater.fn;
        updater.fn = fn;
    },

    resetUpdater: function( name ) {
        if( this.replaced[ name ] ) {
            this.getUpdateFn( name ).fn = this.replaced[ name ];
            delete this.replaced[ name ];
        }
    },

    undoUpdaters: function() {
        for( var name in this.replaced ) {
            this.resetUpdater( name );
        }
    },

    update: function() {
        for( var x = 0; x < this.updateFns.length; x++ ) {
            if( 'id' in this ) {
                this.updateFns[ x ].fn.apply( this );
            }
        }
    }

};
