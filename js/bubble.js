(function() {

var cameraData = {
    zoom: 1200,
    fov: 60,
    frustrum: {}
};

var stage = {
    width: 400, // window.innerWidth
    height: 600 // window.innerHeight
};
stage.aspect = stage.width / stage.height;

var zoomTimer = 0;

var levels = [{
    next: 100
}, {
    next: 120
}, {
    next: 140
}],
levelIndex = 0,
level = levels[ levelIndex ];

var inertia = { x: 0, y: 0 },
    moving,
    keysDown = {},
    bubble = {
        radius: 90,
        origRadius: 90,
        scale: 1,
        segments: 32
    },
    movePhys = {
        acceleration: 0.6,
        deceleration: 0.8,
        max: 17
    };

if ( !window.Detector.webgl ) {
    window.Detector.addGetWebGLMessage();
}
    
var $container = $('#game')
    .css({ width: stage.width + 'px', height: stage.height + 'px' });

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( stage.width, stage.height );
$container.append( renderer.domElement );

var zoom = function( level ) {
    cameraData.zoom = camera.position.z = level;
    var frustumHeight = 2.0 * cameraData.zoom * Math.tan(cameraData.fov * 0.5 * ( Math.PI / 180 ) );
    cameraData.frustrum = {
        x: frustumHeight * stage.aspect,
        y: frustumHeight
    };

    if( bgCube ) {
        bgCube.scale.x = bgCube.scale.y = bgCube.scale.z = ( cameraData.frustrum.y * 2 ) / cubeSide;
    }
};

// PerspectiveCamera( fov, aspect, near, far )
var camera = new THREE.PerspectiveCamera( cameraData.fov, stage.width / stage.height, 1, 100000 );
zoom( cameraData.zoom );

var scene = new THREE.Scene();
var playerGeometry = new THREE.SphereGeometry( bubble.radius, bubble.segments, bubble.segments );

var cubeSide = cameraData.frustrum.y * 2;

// RGB color cube
var rgbPoint, face, numberOfSides, vertexIndex, sideColor;
var bgMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    shading: THREE.FlatShading,
    vertexColors: THREE.VertexColors,
    side: THREE.BackSide
});
var bgGeometry = new THREE.CubeGeometry( cubeSide, cubeSide, cubeSide, 1, 1, 1 );
var faceIndices = [ 'a', 'b', 'c', 'd' ];
for ( var i = 0; i < bgGeometry.faces.length; i++ ) {
    face = bgGeometry.faces[ i ];
    // determine if current face is a tri or a quad
    numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
    // assign color to each vertex of current face
    for( var j = 0; j < numberOfSides; j++ ) {
        vertexIndex = face[ faceIndices[ j ] ];
        // store coordinates of vertex
        rgbPoint = bgGeometry.vertices[ vertexIndex ];
        // initialize color variable
        sideColor = new THREE.Color( 0x2185C5 );
        //sideColor = new THREE.Color( 0x7ECEFD );
        sideColor.r -= 0.3 * ( 0.5 - rgbPoint.x / cubeSide );
        sideColor.g -= 0.3 * ( 0.5 - rgbPoint.y / cubeSide );
        sideColor.b -= 0.3 * ( 0.5 - rgbPoint.z / cubeSide );
        //0.5 + rgbPoint.y / cubeSide, 0.5 + rgbPoint.z / cubeSide );
        //color2: { type: 'c', value: new THREE.Color( 0x7ECEFD ) },
        face.vertexColors[ j ] = sideColor;
    }
}
var bgCube = new THREE.Mesh( bgGeometry, bgMaterial );
bgCube.dynamic = true;
bgCube.position.set( 100, 50, 0 );
scene.add(bgCube);

var pointLight1 = new THREE.PointLight(0x888888);
var pointLight2 = new THREE.PointLight(0x8888FF);
var pointLight3 = new THREE.PointLight(0xAA00AA);

// set its position
pointLight1.position.z = 1030;
pointLight2.position.z = 1030;
pointLight3.position.z = 1030;

// add to the scene
scene.add(pointLight1);
scene.add(pointLight2);
scene.add(pointLight3);

var floaterMaterial = new THREE.MeshPhongMaterial({
    color: new THREE.Color( 0x2185C5 ),
    transparent: true,
    opacity: 0.5
});
var floaterGeometry = new THREE.SphereGeometry( 1, 32, 32 );

