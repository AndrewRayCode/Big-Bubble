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
        this.updateFns = _.clone( this.updateFns );
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

        // Friciton force
        this.applyForce(
            this.phys.velocity.clone().normalize().multiplyScalar( -1 * this.phys.friction )
        );

        this.drag();

        var elapsed = Bub.Game.time.delta;

        this.mesh.position.add(
            this.phys.velocity.add(
                this.phys.acceleration.multiplyScalar( elapsed )
            ).clone().multiplyScalar( elapsed )
        );

        if( this.phys.minCap && this.phys.velocity.length() < this.phys.minCap ) {
            this.phys.velocity.set( 0, 0, 0 );
        }

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

    this.lockOffset = offset || this.mesh.position.clone().sub( master.mesh.position );

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
    var computed = Bub.Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, Bub.Utils.speed( speed ) );
    this.lockOffset = computed.sub( this.master.mesh.position );
};

Entity.prototype.setLockDistance = function( entity, distance ) {
    var computed = Bub.Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, distance );
    this.lockOffset = computed.sub( this.master.mesh.position );

};

Entity.prototype.moveTowards = function( entity, speed ) {
    var computed = Bub.Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, speed );
    this.mesh.position.copy( computed );
};

Entity.prototype.updateLocks = function() {
    var locks = this.locks;

    if( locks ) {
        for( var x = 0; x < locks.length; x++ ) {
            locks[x].mesh.position = new THREE.Vector3().addVectors( this.mesh.position, locks[x].lockOffset );
            locks[x].updateLocks();
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
