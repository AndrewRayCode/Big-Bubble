(function() {

var resetDefaults = function() {
    for( var key in this.defaults ) {
        this[ key ] = $.isPlainObject( this.defaults[ key ] ) ?
            $.extend({}, this.defaults[ key ]) :
            this.defaults[ key ];
    }
};

// Entity

var Entity = function() {
    this.resetDefaults();

    if( this.updateFns ) {
        // Copy update functions so we aren't replacing updaters on the
        // object's prototype, affecting all instances of this object
        this.updateFns = $.extend( {}, this.updateFns );
        this.update = function() {
            for( var key in this.updateFns ) {
                if( 'id' in this ) {
                    this.updateFns[ key ].apply( this );
                }
            }
        };
    }
};

Entity.prototype.tween = function( to, duration ) {
    var tweener = {},
        me = this,
        update = function() {},
        key, sendTo;

    if( 'material' in to ) {
        key =  Object.keys( to.material )[0];
        tweener = this.mesh.material.map[ key ];
        sendTo = to.material[ key ];

    } else if( 'position' in to ) {
        tweener = this.mesh.position;
        sendTo = to.position;

    } else if( 'rotation' in to ) {
        tweener = this.mesh.rotation;
        sendTo = to.rotation;

    } else if( 'opacity' in to ) {
        tweener = {
            opacity: this.mesh.material.opacity
        };
        sendTo = {
            opacity: to.opacity
        };
        update = function() {
            me.mesh.material.opacity = this.opacity;
        };
    }

    return new TWEEN.Tween( tweener )
        .to( sendTo, duration || 1000 )
        .onUpdate( update )
        .start();

};

Entity.prototype.replaceUpdater = function( key, fn ) {
    this.replaced = this.replaced || {};
    this.replaced[ key ] = this.updateFns[ key ];
    this.updateFns[ key ] = fn;
};

Entity.prototype.resetUpdater = function( key ) {
    this.replaced = this.replaced || {};
    this.updateFns[ key ] = this.replaced[ key ];
};

Entity.prototype.undoUpdaters = function() {
    for( var key in this.replaced ) {
        this.updateFns[ key ] = this.replaced[ key ];
    }
    delete this.replaced;
},

Entity.prototype.resetDefaults = resetDefaults;

Entity.prototype.lockTo = function( master, offset ) {
    this.locking = true;
    this.lockTime = new Date();

    this.lockOffset = offset || {
        x: this.mesh.position.x - master.mesh.position.x,
        y: this.mesh.position.y - master.mesh.position.y,
        z: this.mesh.position.z - master.mesh.position.z
    };

    master.locks = master.locks || [];
    master.locks.push( this );

    this.master = master;
};

Entity.prototype.unlock = function() {
    this.locking = false;

    var mLocks = this.master.locks;

    for( var x = 0; x < mLocks.length; x++ ) {
        if( mLocks[x] === this ) {
            mLocks.splice(x, 1);
            break;
        }
    }
    delete this.master;
};

Entity.prototype.isCollidingWith = function( sphere ) {
    var mesh = sphere.mesh;
    return Bub.Utils.sphereCollision(
        mesh.position, this.mesh.position, sphere.r, this.build.radius
    );
};

Entity.prototype.pos = function( xyz ) {
    xyz.x && ( this.mesh.position.x = xyz.x );
    xyz.y && ( this.mesh.position.y = xyz.y );
    xyz.z && ( this.mesh.position.z = xyz.z );

    this.updateLocks();
};

Entity.prototype.move = function( vec ) {
    this.mesh.position.add( Bub.Utils.speed( vec ) );

    this.updateLocks();
};

Entity.prototype.speedLockTowards = function( entity, speed ) {
    var computed = Bub.Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, Bub.Utils.speed( speed ) ),
        me = this;

    this.lockOffset = {
        x: computed.x - me.master.mesh.position.x,
        y: computed.y - me.master.mesh.position.y
    };

};

Entity.prototype.setLockDistance = function( entity, distance ) {
    var computed = Bub.Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, distance ),
        me = this;

    this.lockOffset = {
        x: computed.x - me.master.mesh.position.x,
        y: computed.y - me.master.mesh.position.y
    };

};

Entity.prototype.moveTowards = function( entity, speed ) {
    var computed = Bub.Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, speed );

    this.mesh.position.x = computed.x;
    this.mesh.position.y = computed.y;

};

Entity.prototype.updateLocks = function() {
    var me = this,
        locks = this.locks;

    if( locks ) {
        for( var x = 0; x < locks.length; x++ ) {
            locks[x].pos( new THREE.Vector3().addVectors( me.mesh.position, locks[x].lockOffset ) );
        }
    }
};

Entity.prototype.scaleTo = function( scale ) {
    if( this.dimensions ) {
        scale = scale / this.dimensions.x;
    }

    this.mesh.scale.set( scale, scale, scale );
};


// Doodad

var Doodad = function() {
    this.resetDefaults();
};

Doodad.prototype.resetDefaults = resetDefaults;

Bub.Mixin = {
    Entity: Entity,
    Doodad: Doodad
};

}());
