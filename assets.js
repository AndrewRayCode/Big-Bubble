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
        flame:'flame-1.png',
        shark: 'shark.png',
    },

    models: {
        mine: 'mine.js'
    },

    colladas: {
        whale: 'unskinned-humpback-whale.DAE'
    }
};
