(function() {

var animator = Bub.SpriteAnimator = {

    animations: [],

    add: function TextureAnimator( options ) {

        options.texture.repeat.set( 1 / options.tilesHorizontal, 1 / options.tilesVertical );

        var animation = _.extend({
            fps: 30,
            currentTile: 0,
            duration: Infinity,
            numberOfTiles: options.tilesHorizontal * options.tilesVertical
        }, options);

        this.animations.push( animation );

    },

    free: function( animation ) {
        this.animations.splice(this.animations.indexOf( animation ), 1);
    },

    update: function( delta ) {
        var currentColumn, currentRow;
        var e = Bub.Particle.emitters[Bub.thingus].emitter;

        for( var x = 0, animation; animation = this.animations[ x++ ]; ) {

            animation.duration += delta;

            if( animation.duration > 1 / animation.fps ) {

                animation.currentTile = ( animation.currentTile + 1 ) % animation.numberOfTiles;

                for(var y = 0; y < e.attributes.currentTile.value.length; y++ ) {
                    e.attributes.currentTile.value[y] = ( animation.currentTile + y ) % animation.numberOfTiles;
                }
                e.attributes.angle.needsUpdate = true;

                currentColumn = animation.currentTile % animation.tilesHorizontal;
                currentRow = Math.floor( animation.currentTile / animation.tilesHorizontal );

                animation.texture.offset.x = currentColumn / animation.tilesHorizontal;
                animation.texture.offset.y = 1 - ( 1 / animation.tilesHorizontal ) - ( currentRow / animation.tilesVertical );

                animation.duration = 0;
            }
        }
    }
};

}());
