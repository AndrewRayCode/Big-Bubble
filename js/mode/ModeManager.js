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

    run: function( id ) {
        var mode = this.modes[ id ],
            timeouts = [],
            me = this;

        this.current = mode;

        _.each( mode.entities, function( entity ) {

            var timeout = function() {
                entity.timeout = Bub.Game.timeout( entity.offset + ( Math.random() * entity.frequency ), function() {

                    var actual = _.isArray( entity.type ) ? Bub.Utils.randArr( entity.type ) : entity;

                    var opts = actual.options ? ( actual.options.call ?
                        actual.options() : actual.options
                    ) : {};
                    Bub.Cache.birth( actual.type, opts );

                    timeout();

                });
            };

            timeout();

        });

        this.active = function() {
            mode.loop();
        };
        mode.start();
    },

    end: function( id ) {
        var mode = this.modes[ id ];

        _.each( mode.entities, function( entity ) {
            if( entity.timeout ) {
                Bub.Game.clearTimeout( entity.timeout );
            }
        });

        delete this.active;
        mode.end();
    },

    update: function() {
        if( this.active ) {
            this.active();
        }
    }
};
