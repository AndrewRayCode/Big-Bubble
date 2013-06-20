(function( global ) {

var Level = global.Level = Class.create({
    levels: [{
        next: 10,
        zoom: 500,
        start: function() {
            Transition.run('descend');
        }
    }, {
        next: 50,
        zoom: 600,
        start: function() {
            Transition.run('maze');
        }
    }, {
        next: 80,
        zoom: 700,
        start: function() {
            Transition.run('descend');
        }
    }, {
        next: 90,
        zoom: 800,
        start: function() {
            Transition.end('forward');
        }
    }],
    reset: function() {
        this.init();
        this.advance();
    },
    init: function() {
        this.index = -1;
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

        if( this.level.start ) {
            this.level.start();
        }
    }
});

}(this));
