(function( global ) {

var Factory = global.Factory = Class.create({

    // stairs
    // post-stair fill
    // left zig
    // right zig
    // split ( / join )
    // straigthtener / bend

    maze: function( opts ) {
        var graph = {};

        var options = $.extend( {
            startHeight: -40,
            incline: 1,
            nodes: 50
        }, opts);

        var maze = {
            tops: [],
            sides: [],
            inertia: { x: 0, y: 0, z: 0 },
            group: new THREE.Object3D(),
            nodeHeight: 0
        };

        var node = function( line, type ) {

            var made = {
                line: line,
                add: function( childNode ) {

                    if( childNode.type === 'zig' ) {
                        childNode.parent = made;
                        made.child = childNode;
                        return;
                    } else if( childNode.type === 'stairs' ) {
                        childNode.parent = made;
                        made.child = childNode;
                        return;
                    }

                    var newLines = chamfer( line, childNode.line, 40, 4 ),
                        parent = made,
                        newNode;

                    for( var x = 0; x < newLines.length; x++ ) {
                        newNode = node( newLines[ x ], 'chamfer' );
                        newNode.type = 'chamfer';
                        newNode.chamfered = true;

                        newNode.parent = parent;
                        parent.child = newNode;

                        parent = newNode;
                    }

                    childNode.parent = parent;
                    parent.child = childNode;

                    made.recalculate();
                    childNode.recalculate();
                },

                recalculate: function() {
                    var diff = new THREE.Vector3().subVectors( line[1], line[0] );
                    made.angle = THREE.Math.radToDeg( Math.atan2( diff.y, diff.x ) );
                    made.midPoint = Utils.midPoint( line[0], line[1] );
                }
            };

            made.recalculate();

            return made;
        };

        var point = function( x, y ) {
            var z = options.startHeight + maze.nodeHeight;
            return y !== undefined ?
                new THREE.Vector3( x, y, z ) :
                new THREE.Vector3( x.x, x.y, z );
        };
        var line = function( point1, point2 ) {
            return [ point1, point2 ];
        };

        var chamfer = function( line1, line2, distance, subDivisions ) {
            var arr = arr || [],

                newA = Utils.vecMoveOffset( line1[1], line1[0], distance ),
                newB = Utils.vecMoveOffset( line2[0], line2[1], distance ),

                curve = new THREE.QuadraticBezierCurve( newA, line1[1], newB ),

                points = curve.getPoints( subDivisions ),
                lines = [],
                start, end, geom;

            for( var x = 0; x < points.length - 1; x++ ) {
                start = points[ x ];
                end = points[ x + 1 ];

                lines.push( line( point(start.x, start.y), point(end.x, end.y) ) );
            }

            line1[1] = newA;
            line2[0].copy( newB );

            return lines;
        };

        var limit = {
            x: Camera.data.frustrum.x / 2,
            y: Camera.data.frustrum.y / 2
        };

        var pathWidth = 100,
            pathRadius = pathWidth / 2;

        var bend = function( startNode ) {

            var start = startNode.line[1].clone();

            var end = start.clone().add( new THREE.Vector3(
                Utils.randInt(-100, 100),
                200 - Utils.randInt(-50, 50),
                0
            ) );
            end.x = Math.min( Math.max( end.x, -limit.x + pathRadius ), limit.x - pathRadius );

            return node( line( start, end ) );
        };

        var zig = function( startNode ) {

            var dist = 100 + Utils.randInt(-5, 5),
                sign = startNode.angle > 90 ? -1 : 1,
                angle = startNode.angle + ( sign * 90 );

            //Utils.dot( startNode.line[1] );

            // Hyptoenuse of icosolese right triangle is root2 * side
            var hypot = pathRadius * Math.SQRT2,
                newAngle = THREE.Math.degToRad( startNode.angle + (sign * 135) );

            var start = startNode.line[1].clone().add( new THREE.Vector3(
                Math.cos( newAngle ) * hypot,
                Math.sin( newAngle ) * hypot,
                0
            ));
            //for(var x = 0; x < 360; x+= 45 ) {
                //Utils.dot( startNode.line[1].clone().add(new THREE.Vector3(
                    //Math.cos(THREE.Math.degToRad(x + startNode.angle)) * hypot,
                    //Math.sin(THREE.Math.degToRad(x + startNode.angle)) * hypot,
                    //0
                //)));
            //}

            // SOH CAH TOA to get second point of line
            var end = start.clone().add( new THREE.Vector3(
                Math.cos( THREE.Math.degToRad( angle ) ) * dist,
                Math.sin( THREE.Math.degToRad( angle ) ) * dist,
                0
            ));

            var newNode = node( line( start, end ) );
            newNode.type = 'zig';
            return newNode;
        };

        graph.start = bend( node( line( point( 0, -Player.build.radius * 2 ), point( 0, -Player.build.radius ) ) ) );
        graph.start = bend( node( line( point( 0, -Camera.data.frustrum.y / 2 ), point( 0, (-Camera.data.frustrum.y / 2) + 20 ) ) ) );
        var currentNode = graph.start,
            newNode, rand, stairs;

        for( var x = 0; x < options.nodes; x++ ) {
            rand = Math.random();
            if( rand > 0.8 ) {
                newNode = zig( currentNode );
                currentNode.add( newNode );
                currentNode = newNode;

                if( Math.random() > 0.6 ) {
                    newNode = zig( currentNode );
                    currentNode.add( newNode );
                    currentNode = newNode;
                }
                if( Math.random() > 0.6 ) {
                    newNode = zig( currentNode );
                    currentNode.add( newNode );
                    currentNode = newNode;
                }
            } else if( rand > -0.1 ) {
                newNode = bend( currentNode );
                currentNode.add( newNode );
                currentNode = newNode;

                // removing incline for now because I have to figure out what
                // goes where
                //maze.nodeHeight += options.incline;
            } else {
                stairs = node( Factory.stairs({ width: pathWidth }), 'stairs');
                stairs.type = 'stairs';
                stairs = node( stairs );
                currentNode.add( stairs );

                //depth = options.depth || 100,
                //width = options.width || 100,
                //height = options.height || 50,
                //steps = options.steps || 10,
            }
        }

        var build = function( node ) {
            var mat;
            var trans = false;
            if( node.type === 'zig' ) {
                mat = new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    wireframe: trans,
                    transparent: trans
                });
            } else if( node.type === 'chamfer' ) {
                mat = new THREE.MeshBasicMaterial({
                    color: 0xe8dd00,
                    wireframe: trans,
                    transparent: trans
                });
            } else {
                mat = new THREE.MeshBasicMaterial({
                    color: 0x00ffff,
                    wireframe: trans,
                    transparent: trans
                });
            }

            //var geometry = new THREE.Geometry(), line;
            //geometry.vertices.push( node.line[0] );
            //geometry.vertices.push( node.line[1] );

            //line = new THREE.Line( geometry );
            //World.scene.add(line);
            //if( node.child ) {
                //build( node.child );
            //}
            //return

            //material.color.setRGB( Math.random(), Math.random(), Math.random() );

            var height = Utils.distance3d( node.line[0], node.line[1] );

            var mesh = new THREE.Mesh( new THREE.PlaneGeometry( height, pathWidth, 1, 1), mat ),
                verts = mesh.geometry.vertices;

            //World.ass = World.ass || -100;
            mesh.position = node.midPoint;
            mesh.rotation.z = THREE.Math.degToRad( node.angle );
            mesh.geometry.verticesNeedUpdate = true;
            mesh.geometry.computeCentroids();
            mesh.updateMatrixWorld();

            if( node.parent ) {
                var botLeft = node.parent.mesh.localToWorld( node.parent.mesh.geometry.vertices[1].clone() ),
                    botLeftMid = Utils.midPoint( botLeft, mesh.localToWorld( verts[0].clone() ) );
                //botLeftMid.z = World.ass;
                var botRight = node.parent.mesh.localToWorld( node.parent.mesh.geometry.vertices[3].clone() ),
                    botRightMid = Utils.midPoint( botRight, mesh.localToWorld( verts[2].clone() ) );
                //botRightMid.z = World.ass;

                if( node.type !== 'zig' ) {
                    verts[0].copy( mesh.worldToLocal( botLeftMid.clone() ) );
                    verts[2].copy( mesh.worldToLocal( botRightMid.clone() ) );
                    mesh.geometry.verticesNeedUpdate = true;
                    mesh.geometry.computeCentroids();
                    mesh.geometry.computeFaceNormals();
                    mesh.geometry.computeVertexNormals();
                    mesh.updateMatrixWorld();
                }

                if( node.parent.type !== 'zig' && node.type !== 'zig' ) {
                    node.parent.mesh.geometry.vertices[3].copy( node.parent.mesh.worldToLocal( botRightMid ) );
                    node.parent.mesh.geometry.vertices[1].copy( node.parent.mesh.worldToLocal( botLeftMid ) );
                    node.parent.mesh.geometry.verticesNeedUpdate = true;
                    node.parent.mesh.geometry.computeCentroids();
                    node.parent.mesh.geometry.computeFaceNormals();
                    node.parent.mesh.geometry.computeVertexNormals();
                    node.parent.mesh.updateMatrixWorld();
                }

                //World.ass += 5;
                // 0: bottom left,
                // 1: top left,
                // 2: bottom right,
                // 3: top right
            }
            mesh.receiveShadow = true;
            mesh.geometry.verticesNeedUpdate = true;

            node.verts = verts;
            node.mesh = mesh;

            maze.group.add( mesh );
            maze.tops.push( mesh );

            if( node.child ) {
                build( node.child );
            }
        };

        build( graph.start );
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

        var group = new THREE.Object3D();

        var material = new THREE.MeshLambertMaterial({
            color: 0x888888,
            shading: THREE.FlatShading,
            side: THREE.DoubleSide
        });
        var tmaterial = new THREE.MeshLambertMaterial({
            color: 0x11ee55,
            shading: THREE.FlatShading
        });

        for(var x = 0; x < steps; x++ ) {
            top = new THREE.Mesh( new THREE.PlaneGeometry( width, depth, 10, 1), tmaterial );
            side = new THREE.Mesh( new THREE.PlaneGeometry( width, height, 10, 1), material );

            top.receiveShadow = true;

            group.add( top );
            group.add( side );

            top.position.z -= height * x;
            top.position.y += depth * x;

            side.position.y += (depth * x) + (depth / 2);
            side.position.z -= (height * x) + (height / 2);
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
            slantBrightness: {value: 0.1, type:'f' },
            numBeams: {value: 13, type:'i' }
        };

        var bgShader = new THREE.ShaderMaterial({
            uniforms: World.pu,
            vertexShader:   $('#vshader').text(),
            fragmentShader: $('#fshader').text()
        });

        var cube = new THREE.Mesh(
            geometry,
            material
        );

        var plane = Mixin.Entity.create({
            mesh: new THREE.Mesh(
                new THREE.PlaneGeometry( Camera.data.frustrum.x * 1.5, Camera.data.frustrum.y * 1.5, 1, 1),
                bgShader
            )
        });
        plane.mesh.position.set( 0, 0, -500 );
        World.plane = plane;
        World.scene.add( plane.mesh );

        return cube;
    }
});

}(this));
