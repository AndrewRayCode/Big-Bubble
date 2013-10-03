(function( global ) {


var Letter = global.Letter = Mixin.Entity.extend({

    init: function( letter, options ) {

        var material = new THREE.MeshPhongMaterial({
            transparent: true,
            color: 0xdddddd
        });
        var textGeom = new THREE.TextGeometry( letter, {
            size: 40, height: 4, curveSegments: 3,
            font: 'helvetiker', weight: 'bold',
            bevelThickness: 2, bevelSize: 2, bevelEnabled: true,
            extrudeMaterial: 1
        });
        // font: helvetiker, gentilis, droid sans, droid serif, optimer
        // weight: normal, bold
        
        var textMesh = new THREE.Mesh( textGeom, material );
        
        textGeom.computeBoundingBox();

        this.material = material;
        this.geom = textGeom;
        this.mesh = textMesh;
        this.textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;

        this._super();
    }
});

var Text3d = global.Text3d = Mixin.Entity.extend({

    init: function( text ) {
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
            letter = new Letter( char );
            this.letters.push( letter );
            this.group.add( letter.mesh );
            letter.offset = Utils.randInt( 2, 12 );
            letter.amplitude = Utils.randInt( 1, 3 );
            letter.mesh.position.x = tally;
            letter.mesh.startingPosition = letter.mesh.position.clone();

            tally += letter.textWidth + kearning;
        }

        this.group.width = tally - kearning;
        this.group.position.x -= this.group.width / 2.0;
        this.group.position.y = Camera.data.frustrum.max.y - 60;

        this._super();
        Game.trigger( 'textCreated', this );
    },

    introduce: function() {
        var delay = 100,
            animateTime = 500,
            duration = 3000,
            distance = 100,
            me = this;
            
        _.each( this.letters, function( letter, index ) {
            letter.material.opacity = 0;
            letter.mesh.position.y += distance;

            setTimeout( function() {
                letter.tween({ opacity: 1 }, animateTime);
                letter.tween({
                    position: {
                        y: letter.mesh.position.y - distance
                    }
                }, 500).easing( TWEEN.Easing.Cubic.Out );
            }, index * delay);

            setTimeout( function() {
                letter.tween({ opacity: 0 }, animateTime);
                letter.tween({
                    position: {
                        y: letter.mesh.position.y - distance
                    }
                }, 500).easing( TWEEN.Easing.Cubic.Out );
            }, duration + ( index * delay ));
        });

        setTimeout( function() {
            World.scene.remove( me.group );
            Game.trigger( 'textFree', me );
        }, duration + ( ( this.letters.length + 1 ) * delay ) + animateTime );

        World.scene.add( this.group );
    },

    updateFns: {
        main: function() {
            _.each( this.letters, function( letter, index ) {
                letter.mesh.position = letter.mesh.startingPosition.clone().add(new THREE.Vector3(
                    letter.amplitude * Math.sin( new Date().getTime() / 400 + letter.offset ),
                    letter.amplitude * Math.cos( new Date().getTime() / 400 + letter.offset ),
                    0
                ));
            });
        }
    }

});

var TextManager = global.TextManager = Class.create({

    strings: [],
    id: 0,

    init: function() {
        var me = this;

        Game.bind( 'textCreated', function( text ) {
            text.id = me.id++;
            me.strings.push( text );
        });
        Game.bind( 'textFree', function( text ) {
            me.strings.splice( me.strings.indexOf( text ), 1 );
        });
    },

    update: function() {
        _.each( this.strings, function( text ) {
            text.update();
        });
    }

});

}(this));
