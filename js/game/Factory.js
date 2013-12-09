// todo: this class is short sighted and too broad
Bub.Factory = {

    maze: function( opts ) {

        var options = $.extend( {
            startHeight: -40,
            incline: 1,
            nodes: 50,
            pathWidth: 140
        }, opts);

        options.pathRadius = options.pathWidth / 2;

        var graph = new Bub.Graph( options ),
            playerPos = Bub.player.mesh.position;

        graph.start = new Bub.Graph.Bend(
            playerPos.clone().add(new THREE.Vector3(0, -200, 0)),
            playerPos.clone().add(new THREE.Vector3(0, 100, 0))
        );

        var currentNode = graph.start,
            rand;

        currentNode = graph.addZig( currentNode, 200 );

        for( var x = 0; x < options.nodes; x++ ) {
            rand = Math.random();
            if( rand > 0.5 ) {
                currentNode = graph.addZig( currentNode, ( options.pathWidth * 2 ) + Bub.Utils.randInt( -5, 100 ) );
            } else if( rand > 0.1 ) {
                currentNode = graph.addBend( currentNode, new THREE.Vector3(
                    Bub.Utils.randInt( -90, 90 ),
                    Bub.Utils.randInt( options.pathWidth, options.pathWidth * 3 ),
                    0
                ));

                // removing incline for now because I have to figure out what
                // goes where
                //maze.nodeHeight += options.incline;
            } else {
                currentNode = graph.addStairs( currentNode, false, {
                    steps: Bub.Utils.randInt( 4, 10 ),
                    length: Bub.Utils.randInt( 100, 500 ),
                    rise: Bub.Utils.randInt( -100, -200 )
                });
                currentNode = graph.addBend( currentNode, new THREE.Vector3(
                    Bub.Utils.randInt(-100, 100),
                    200 - Bub.Utils.randInt(-50, 50),
                    0
                ));

                //depth = options.depth || 100,
                //width = options.width || 100,
                //height = options.height || 50,
                //steps = options.steps || 10,
            }
        }

        var maze = new Bub.GraphBuilder( options ).build( graph );
        Bub.World.maze = maze;

        Bub.World.scene.add( maze.group );

        return maze;
    },

    stairs: function( options ) {
        options = options || {};

        var stairs = {
                meshes: [],
                tops: [],
                sides: []
            },
            depth = options.depth || 100,
            width = options.width || 100,
            height = options.height || 50,
            steps = options.steps || 10,
            top, side;

        if( options.length ) {
            depth = options.length / steps;
        }
        if( options.rise ) {
            height = options.rise / steps;
        }

        var group = new THREE.Object3D();

        for( var x = 0; x < steps; x++ ) {
            top = new THREE.Mesh( new THREE.PlaneGeometry( width, depth, 1, 1), options.topMaterial || options.material );
            side = new THREE.Mesh( new THREE.PlaneGeometry( width, height, 1, 1), options.material );

            top.receiveShadow = true;

            group.add( top );
            group.add( side );

            top.position.z += height * x;
            top.position.y += depth * x;

            side.position.y += (depth * x) + (depth / 2);
            side.position.z += (height * x) + (height / 2);
            side.rotation.x += 90 * ( Math.PI / 180 );

            stairs.meshes.push( top, side );
            stairs.tops.push( top );
            stairs.sides.push( side );
        }

        Bub.World.scene.add( group );
        stairs.group = group;
        group.position.z -= height;

        return stairs;
    },

    // From vertex colors http://stemkoski.github.io/Three.js/Vertex-Colors.html
    makeGradientCube: function( size, hex ) {

        var rgbPoint, face, numberOfSides, vertexIndex, color;

        size = size / 2;
        var material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors,
            side: THREE.BackSide
        });

        var geometry = new THREE.CubeGeometry( size, size, size, 1, 1, 1 ),
            faceIndices = [ 'a', 'b', 'c', 'd' ];

        for ( var i = 0; i < geometry.faces.length; i++ ) {
            face = geometry.faces[ i ];

            // determine if current face is a tri or a quad
            numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;

            // assign color to each vertex of current face
            for( var j = 0; j < numberOfSides; j++ ) {
                vertexIndex = face[ faceIndices[ j ] ];
                // store coordinates of vertex
                rgbPoint = geometry.vertices[ vertexIndex ];

                color = new THREE.Color( hex );

                //0.5 + rgbPoint.y / cubeSide, 0.5 + rgbPoint.z / cubeSide );
                color.r -= 0.3 * ( 0.5 - rgbPoint.x / size );
                color.g -= 0.3 * ( 0.5 - rgbPoint.y / size );
                color.b -= 0.3 * ( 0.5 - rgbPoint.z / size );
                face.vertexColors[ j ] = color;
            }
        }

        var cube = new THREE.Mesh(
            geometry,
            material
        );

        var mizer = Bub.camera.data.frustrum.width * 0.01;
        var plane = new Bub.GenericEntity();
        plane.mesh = new THREE.Mesh(
            //new THREE.PlaneGeometry( Bub.camera.data.frustrum.width * 1.5, Bub.camera.data.frustrum.height * 1.5, 1, 1),
            new THREE.CubeGeometry( mizer, mizer, mizer, 1, 1, 1 ),
            Bub.Shader.shaders.oceanbg()
        );
        plane.mesh.position.set( 0, 0, -500 );
        Bub.World.plane = plane;
        Bub.World.scene.add( plane.mesh );

        return cube;
    },

    loadAssets: function() {
        var rust = Bub.Utils.textures.rust = THREE.ImageUtils.loadTexture( 'media/rust-peel.jpg' );
        rust.wrapS = THREE.RepeatWrapping;
        rust.wrapT = THREE.RepeatWrapping;

        var metal = Bub.Utils.textures.metal = THREE.ImageUtils.loadTexture( 'media/metal.jpg' );
        metal.wrapS = THREE.RepeatWrapping;
        metal.wrapT = THREE.RepeatWrapping;

        var caustic = Bub.Utils.textures.caustic = THREE.ImageUtils.loadTexture( 'media/caustic.jpg' );
        caustic.wrapS = THREE.RepeatWrapping;
        caustic.wrapT = THREE.RepeatWrapping;
        caustic.repeat.set( 0.006, 0.006 );
        caustic.mapping = THREE.SphericalRefractionMapping();

        var uvtest = Bub.Utils.textures.uvtest = THREE.ImageUtils.loadTexture( 'media/uvtest.jpg' );
        uvtest.wrapS = THREE.RepeatWrapping;
        uvtest.wrapT = THREE.RepeatWrapping;

        var veins = Bub.Utils.textures.veiny = THREE.ImageUtils.loadTexture( 'media/veiny.jpg' );
        veins.wrapS = THREE.RepeatWrapping;
        veins.wrapT = THREE.RepeatWrapping;

        var lava = Bub.Utils.textures.lava = THREE.ImageUtils.loadTexture( 'media/lavatile.jpg' );
        lava.wrapS = THREE.RepeatWrapping;
        lava.wrapT = THREE.RepeatWrapping;

        var cloud = Bub.Utils.textures.cloud = THREE.ImageUtils.loadTexture( 'media/cloud.png' );
        cloud.wrapS = THREE.RepeatWrapping;
        cloud.wrapT = THREE.RepeatWrapping;

        var flame = Bub.Utils.textures.flame = THREE.ImageUtils.loadTexture('media/flame-1.png');

        Bub.Utils.textures.shark = THREE.ImageUtils.loadTexture( 'media/shark.png' );
    }

};
