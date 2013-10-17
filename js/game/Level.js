(function() {

var Level = function() {};

Level.prototype.levels = [{
    next: 30,
    zoom: 300,
    start: function() {
        var text = new Bub.Text3d({
            text: 'Big Bubble!'
        });
        text.introduce();
        Bub.Transitions.run('descend');
    }
}, {
    next: 100,
    zoom: 700,
    start: function() {
        var text = new Bub.Text3d({
            text: 'Zoom out!'
        });
        text.introduce();
    },
    size: new THREE.Vector2( 400, 500 )
}, {
    next: 200,
    zoom: 700,
    start: function() {
        var text = new Bub.Text3d({
            text: 'Bubble Madness!'
        });
        text.introduce();
        Bub.Transitions.run('maze');
    }
}, {
    next: 300,
    zoom: 800,
    start: function() {
        Bub.Transitions.end('forward');
    }
}],

Level.prototype.reset = function() {
    this.index = -1;
};

Level.prototype.advance = function() {
    this.index++;
    this.level = this.levels[ this.index ];

    if( !this.level ) {
        this.levels[ this.index ] = $.extend({}, this.levels[ this.index - 1]);
        this.levels[ this.index ].next *= 1.5;
        this.levels[ this.index ].zoom += 100;
        this.level = this.levels[ this.index ];
    }

    if( this.level.size ) {
        Bub.World.grow( this.level.size.clone().sub( Bub.World.size ));
    }

    if( this.level.start ) {
        this.level.start();
    }
};

Bub.Level = new Level();

}());
