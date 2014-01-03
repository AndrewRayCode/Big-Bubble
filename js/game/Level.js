(function() {

var Level = function() {};

Level.prototype.levels = [{
    next: 10,
    zoom: 100,
    start: function() {
        new Bub.Text3d({
            text: 'Big Bubble!'
        }).introduce();
        Bub.ModeManager.next('descend');

        //setTimeout(function() {
            ////Bub.trigger( 'fireup', new Bub.Fireball() );

            //Bub.Cache.birth( Bub.Floater, {
                //radius: 40
            //});
        //}, 10);

        //var geometry = new THREE.SphereGeometry( 70, 32, 32 );
        //var mesh = new THREE.Mesh( geometry, Bub.Shader.shaders.lava() );
        //Bub.World.scene.add( mesh );
        //Bub.Game.running = false;
    }
}, {
    next: 100,
    zoom: 700,
    start: function() {
        var text = new Bub.Text3d({
            text: 'Zoom out!'
        });
        text.introduce();
        Bub.ModeManager.next('forward');
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
        Bub.ModeManager.next('maze');
    }
}, {
    next: 300,
    zoom: 800,
    start: function() {
        Bub.ModeManager.end('forward');
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
