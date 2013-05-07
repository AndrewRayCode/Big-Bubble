(function() {

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

if ( ! Detector.webgl ) {
    Detector.addGetWebGLMessage();
}
    
var $container = $('<div></div>').appendTo(document.body);
var renderer = new THREE.WebGLRenderer( { antialias: false } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.autoClear = false;
$container.append( renderer.domElement );

var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 100000 );
camera.position.z = 3200;

var scene = new THREE.Scene();
var geometry = new THREE.SphereGeometry( 100, 32, 16 );

var material = new THREE.MeshLambertMaterial({
    color: 0xCC0000
});

var pointLight = new THREE.PointLight(0xFFFFFF);

// set its position
pointLight.position.z = 1030;

// add to the scene
scene.add(pointLight);

var mesh = new THREE.Mesh( geometry, material );

mesh.position.x = -575;
mesh.position.y =  -497;
mesh.position.z = 0;
mesh.scale.x = mesh.scale.y = mesh.scale.z = 4;

scene.add( mesh );

var animate = function() {
    requestAnimationFrame( animate );
    render();
};


var inertia = { x: 0, y: 0 },
    moving,
    keysDown = {},
    movePhys = {
        acceleration: 6,
        deceleration: 3,
        max: 70
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

        if( inertia.x <= movePhys.deceleration ) {
            inertia.x = 0;
        }
    }


    mesh.position.x += inertia.x;
    mesh.position.y += inertia.y;

    pointLight.position.x = mesh.position.x;
    pointLight.position.y = mesh.position.y;

    camera.position.x = 0;
    camera.position.y = 0;

    camera.lookAt( scene.position );

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


}());

function test() {
var container;

var camera, scene, renderer;
var cameraCube, sceneCube;

var mesh, zmesh, lightMesh, geometry;
var spheres = [];

var directionalLight, pointLight;

var mouseX = 0, mouseY = 0;

//document.addEventListener( 'mousemove', onDocumentMouseMove, false );

function init() {
// create a point light

    for ( var i = 0; i < 500; i ++ ) {

        var mesh = new THREE.Mesh( geometry, material );

        mesh.position.x = Math.random() * 10000 - 5000;
        mesh.position.y = Math.random() * 10000 - 5000;
        mesh.position.z = 0;

        mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;

        scene.add( mesh );

        spheres.push( mesh );

    }

    scene.matrixAutoUpdate = false;

    // Skybox

    var shader = THREE.ShaderLib[ "cube" ];
    //shader.uniforms[ "tCube" ].value = textureCube;

    var material = new THREE.ShaderMaterial( {

        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        side: THREE.BackSide

    } ),

    mesh = new THREE.Mesh( new THREE.CubeGeometry( 100000, 100000, 100000 ), material );
    sceneCube.add( mesh );

    //

    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.autoClear = false;
    container.appendChild( renderer.domElement );

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    cameraCube.aspect = window.innerWidth / window.innerHeight;
    cameraCube.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

    mouseX = ( event.clientX - windowHalfX ) * 10;
    mouseY = ( event.clientY - windowHalfY ) * 10;

}

//

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {

    var timer = 0.0001 * Date.now();

    camera.position.x = 0;
    camera.position.y = 0;

    camera.lookAt( scene.position );

    cameraCube.rotation.copy( camera.rotation );

    for ( var i = 0, il = spheres.length; i < il; i ++ ) {

        var sphere = spheres[ i ];

        //sphere.position.x = 5000 * Math.cos( timer + i );
        //sphere.position.y = 5000 * Math.sin( timer + i * 1.1 );

    }

    renderer.clear();
    //renderer.render( sceneCube, cameraCube );
    renderer.render( scene, camera );

}

init();
animate();
}
