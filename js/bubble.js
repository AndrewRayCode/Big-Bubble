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

var inertia = { x: 0, y: 0 },
    moving,
    keysDown = {},
    bubble = {
        radius: 30,
        scale: 1,
        segments: 32
    },
    movePhys = {
        acceleration: 3,
        deceleration: 1,
        max: 30
    };

if ( !window.Detector.webgl ) {
    window.Detector.addGetWebGLMessage();
}
    
var $container = $('#game')
    .css({ width: stage.width + 'px', height: stage.height + 'px' });

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( stage.width, stage.height );
renderer.autoClear = false;
$container.append( renderer.domElement );

var zoom = function( level ) {
    cameraData.zoom = camera.position.z = level;
    var frustumHeight = 2.0 * cameraData.zoom * Math.tan(cameraData.fov * 0.5 * ( Math.PI / 180 ) );
    cameraData.frustrum = {
        x: frustumHeight * stage.aspect,
        y: frustumHeight
    };
};

// PerspectiveCamera( fov, aspect, near, far )
var camera = new THREE.PerspectiveCamera( cameraData.fov, stage.width / stage.height, 1, 100000 );
zoom( cameraData.zoom );

var scene = new THREE.Scene();
var geometry = new THREE.SphereGeometry( bubble.radius, bubble.segments, bubble.segments );

var material = new THREE.MeshLambertMaterial({
    color: 0xddddff
});

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

var mesh = new THREE.Mesh( geometry, material );

mesh.position.x = 0;
mesh.position.y = 0;
mesh.position.z = 0;
mesh.scale.x = mesh.scale.y = mesh.scale.z = 1;

scene.add( mesh );

var spheres = [],
    tesh;

var baterial = new THREE.MeshLambertMaterial({
    color: 0x44aa44
});

for ( var i = 0; i < 50; i ++ ) {
    tesh = new THREE.Mesh( geometry, baterial );

    tesh.position.x = ( Math.random() * cameraData.frustrum.x ) - ( cameraData.frustrum.x / 2 );
    tesh.position.y = ( Math.random() * cameraData.frustrum.y ) - ( cameraData.frustrum.y / 2 );
    tesh.position.z = 0;

    tesh.scale.x = tesh.scale.y = tesh.scale.z = 0.5 + Math.random() / 100;

    scene.add( tesh );
    spheres.push( tesh );
}

var animate = function() {
    window.requestAnimationFrame( animate );
    render();
};

var sign = function(num) {
    return num ? num < 0 ? -1 : 1 : 0;
};

var render = function() {

    var timer = 0.0001 * Date.now();

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

    mesh.position.x += inertia.x;
    mesh.position.y += inertia.y;

    var xLimit = cameraData.frustrum.x / 2,
        yLimit = cameraData.frustrum.y / 2;

    if( mesh.position.y > yLimit - bubble.radius ) {
        mesh.position.y = yLimit - bubble.radius;
    }
    if( mesh.position.y < -yLimit + bubble.radius ) {
        mesh.position.y = -yLimit + bubble.radius;
    }
    if( mesh.position.x > xLimit - bubble.radius ) {
        mesh.position.x = xLimit - bubble.radius;
    }
    if( mesh.position.x < -xLimit + bubble.radius ) {
        mesh.position.x = -xLimit + bubble.radius;
    }

    zoom(cameraData.zoom + 1);

    pointLight1.position.x = mesh.position.x + 100;
    pointLight1.position.y = mesh.position.y;

    pointLight2.position.x = mesh.position.x - 100;
    pointLight2.position.y = mesh.position.y;

    pointLight3.position.x = mesh.position.x + 100;
    pointLight3.position.y = mesh.position.y + 100;


    //camera.position.x = 0;
    //camera.position.y = 0;

    //camera.lookAt( scene.position );

    //for ( var i = 0, il = spheres.length; i < il; i ++ ) {

        //var sphere = spheres[ i ];

        //sphere.position.x = 5000 * Math.cos( timer + i );
        //sphere.position.y = 5000 * Math.sin( timer + i * 1.1 );

    //}

    renderer.clear();
    renderer.render( scene, camera );

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
