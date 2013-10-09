Bub.Text3d = function( text ) {
    this.group = new THREE.Object3D();
    this.letters = [];
    this.offset = 0;

    var l = 0,
        kearning = 5,
        tally = 0,
        letter, char;

    for( l = 0; char = text.charAt( l++ ); ) {
        if( char === ' ') {
            tally += kearning * 5;
            continue;
        }
        letter = new Bub.Letter( char );
        this.letters.push( letter );
        this.group.add( letter.mesh );
        letter.offset = Bub.Utils.randInt( 2, 12 );
        letter.amplitude = Bub.Utils.randInt( 1, 3 );
        letter.mesh.position.x = tally;
        Bub.Offset.manage( letter.mesh );

        tally += letter.textWidth + kearning;
    }

    this.group.width = tally - kearning;
    this.group.position.x -= this.group.width / 2.0;
    this.group.position.y = Bub.camera.data.frustrum.max.y - 60;

    Bub.Mixin.Entity.call( this );
    Bub.game.trigger( 'textCreated', this );
};

Bub.Text3d.prototype = Object.create( Bub.Mixin.Entity.prototype );

Bub.Text3d.prototype.introduce = function() {
    var delay = 90,
        animateTime = 800,
        fadeTime = 300,
        duration = 3000,
        distance = 100,
        me = this;
        
    _.each( this.letters, function( letter, index ) {
        letter.material.opacity = 0;
        letter.mesh.position.y += distance;

        setTimeout( function() {
            letter.tween({ opacity: 1 }, fadeTime);
            letter.tween({
                position: {
                    z: letter.mesh.position.z - distance,
                    y: letter.mesh.position.y - distance
                }
            }, animateTime).easing( TWEEN.Easing.Cubic.Out );
            letter.tween({
                rotation: {
                    z: letter.mesh.rotation.z - Math.PI * 2,
                }
            }, animateTime).easing( TWEEN.Easing.Cubic.Out );
        }, index * delay);

        setTimeout( function() {
            letter.tween({ opacity: 0 }, fadeTime);
            letter.tween({
                position: {
                    z: letter.mesh.position.z - distance,
                    y: letter.mesh.position.y + distance
                }
            }, animateTime).easing( TWEEN.Easing.Cubic.Out );
            letter.tween({
                rotation: {
                    z: letter.mesh.rotation.z + Math.PI * 2,
                }
            }, animateTime).easing( TWEEN.Easing.Cubic.Out );
        }, duration + ( index * delay ));
    });

    setTimeout( function() {
        Bub.World.scene.remove( me.group );
        _.each( this.letters, function( letter ) {
            Bub.Offset.free( letter );
        });
        Bub.game.trigger( 'textFree', me );
    }, duration + ( ( this.letters.length + 1 ) * delay ) + animateTime );

    Bub.World.scene.add( this.group );
};

Bub.Text3d.prototype.updateFns = {
    main: function() {
        _.each( this.letters, function( letter, index ) {
            Bub.Offset.set( letter.mesh, new THREE.Vector3(
                letter.amplitude * Math.sin( new Date().getTime() / 400 + letter.offset ),
                letter.amplitude * Math.cos( new Date().getTime() / 400 + letter.offset ),
                0
            ));
        });
    }
};
