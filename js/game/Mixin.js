(function() {

var resetDefaults = function() {
    if( _.isFunction( this.defaults ) ) {
        _.extend( this, this.defaults() );
    } else {
        for( var key in this.defaults ) {
            this[ key ] = _.isObject( this.defaults[ key ] ) ?
                _.clone( this.defaults[ key ] ) :
                this.defaults[ key ];
        }
    }
};

// Entity

var Entity = function() {
    this.resetDefaults();
    this.replaced = {};

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

Entity.prototype.applyForce = function( forceVector ) {
    this.phys.acceleration.add( forceVector );
};

Entity.prototype.drag = function() {

    var velocity = this.phys.velocity.clone(),
        speed = velocity.length(),
        dragMagnitude = -Bub.World.phys.dragCoefficient * speed * speed;
 
    velocity.normalize().multiplyScalar( dragMagnitude );
 
    //Apply the force.
    this.applyForce( velocity );
};

Entity.updateFns = {
    phys: function() {
        if( !this.noGravity ) {
            this.applyForce( Bub.World.phys.gravity );
        }

        this.applyForce(
            this.phys.velocity.clone().normalize().multiplyScalar( -1 * this.phys.friction )
        );

        this.drag();
        this.mesh.position.add(
            this.phys.velocity.add(
                this.phys.acceleration.multiplyScalar( Bub.Game.time.delta )
            ).clone().multiplyScalar( Bub.Game.time.delta )
        );

        this.phys.acceleration.set( 0, 0, 0 );
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
    } else if( 'shader' in to ) {
        key =  Object.keys( to.shader )[0];
        tweener = this.mesh.material.uniforms[ key ];
        sendTo = {
            value: to.shader[ key ]
        };
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
    this.replaced[ key ] = this.updateFns[ key ];
    this.updateFns[ key ] = fn;
};

Entity.prototype.resetUpdater = function( key ) {
    if( this.replaced[ key ] ) {
        this.updateFns[ key ] = this.replaced[ key ];
        delete this.replaced[ key ];
    }
};

Entity.prototype.undoUpdaters = function() {
    for( var key in this.replaced ) {
        this.resetUpdater( key );
    }
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

Entity.prototype.move = function( vec ) {
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
    if( this.phys ) {
        this.phys.mass = scale;
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