var BubbleManager = function() {
    var bubbles = {},
        id = -1,
        freeBubbles = [];

    this.makeBubble = function( options ) {
        options = options || {};

        var bubble,
            radius = options.radius || 10 + 5 * Math.random();

        if( freeBubbles.length ) {
            bubble = freeBubbles.pop();
        } else {
            bubble = new THREE.Mesh( floaterGeometry, floaterMaterial );
        }
        id++;

        bubble.id = id;

        bubble.position.x = options.x || -(cameraData.frustrum.x / 2) + (( Math.random() * cameraData.frustrum.x));
        bubble.position.y = options.y || cameraData.frustrum.y + ( radius * 2 );
        bubble.position.z = 0;

        bubble.scale.x = bubble.scale.y = bubble.scale.z = 1 + radius;
        bubble.r = radius;

        bubbles[ id ] = bubble;

        scene.add( bubble );
    };

    this.freeBubble = function( bubble ) {
        var free = bubbles[ bubble.id ];
        freeBubbles.push( free );
        scene.remove( free );

        delete bubbles[ bubble.id ];
    };

    this.bubbles = bubbles;

    return this;
};
var bubbleManager = new BubbleManager();

var animate = function() {
    window.requestAnimationFrame( animate );
    render();
};

var sign = function(num) {
    return num ? num < 0 ? -1 : 1 : 0;
};

// PerspectiveCamera( fov, aspect, near, far )
var mirrorCubeCamera = new THREE.CubeCamera( 0.1, 10000, 128 );
mirrorCubeCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
//var mirrorCubeCamera = new THREE.CubeCamera( 0.1, 5000, 512 );
scene.add( mirrorCubeCamera );
var mirrorCubeMaterial = new THREE.MeshBasicMaterial({
    envMap: mirrorCubeCamera.renderTarget
});





var fshader = THREE.FresnelShader;
var uniforms = THREE.UniformsUtils.clone( fshader.uniforms );

var renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBFormat
});
//var rtUniforms u { tDiffuse: { type: "t", value: rtTexture } };

uniforms.tCube.value = mirrorCubeCamera.renderTarget;

var parameters = {
    fragmentShader: fshader.fragmentShader,
    vertexShader: fshader.vertexShader,
    uniforms: uniforms
};
var fresnelMaterial = new THREE.ShaderMaterial( parameters );

scene.matrixAutoUpdate = false;


//var playerMesh = new THREE.Mesh( playerGeometry, mirrorCubeMaterial );
var playerMesh = new THREE.Mesh( playerGeometry, fresnelMaterial );

playerMesh.position.x = 0;
playerMesh.position.y = 0;
playerMesh.position.z = 0;
playerMesh.scale.x = playerMesh.scale.y = playerMesh.scale.z = 1;

scene.add( playerMesh );



