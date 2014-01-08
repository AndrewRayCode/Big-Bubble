(function() {

Bub.Assets = {

    textures: {},
    colladas: {},
    models: {},

    loadImage: Bub.Utils.promisfy( new THREE.ImageLoader(), 'load' ),
    loadModel: Bub.Utils.promisfy( new THREE.JSONLoader(), 'load', [ 'geometry', 'materials' ] ),

    loaders: {
        models: function( modelGroup ) {
            return Bub.Assets.loadModel( modelGroup.asset ).then( function( data ) {
                var geometry = data.geometry;
                geometry.computeBoundingBox();

                geometry.dimensions = new THREE.Vector3(
                    geometry.boundingBox.max.x - geometry.boundingBox.min.x,
                    geometry.boundingBox.max.y - geometry.boundingBox.min.y,
                    geometry.boundingBox.max.z - geometry.boundingBox.min.z
                );

                return geometry;
            });
        },
        textures: function( textureGroup ) {
            return Bub.Assets.loadImage( textureGroup.asset ).then( function( image ) {
                var texture = new THREE.Texture( image );
                texture.needsUpdate = true;
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                return texture;
            });
        },
        colladas: function( colladaGroup ) {
            return Bub.Assets.loadCollada( colladaGroup.asset ).then( function( scene ) {
                return scene;
            });
        }
    },

    loadAllAssets: function() {
        return this.load(
            _.reduce(
                // Get a copy of the assets object only including keys we have
                // loaders for
                _.pick( Bub.assets, _.keys( Bub.Assets.loaders ) ),

                // Then copy the keys out of each loader
                function( obj, item, key ) {
                    obj[ key ] = _.keys( item ); return obj;
                },
            {} )
        );
    },

    load: function( groups ) {
        var promises = [],
            i, assetGroup, groupType, group;

        _.each( groups, function( assets, assetType ) {
            _.each( assets, function( assetName ) {

                var assetGroupOrName = Bub.assets[ assetType ][ assetName ];

                var normalized = _.isObject( assetGroupOrName ) ? assetGroupOrName : {
                    asset: assetGroupOrName,
                    attributes: function() {}
                };

                normalized.asset = [ Bub.assets.basePath, normalized.asset ].join( '/' );

                promises.push(Bub.Assets.loaders[ assetType ]( normalized ).then(function( loaded ) {
                    normalized.attributes( Bub.Assets[ assetType ][ assetName ] = loaded );
                }));
            });
        });

        return Q.all( promises );
    }

};

(function() {
    var colladaLoader = new THREE.ColladaLoader();
    colladaLoader.options.convertUpAxis = true;
    Bub.Assets.loadCollada = Bub.Utils.promisfy( colladaLoader, 'load' );
}());

}());
