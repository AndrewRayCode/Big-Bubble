Bub.Mode = function( props ) {
    _.extend( this, props );
};

Bub.Mode.defaultEntities = [{
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
}];

Bub.Mode.prototype = {

    replaceFn: function( key, fn ) {
        this.replaced = this.replaced || {};
        this.replaced[ key ] = this[ key ];
        this[ key ] = fn;
    }

};
