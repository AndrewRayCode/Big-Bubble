(function() {

var Cache = function() {
    var me = this;
    this.cache = [];
    this.active = {};
    this.id = 0;
    Bub.bind( 'free', function( thing ) {
        me.free( thing );
    });

    Bub.bind( 'mineCollision', function( thing ) {
        Bub.Game.restart();
    });
};

Cache.prototype.groupFor = function( ChildClass ) {
    var x, group;

    for( ; group = this.cache[ x++ ] ; ) {
        if( group.type === ChildClass
                || ChildClass instanceof group.type  ) {
            return this.cache[ x ];
        }
    }

    group = {
        type: ChildClass,
        free: []
    };
    this.cache.push( group );
    return group;
};

Cache.prototype.reset = function() {
    this.each( this.free.bind( this ) );
};

Cache.prototype.birth = function( ChildClass, options ) {
    var me = this,
        cache = this.groupFor( ChildClass ),
        madeThing;

    if( cache.free.length ) {
        madeThing = cache.free.pop();
    } else {
        // Should all things load their geometry on init?
        madeThing = new ChildClass( options );
        madeThing.loadGeometry( options );
    }

    madeThing.id = me.id;
    madeThing.load( options );
    madeThing.mesh.renderDepth = parseFloat( '0.5' + madeThing.id );

    me.active[ madeThing.id ] = madeThing;

    Bub.World.scene.add( madeThing.mesh );

    me.id++;

    return madeThing;
};

Cache.prototype.free = function( thing ) {

    if( thing.locking ) {
        thing.unlock();
    }
    if( thing.undoUpdaters ) {
        thing.undoUpdaters();
    }

    delete this.active[ thing.id ];
    delete thing.id;

    var cache = this.groupFor( thing );
    cache.free.push( thing );

    Bub.World.scene.remove( thing.mesh );
};

Cache.prototype.updateThings = function() {
    this.each( function( thing ) {
        thing.update();
    });
};

Cache.prototype.each = function( fn ) {
    _.each( this.active, fn );
};

Bub.Cache = new Cache();

}());
