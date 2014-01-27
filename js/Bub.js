(function( global ) {

global.Bub = {

    binder: $( {} ),
    bounds: {},
    timeouts: {},

    trigger: function() {
        var args = [ arguments[0] ];
        args = args.concat( [ Array.prototype.slice.call(arguments, 1) ] );
        this.binder.trigger.apply( this.binder, args );
        return this;
    },

    bind: function( evt, fn ) {
        var me = this;

        var newFn = function() {
            fn.apply(me.binder, Array.prototype.slice.call(arguments, 1) );
        };
        var evts = this.bounds[ evt ];
        if( !evts ) {
            evts = this.bounds[ evt ] = [];
        }
        evts.push( { orig: fn, bound: newFn } );
        this.binder.bind( evt, newFn );

        return this;
    },

    unbind: function( evt, fn ) {
        if( !fn ) {
            this.binder.unbind( evt );
        } else if( this.bounds[ evt ] ) {
            for( var x = 0; x < this.bounds[ evt ].length; x++ ) {
                if( this.bounds[ evt ][ x ].orig === fn ) {
                    this.binder.unbind( evt, this.bounds[ evt ][ x ].bound );
                    break;
                }
            }
        }

        return this;
    },

};

})( this );