var render = function() {

    var timer = 0.0001 * Date.now();

    //uniforms.amplitude.value = Math.sin(timer * 10);

    if( keysDown.right ) {
        inertia.x += movePhys.acceleration;

        if( inertia.x > movePhys.max ) {
            inertia.x = movePhys.max;
        }
    } else if( keysDown.left ) {
        inertia.x -= movePhys.acceleration;

        if( inertia.x < -movePhys.max ) {
            inertia.x = -movePhys.max;
        }
    } else if ( inertia.x ) {
        inertia.x -= sign( inertia.x ) * movePhys.deceleration;

        if( Math.abs( inertia.x ) <= movePhys.deceleration ) {
            inertia.x = 0;
        }
    }

    if( keysDown.up ) {
        inertia.y += movePhys.acceleration;

        if( inertia.y > movePhys.max ) {
            inertia.y = movePhys.max;
        }
    } else if( keysDown.down ) {
        inertia.y -= movePhys.acceleration;

        if( inertia.y < -movePhys.max ) {
            inertia.y = -movePhys.max;
        }
    } else if ( inertia.y ) {
        inertia.y -= sign( inertia.y ) * movePhys.deceleration;

        if( Math.abs( inertia.y ) <= movePhys.deceleration ) {
            inertia.y = 0;
        }
    }

    playerMesh.position.x += inertia.x;
    playerMesh.position.y += inertia.y;

    var xLimit = cameraData.frustrum.x / 2,
        yLimit = cameraData.frustrum.y / 2;

    if( playerMesh.position.y > yLimit - bubble.radius ) {
        playerMesh.position.y = yLimit - bubble.radius;
        inertia.y = 0;
    }
    if( playerMesh.position.y < -yLimit + bubble.radius ) {
        playerMesh.position.y = -yLimit + bubble.radius;
        inertia.y = 0;
    }
    if( playerMesh.position.x > xLimit - bubble.radius ) {
        playerMesh.position.x = xLimit - bubble.radius;
        inertia.x = 0;
    }
    if( playerMesh.position.x < -xLimit + bubble.radius ) {
        playerMesh.position.x = -xLimit + bubble.radius;
        inertia.x = 0;
    }

    pointLight1.position.x = playerMesh.position.x + 1000;
    pointLight1.position.y = playerMesh.position.y;

    pointLight2.position.x = playerMesh.position.x - 1000;
    pointLight2.position.y = playerMesh.position.y;

    pointLight3.position.x = playerMesh.position.x + 1000;
    pointLight3.position.y = playerMesh.position.y + 1000;

    //camera.lookAt( mesh.position );

    var floater;
    for( var id in bubbleManager.bubbles ) {
        floater = bubbleManager.bubbles[ id ];
        floater.position.y -= 5;

        if ( floater.position.y + floater.r * 2 < -cameraData.frustrum.y ) {
            // TODO: fix this
            bubbleManager.freeBubble( floater );

        } else if( collision( floater.position, playerMesh.position, floater.r, bubble.radius ) ) {
            bubbleManager.freeBubble( floater );
            grow( floater.r / 10 );

            if( bubble.radius > level.next ) {
                level = levels[ levelIndex++ ];
                zoomTimer = 30;
            }
        }
    }

    if( Math.random() > 0.98 ) {
        bubbleManager.makeBubble({
            radius: 10 + Math.random() * 10
        });
    }

    if( zoomTimer ) {
        zoomTimer--;
        zoom( cameraData.zoom + 10 );
    }

    //for ( var i = 0, il = spheres.length; i < il; i ++ ) {
        //var sphere = spheres[ i ];

        //sphere.position.x = 5000 * Math.cos( timer + i );
        //sphere.position.y = 5000 * Math.sin( timer + i * 1.1 );

    //}


    //bg.rotation.x += Math.sin( 50 * ( timer % 1 ) ) / 100;
    //console.log(Math.sin( 100 * ( timer % 1 ) ));
    //bg.rotation.y += 0.01;

    for ( var i = 0; i < bgGeometry.faces.length; i++ ) {
        face = bgGeometry.faces[ i ];
        // determine if current face is a tri or a quad
        numberOfSides = ( face instanceof THREE.Face3 ) ? 3 : 4;
        // assign color to each vertex of current face
        for( var j = 0; j < numberOfSides; j++ ) {
            face.vertexColors[ j ].b += 0.0001;
        }
    }
    bgGeometry.colorsNeedUpdate = true;

    mirrorCubeCamera.position.x = playerMesh.position.x;
    mirrorCubeCamera.position.y = playerMesh.position.y;
    mirrorCubeCamera.position.z = playerMesh.position.z;

    playerMesh.visible = false;

    mirrorCubeCamera.updateCubeMap( renderer, scene );
    //renderer.render( scene, mirrorCubeCamera, renderTarget, true );

    playerMesh.visible = true;

    //renderer.clear();
    renderer.render( scene, camera );

};

var collision = function( position1, position2, radius1, radius2 ) {
    return Math.pow( position2.x - position1.x, 2 ) +  Math.pow( position1.y - position2.y, 2 ) <= Math.pow( radius1 + radius2, 2);
};

var grow = function( radius ) {
    bubble.radius += radius;
    console.log( bubble.radius );
    bubble.scale = playerMesh.scale.x = playerMesh.scale.y = playerMesh.scale.z = bubble.radius / bubble.origRadius;
};

var udpateStageSize = function(x, y) {
    renderer.setSize( stage.width + inertia.x, stage.height + inertia.y );
    $container.css({
        width: stage.width + inertia.x + 'px',
        height: stage.height + inertia.y  + 'px'
    });
};

var keyListen = function(key) {
    Mousetrap.bind(key, function() {
        keysDown[key] = true;
    });
    Mousetrap.bind(key, function() {
        delete keysDown[key];
    }, 'keyup');
};

['right', 'left', 'up', 'down'].forEach(function(key) {
    keyListen(key);
});

$( window ).blur(function() {
    keysDown = {};
});

animate();

}());
