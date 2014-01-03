Bub.ModeManager = {

    modes: {},

    powerups: [{
        type: Bub.Fireball,
        options: function() {
            return {
                radius: Bub.player.build.radius
            };
        }
    }],

    reset: function() {
        if( this.current ) {
            _.each( this.current.entities, function( entity ) {
                if( entity.timeout ) {
                    Bub.Game.clearTimeout( entity.timeout );
                }
            });
        }
    },

    next: function( id ) {
        if( this.current ) {
            this.end() ;
        }
        this.run( id );
    },

    run: function( id ) {
        var mode = this.modes[ id ],
            timeouts = [],
            me = this;

        this.current = mode;

        mode.spawner = new Bub.Spawner();
        mode.updateSpawner();

        ( mode.intro ? mode.intro() : window.Q() ).then( function() {

            mode.start();

            _.each( mode.entities, function( entity ) {

                var timeout = function() {
                    entity.timeout = Bub.Game.timeout( entity.offset + ( Math.random() * entity.frequency ), function() {

                        var actual = _.isArray( entity.type ) ? Bub.Utils.randArr( entity.type ) : entity,
                            opts = actual.options ? ( actual.options.call ?
                                actual.options() : actual.options
                            ) : {};

                        _.extend( opts, {
                            position: mode.spawner.getRandomPoint()
                        });

                        Bub.Cache.birth( actual.type, opts );

                        timeout();

                    });
                };

                timeout();

            });
        });
    },

    end: function() {
        this.reset();
        this.current.end();
        delete this.current;
    },

    update: function() {
        if( this.current ) {
            this.current.loop();
        }
    }
};
