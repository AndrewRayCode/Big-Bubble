(function( global ) {

var Thing = global.Thing = Class.create({
    things: {},

    id: 0,

    init: function() {
        var me = this;
        Game.bind( 'free', function( thing ) {
            me.free( thing );
        });

        Game.bind( 'mineCollision', function( thing ) {
            Game.restart();
        });
    },

    reset: function() {
        var cache = this.things;
        for( var id in this.things ) {
            cache = this.things[ id ].active;
            for( var thingId in cache ) {
                this.free( cache[ thingId ] );
            }
        }
    },

    register: function( id, thing ) {
        thing.type = id;

        this.things[ id ] = {
            thing: thing,
            active: {},
            free: []
        };
    },
    
    makeEntity: function( thingId, options ) {
        var me = this;

        var complete = function() {
            thing.id = me.id;
            thing.load( options );
            thing.mesh.renderDepth = 500 + thing.id;
            cache.active[ thing.id ] = thing;

            World.scene.add( thing.mesh );

            me.id++;
        };

        var thing,
            cache = this.things[ thingId ],
            freeCache = cache.free;

        if( freeCache.length ) {
            thing = freeCache.pop();
            complete();
        } else {
            thing = Utils.create( cache.thing );
            var p = thing.loadGeometry( options );
            thing.type = thingId;

            p.then ? p.then( complete ) : complete();
        }
    },

    free: function( thing ) {

        if( thing.locking ) {
            thing.unlock();
        }
        if( thing.undoUpdaters ) {
            thing.undoUpdaters();
        }

        var cache = this.things[ thing.type ];
        delete cache.active[ thing.id ];
        delete thing.id;
        cache.free.push( thing );

        World.scene.remove( thing.mesh );
    },

    updateThings: function() {
        this.eachThing( function( thing ) {
            thing.update();
        });
    },

    eachThing: function( fn ) {
        var cache = this.things;
        for( var id in this.things ) {
            cache = this.things[ id ].active;
            for( var thingId in cache ) {
                fn( cache[ thingId ] );
            }
        }
    }
});

}(this));
