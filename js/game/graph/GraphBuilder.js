(function( global ) {

var GraphBuilder = global.GraphBuilder = Class.extend({

    init: function( options ) {
        this.options = options || {};
    },

    build: function( graph ) {
        this.maze = {
            tops: [],
            sides: [],
            inertia: { x: 0, y: 0, z: 0 },
            group: new THREE.Object3D(),
            nodeHeight: 0
        };

        this.buildMaze( graph.start );
        return this.maze;
    },

    buildMaze: function( node ) {
        var mat,
            debug = 0;

        if( node instanceof Zig ) {
            mat = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                wireframe: debug,
                transparent: debug
            });
        } else if( node instanceof Chamfer ) {
            mat = new THREE.MeshBasicMaterial({
                color: 0xe8dd00,
                wireframe: debug,
                transparent: debug
            });
        } else {
            mat = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                wireframe: debug,
                transparent: debug
            });
        }
        mat = new THREE.MeshLambertMaterial({
            shading: THREE.FlatShading,
            map: Utils.textures.rust
        });

        if( debug ) {
            var geometry = new THREE.Geometry(), line;
            geometry.vertices.push( node.line[0] );
            geometry.vertices.push( node.line[1] );
            line = new THREE.Line( geometry );
            this.maze.group.add(line);
        }

        if( node instanceof Stairs ) {

            var stairs = Factory.stairs({
                material: mat,
                steps: node.steps,
                length: node.length,
                rise: node.rise,
                width: this.options.pathWidth
            });
            stairs.group.position = node.line[0];
            stairs.group.rotation.z = THREE.Math.degToRad( node.angle - 90 );
            this.maze.group.add( stairs.group );
            this.maze.tops = this.maze.tops.concat( stairs.tops );
            this.maze.sides = this.maze.sides.concat( stairs.sides );

        } else {

            var height = Utils.distance3d( node.line[0], node.line[1] ),
                mesh = new THREE.Mesh( new THREE.PlaneGeometry( height, this.options.pathWidth, 1, 1), mat ),
                verts = mesh.geometry.vertices;

            //World.ass = World.ass || -100;
            mesh.position = node.midPoint;
            mesh.rotation.z = THREE.Math.degToRad( node.angle );
            mesh.geometry.verticesNeedUpdate = true;
            mesh.geometry.computeCentroids();
            mesh.updateMatrixWorld();

            if( node.parent && !( node.parent instanceof Stairs ) ) {
                var botLeft = node.parent.mesh.localToWorld( node.parent.mesh.geometry.vertices[1].clone() ),
                    botLeftMid = Utils.midPoint( botLeft, mesh.localToWorld( verts[0].clone() ) );
                //botLeftMid.z = World.ass;
                var botRight = node.parent.mesh.localToWorld( node.parent.mesh.geometry.vertices[3].clone() ),
                    botRightMid = Utils.midPoint( botRight, mesh.localToWorld( verts[2].clone() ) );
                //botRightMid.z = World.ass;

                if( !(node instanceof Zig) ) {
                    verts[0].copy( mesh.worldToLocal( botLeftMid.clone() ) );
                    verts[2].copy( mesh.worldToLocal( botRightMid.clone() ) );
                    mesh.geometry.verticesNeedUpdate = true;
                    mesh.geometry.computeCentroids();
                    mesh.geometry.computeFaceNormals();
                    mesh.geometry.computeVertexNormals();
                    mesh.updateMatrixWorld();
                }

                if( !(node instanceof Zig) ) {
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

            //if( debug ) {
                //Utils.dot( node.line[0] );
                //Utils.dot( node.line[1] );
            //}
            mesh.receiveShadow = true;
            mesh.geometry.verticesNeedUpdate = true;

            node.verts = verts;
            node.mesh = mesh;

            this.maze.group.add( mesh );
            this.maze.tops.push( mesh );
        }

        if( node.child ) {
            this.buildMaze( node.child );
        }
    }
});

}(this));
