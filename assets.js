Bub.assets = {

    basePath: './media',

    textures: {
        rust: 'rust-peel.jpg',
        metal: 'metal.jpg',
        caustic: {
            asset: 'caustic.jpg',
            attributes: function( texture ) {
                texture.repeat.set( 0.006, 0.006 );
                texture.mapping = THREE.SphericalRefractionMapping();
            }
        },
        uvtest: 'uvtest.jpg',
        whaleSkin: 'whale-texture.jpg',
        veiny: 'veiny.jpg',
        lava: 'lavatile.jpg',
        cloud: 'cloud.png',
        explosionParticle: {
            asset: 'explosion-particle.png',
            attributes: function( texture ) {
                texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
            }
        },
        colorVolumeParticle: {
            asset: 'volume-particle-colorized.png',
            attributes: function( texture ) {
                texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
            }
        },
        volumeParticle1: {
            asset: 'volume-particle-1.png',
            attributes: function( texture ) {
                texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
            }
        },
        volumeParticle2: {
            asset: 'volume-particle-2.png',
            attributes: function( texture ) {
                texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
            }
        },
        volumeParticle3: {
            asset: 'volume-particle-3.png',
            attributes: function( texture ) {
                texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
            }
        },
        volumeParticle4: {
            asset: 'volume-particle-4.png',
            attributes: function( texture ) {
                texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
            }
        },
        flame: {
            asset: 'flame-1.png',
            attributes: function( texture ) {
                texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
            }
        },
        flame2: 'flame-2.png',
        shark: 'shark.png',
    },

    models: {
        mine: 'mine.js'
    },

    colladas: {
        whale: 'unskinned-humpback-whale.DAE'
    }
};
