(function() {

var Level = function() {};

Level.prototype.levels = [{
    next: 10,
    zoom: 100,
    start: function() {
        new Bub.Text3d({
            text: 'Big Bubble!'
        }).introduce();

        var cluster = function( position, size ) {

            var particleId = Bub.Particle.register( {}, {
                texture: Bub.Assets.textures.flame,
                blending: THREE.NormalBlending,
                maxAge: 0.9
            }, {
                position: position,
                type: 'sphere',
                radius: 10,
                speed: 8,
                sizeSpread: 10,
                particlesPerSecond: 50,
                particleRotation: 0,
                particleRotationSpread: Math.PI,
                size: size / 1.5,
                sizeEnd: size / 1.1,
                opacityStart: 0.2,
                opacityMiddle: 0.5,
                opacityEnd: 0,
                emitterDuration: 0.08
            });

            var particleId3 = Bub.Particle.register( {}, {
                texture: Bub.Assets.textures.explosionParticle,
                blending: THREE.NormalBlending,
                maxAge: 0.7
            }, {
                type: 'sphere',
                radius: 10,
                colorize: true,
                colorStart: new THREE.Color( 0xfefeda ),
                //colorEnd: new THREE.Color( 0xf87115 ),
                colorEnd: new THREE.Color( 0xf84515 ),
                //colorStart: new THREE.Color( 0xffffff ),
                //colorEnd: new THREE.Color( 0xffffff ),
                position: position,
                speed: 15,
                sizeSpread: 10,
                particleRotation: 0,
                particleRotationSpread: Math.PI,
                particlesPerSecond: 4000,
                size: size / 2,
                sizeEnd: size,
                opacityStart: 0,
                opacityMiddle: 0.2,
                opacityEnd: 0,
                emitterDuration: 0.01
            });

            var particleId2;
            setTimeout(function() {
                particleId2 = Bub.Particle.register( {}, {
                    texture: Bub.Assets.textures.volumeParticle1,
                    blending: THREE.AdditiveBlending,
                    maxAge: 0.8
                }, {
                    position: position,
                    type: 'sphere',
                    colorize: true,
                    colorStart: new THREE.Color( 0xfefeda ),
                    colorEnd: new THREE.Color( 0xf87115 ),
                    //colorStart: new THREE.Color( 0xffffff ),
                    //colorEnd: new THREE.Color( 0xffffff ),
                    radius: 20,
                    speed: 20,
                    sizeSpread: 10,
                    particleRotation: 0,
                    particleRotationSpread: Math.PI,
                    particlesPerSecond: 500,
                    size: size / 2,
                    sizeEnd: size / 2,
                    opacityStart: 0,
                    opacityMiddle: 0.7,
                    opacityEnd: 0,
                    emitterDuration: 0.04
                });
            }, 50);

            Bub.Game.timeout( 1000, function() {
                Bub.Particle.destroy( particleId );
                Bub.Particle.destroy( particleId2 );
                Bub.Particle.destroy( particleId3 );
            });
        };

        setInterval( function() {
            var range = 20,
                size = Bub.World.size.x / 1.5,
                sizeRange = 100;

            cluster(
                new THREE.Vector3( Bub.Utils.randInt( -range, range ), Bub.Utils.randInt( -range, range ), -10 ),
                Bub.Utils.randFloat( size, size + sizeRange )
            );
            setTimeout( function() {
                cluster(
                    new THREE.Vector3( Bub.Utils.randInt( -range, range ), Bub.Utils.randInt( -range, range ), 0 ),
                    Bub.Utils.randFloat( size, size + sizeRange )
                );
            }, Bub.Utils.randFloat( 50, 100 ) );
            setTimeout( function() {
                cluster(
                    new THREE.Vector3( Bub.Utils.randInt( -range, range ), Bub.Utils.randInt( -range, range ), 0 ),
                    Bub.Utils.randFloat( size, size + sizeRange )
                );
            }, Bub.Utils.randFloat( 90, 140 ) );
        }, 1000 );

        //Bub.ModeManager.next('descend');

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
