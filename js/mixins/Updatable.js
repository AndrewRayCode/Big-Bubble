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

    removeUpdater: function( name ) {
        for( var x = 0; x < this.updateFns.length; x ++ ) {
            if( this.updateFns[ x ].name === name ) {
                this.updateFns.splice( x, 1 );
                break;
            }
        }
    },

    replaceUpdater: function( name, fn ) {
        var updater = this.getUpdateFn( name );
        this.replaced[ name ] = updater.fn;
        updater.fn = fn;
    },

    resetUpdater: function( name ) {
        var updater;

        if( this.replaced[ name ] ) {

            updater = this.getUpdateFn( name );
            
            if( updater.added ) {
                this.removeUpdater( name );
            } else {
                updater.fn = this.replaced[ name ];
                delete this.replaced[ name ];
            }
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
    },

    addUpdater: function( name, fn ) {
        this.updateFns.push({
            name: name,
            fn: fn,
            added: true
        });
    }

};
