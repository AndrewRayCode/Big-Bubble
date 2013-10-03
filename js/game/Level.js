(function( global ) {

var Level = global.Level = Class.create({
    init: function() {
        this.index = -1;
    },

    levels: [{
        next: 13,
        zoom: 500,
        start: function() {
            var text = new Text3d('Big Bubble!');
            text.introduce();
            Transitions.run('descend');
        }
    }, {
        next: 30,
        zoom: 700,
        start: function() {
            var text = new Text3d('Zoom out!');
            text.introduce();
        },
        size: new THREE.Vector2( 400, 500 )
    }, {
        next: 80,
        zoom: 700,
        start: function() {
            var text = new Text3d('Bubble Madness!');
            text.introduce();
            Transitions.run('maze');
        }
    }, {
        next: 90,
        zoom: 800,
        start: function() {
            Transitions.end('forward');
        }
    }],
    reset: function() {
        this.init();
    },
    advance: function() {
        this.index++;
        this.level = this.levels[ this.index ];

        if( !this.level ) {
            this.levels[ this.index ] = $.extend({}, this.levels[ this.index - 1]);
            this.levels[ this.index ].next *= 1.5;
            this.levels[ this.index ].zoom += 100;
            this.level = this.levels[ this.index ];
        }

        if( this.level.size ) {
            World.grow( this.level.size.clone().sub( World.size ));
        }

        if( this.level.start ) {
            this.level.start();
        }
    }
});

}(this));
