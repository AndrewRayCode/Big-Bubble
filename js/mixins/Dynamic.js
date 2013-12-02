Bub.Mixins.dynamic = {

    lockTo: function( master, offset ) {
        this.locking = true;
        this.lockTime = new Date();

        this.lockOffset = offset || this.mesh.position.clone().sub( master.mesh.position );

        master.locks = master.locks || [];
        master.locks.push( this );

        this.master = master;
    },

    unlock: function() {
        this.locking = false;

        var mLocks = this.master.locks;

        for( var x = 0; x < mLocks.length; x++ ) {
            if( mLocks[x] === this ) {
                mLocks.splice(x, 1);
                break;
            }
        }
        delete this.master;
    },

    isCollidingWith: function( sphere ) {
        var mesh = sphere.mesh;
        return Bub.Utils.sphereCollision(
            mesh.position, this.mesh.position, sphere.r, this.build.radius
        );
    },

    speedLockTowards: function( entity, speed ) {
        var computed = Bub.Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, Bub.Utils.speed( speed ) );
        this.lockOffset = computed.sub( this.master.mesh.position );
    },

    setLockDistance: function( entity, distance ) {
        var computed = Bub.Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, distance );
        this.lockOffset = computed.sub( this.master.mesh.position );

    },

    moveTowards: function( entity, speed ) {
        var computed = Bub.Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, speed );
        this.mesh.position.copy( computed );
    },

    updateLocks: function() {
        var locks = this.locks;

        if( locks ) {
            for( var x = 0; x < locks.length; x++ ) {
                locks[x].mesh.position = new THREE.Vector3().addVectors( this.mesh.position, locks[x].lockOffset );
                locks[x].updateLocks();
            }
        }
    },

    scaleTo: function( scale ) {
        if( this.dimensions ) {
            scale = scale / this.dimensions.x;
        }
        if( this.phys ) {
            this.phys.mass = scale;
        }

        this.mesh.scale.set( scale, scale, scale );
    }

};
