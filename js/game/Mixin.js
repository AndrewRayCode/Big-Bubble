(function( global ) {

var resetDefaults = function() {
    for( var key in this.defaults ) {
        this[ key ] = $.isPlainObject( this.defaults[ key ] ) ?
            $.extend({}, this.defaults[ key ]) :
            this.defaults[ key ];
    }
};

var Mixin = global.Mixin = {

    Entity: Class.extend({

        tween: function( to, duration ) {
            var tweener = {},
                me = this,
                update = function() {},
                sendTo;

            if( 'position' in to ) {
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

        },

        init: function() {
            this.resetDefaults();

            if( this.updateFns ) {
                this.update = function() {
                    for( var key in this.updateFns ) {
                        if( 'id' in this ) {
                            this.updateFns[ key ].apply( this );
                        }
                    }
                };
            }
        },

        replaceUpdater: function( key, fn ) {
            this.replaced = this.replaced || {};
            this.replaced[ key ] = this.updateFns[ key ];
            this.updateFns[ key ] = fn;
        },

        undoUpdaters: function() {
            for( var key in this.replaced ) {
                this.updateFns[ key ] = this.replaced[ key ];
            }
            delete this.replaced;
        },

        resetDefaults: resetDefaults,

        lockTo: function( master, offset ) {
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
            return Utils.sphereCollision(
                mesh.position, this.mesh.position, sphere.r, this.build.radius
            );
        },
        pos: function( xyz ) {
            xyz.x && ( this.mesh.position.x = xyz.x );
            xyz.y && ( this.mesh.position.y = xyz.y );
            xyz.z && ( this.mesh.position.z = xyz.z );

            this.updateLocks();
        },
        move: function( vec ) {
            this.mesh.position.add( Utils.speed( vec ) );

            this.updateLocks();
        },
        speedLockTowards: function( entity, speed ) {
            var computed = Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, Utils.speed( speed ) ),
                me = this;

            this.lockOffset = {
                x: computed.x - me.master.mesh.position.x,
                y: computed.y - me.master.mesh.position.y
            };

        },
        setLockDistance: function( entity, distance ) {
            var computed = Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, distance ),
                me = this;

            this.lockOffset = {
                x: computed.x - me.master.mesh.position.x,
                y: computed.y - me.master.mesh.position.y
            };

        },
        moveTowards: function( entity, speed ) {
            var computed = Utils.vecMoveOffset( this.mesh.position, entity.mesh.position, speed );

            this.mesh.position.x = computed.x;
            this.mesh.position.y = computed.y;

        },
        updateLocks: function() {
            var me = this,
                locks = this.locks;

            if( locks ) {
                for( var x = 0; x < locks.length; x++ ) {
                    locks[x].pos( new THREE.Vector3().addVectors( me.mesh.position, locks[x].lockOffset ) );
                }
            }
        },
        scaleTo: function( scale ) {
            this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = scale;
        }
    }),

    Doodad: Class.extend({
        init: function() {
            this.resetDefaults();
        },

        resetDefaults: resetDefaults
    })
};

}(this));
