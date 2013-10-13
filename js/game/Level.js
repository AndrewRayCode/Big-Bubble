(function() {

var Level = function() {};

Level.prototype.levels = [{
    next: 13,
    zoom: 500,
    start: function() {
        var text = new Bub.Text3d('Big Bubble!');
        text.introduce();
        Bub.Transitions.run('descend');
        //setInterval(function() {
            //Bub.player.ripple( Bub.player, 10 );
        //}, 1000);
    }
}, {
    next: 30,
    zoom: 700,
    start: function() {
        var text = new Bub.Text3d('Zoom out!');
        text.introduce();
    },
    size: new THREE.Vector2( 400, 500 )
}, {
    next: 80,
    zoom: 700,
    start: function() {
        var text = new Bub.Text3d('Bubble Madness!');
        text.introduce();
        Bub.Transitions.run('maze');
    }
}, {
    next: 90,
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
