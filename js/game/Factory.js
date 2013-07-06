(function( global ) {

var Factory = global.Factory = Class.create({

    maze: function( opts ) {

        var options = $.extend( {
            startHeight: -40,
            incline: 1,
            nodes: 50,
            pathWidth: 140
        }, opts);

        options.pathRadius = options.pathWidth / 2;

        var graph = new Graph( options ),
            playerPos = Player.mesh.position;

        graph.start = new Bend(
            playerPos.clone().add(new THREE.Vector3(0, -200, 0)),
            playerPos.clone().add(new THREE.Vector3(0, 100, 0))
        );

        var currentNode = graph.start,
            rand;

        currentNode = graph.addZig( currentNode, 200 );

        for( var x = 0; x < options.nodes; x++ ) {
            rand = Math.random();
            if( rand > 0.5 ) {
                currentNode = graph.addZig( currentNode, ( options.pathWidth * 2 ) + Utils.randInt( -5, 100 ) );
            } else if( rand > 0.1 ) {
                currentNode = graph.addBend( currentNode, new THREE.Vector3(
                    Utils.randInt( -90, 90 ),
                    Utils.randInt( options.pathWidth, options.pathWidth * 3 ),
                    0
                ));

                // removing incline for now because I have to figure out what
                // goes where
                //maze.nodeHeight += options.incline;
            } else {
                currentNode = graph.addStairs( currentNode, false, {
                    steps: Utils.randInt( 4, 10 ),
                    length: Utils.randInt( 100, 500 ),
                    rise: Utils.randInt( -100, -200 )
                });
                currentNode = graph.addBend( currentNode, new THREE.Vector3(
                    Utils.randInt(-100, 100),
                    200 - Utils.randInt(-50, 50),
                    0
                ));

                //depth = options.depth || 100,
                //width = options.width || 100,
                //height = options.height || 50,
                //steps = options.steps || 10,
            }
        }

        var maze = new GraphBuilder( options ).build( graph );
        World.maze = maze;

        World.scene.add( maze.group );

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

        World.scene.add( group );
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

        //var cube = new THREE.Mesh( geometry, material );
        //cube.dynamic = true;

        World.pu = {
            time: {value: 0, type:'f' },
            resolution: { value: new THREE.Vector2( World.stage.width , World.stage.height ), type:'v2' },
            mouse: { value: new THREE.Vector2( 10, 10 ), type:'v2' },
            beamSpeed: {value: 0.26, type:'f' },
            beamColor: {value: new THREE.Vector3( 0.1, 0.2, 0.8 ), type:'v3' },
            bgColor: {value: new THREE.Vector3( World.bgColor.r, World.bgColor.g, World.bgColor.b ), type:'v3' },
            dModifier: {value: 0, type:'f' },
            brightness: {value: 0.8, type:'f' },
            slantBrightness: {value: 0.8, type:'f' },
            fractalBrightness: {value: 1.3, type:'f' },
            fractalSpeed: {value: 0.3, type:'f' },
            numBeams: {value: 13, type:'i' }
        };

        var bgShader = new THREE.ShaderMaterial({
            uniforms: World.pu,
            vertexShader:   $('#vshader').text(),
            fragmentShader: $('#fshader').text(),
            side: THREE.BackSide
        });

        var cube = new THREE.Mesh(
            geometry,
            material
        );

        var mizer = Camera.data.frustrum.width * 0.01;
        var plane = Mixin.Entity.create({
            mesh: new THREE.Mesh(
                //new THREE.PlaneGeometry( Camera.data.frustrum.width * 1.5, Camera.data.frustrum.height * 1.5, 1, 1),
                new THREE.CubeGeometry( mizer, mizer, mizer, 1, 1, 1 ),
                bgShader
            )
        });
        plane.mesh.position.set( 0, 0, -500 );
        World.plane = plane;
        World.scene.add( plane.mesh );

        return cube;
    },

    loadAssets: function() {
        var rust = Utils.textures.rust = THREE.ImageUtils.loadTexture( 'media/rust-peel.jpg' );
        rust.wrapS = THREE.RepeatWrapping;
        rust.wrapT = THREE.RepeatWrapping;

        var metal = Utils.textures.metal = THREE.ImageUtils.loadTexture( 'media/metal.jpg' );
        metal.wrapS = THREE.RepeatWrapping;
        metal.wrapT = THREE.RepeatWrapping;

        var uvtest = Utils.textures.uvtest = THREE.ImageUtils.loadTexture( 'media/uvtest.jpg' );
        uvtest.wrapS = THREE.RepeatWrapping;
        uvtest.wrapT = THREE.RepeatWrapping;

        Utils.textures.shark = THREE.ImageUtils.loadTexture( 'media/shark.png' );
    }
});

}(this));
