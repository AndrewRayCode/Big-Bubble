(function() {

var stage = {
    width: 400, // window.innerWidth
    height: 600 // window.innerHeight
};

if ( ! window.Detector.webgl ) {
    window.Detector.addGetWebGLMessage();
}
    
var $container = $('#game')
    .css({ width: stage.width + 'px', height: stage.height + 'px' });
var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( stage.width, stage.height );
renderer.autoClear = false;
$container.append( renderer.domElement );

var camera = new THREE.PerspectiveCamera( 60, stage.width / stage.height, 1, 100000 );
camera.position.z = 3200;

var scene = new THREE.Scene();
var geometry = new THREE.SphereGeometry( 100, 32, 16 );

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

mesh.position.x = -575;
mesh.position.y =  -497;
mesh.position.z = 0;
mesh.scale.x = mesh.scale.y = mesh.scale.z = 4;

scene.add( mesh );

var spheres = [],
    tesh;

var baterial = new THREE.MeshLambertMaterial({
    color: 0x44aa44
});

for ( var i = 0; i < 500; i ++ ) {

    tesh = new THREE.Mesh( geometry, baterial );

    tesh.position.x = Math.random() * 10000 - 5000;
    tesh.position.y = Math.random() * 10000 - 5000;
    tesh.position.z = 0;

    tesh.scale.x = tesh.scale.y = tesh.scale.z = Math.random() * 2 + 1;

    scene.add( tesh );
    spheres.push( tesh );

}

var animate = function() {
    window.requestAnimationFrame( animate );
    render();
};

var inertia = { x: 0, y: 0 },
    moving,
    keysDown = {},
    movePhys = {
        acceleration: 4,
        deceleration: 2,
        max: 40
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

    pointLight1.position.x = mesh.position.x + 100;
    pointLight1.position.y = mesh.position.y;

    pointLight2.position.x = mesh.position.x - 100;
    pointLight2.position.y = mesh.position.y;

    pointLight3.position.x = mesh.position.x + 100;
    pointLight3.position.y = mesh.position.y + 100;

    camera.position.x = 0;
    camera.position.y = 0;

    camera.lookAt( scene.position );

    renderer.setSize( stage.width + inertia.x, stage.height + inertia.y );
    $container.css({ width: stage.width + inertia.x + 'px', height: stage.height + inertia.y  + 'px' });

    //for ( var i = 0, il = spheres.length; i < il; i ++ ) {

        //var sphere = spheres[ i ];

        //sphere.position.x = 5000 * Math.cos( timer + i );
        //sphere.position.y = 5000 * Math.sin( timer + i * 1.1 );

    //}

    renderer.clear();
    renderer.render( scene, camera );

};

animate();

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

}());
