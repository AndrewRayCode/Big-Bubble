Bub.ModeManager.modes.descend = new Bub.Mode({
    entities: [{
        type: Bub.Mine,
        options: function() {
            return {
                radius: Bub.player.build.radius
            };
        },
        frequency: 3000,
        offset: 1000
    }, {
        type: Bub.Floater,
        options: function() {
            return {
                radius: Bub.Utils.randInt(
                    Bub.player.build.radius / 10, Bub.player.build.radius / 2
                )
            };
        },
        frequency: 100,
        offset: 100
    }, {
        type: Bub.ModeManager.powerups,
        frequency: 10000,
        offset: 3000
    }],

    start: function() {},
    end: function() {
        Bub.Cache.each(function( thing ) {
            if( thing.inertia.y !== 0 ) {
                thing.inertia.y += 0.03;
                thing.inertia.z += 1;
            }
            if( thing.inertia.y > -0.03 ) {
                thing.inertia.y = 0;
            }
        });
    },
    loop: function() {}
});
