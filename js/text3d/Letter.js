Bub.Letter = function( letter, options ) {

    var material = new THREE.MeshPhongMaterial({
        transparent: true,
        color: 0xc4feff
    });
    //material.color.g += Bub.Utils.randFloat( -0.05, 0.05 );
    //material.color.b += Bub.Utils.randFloat( -0.05, 0.05 );
    var textGeom = new THREE.TextGeometry( letter, {
        height: 10, curveSegments: 3,
        //size: 20, font: 'janda manatee solid', weight: 'normal',
        //size: 20, font: 'pleasantly plump', weight: 'normal',
        size: 40, font: 'sniglet', weight: 'normal',
        bevelThickness: 4, bevelSize: 2, bevelEnabled: true,
        extrudeMaterial: 1
    });
    // font: helvetiker, gentilis, droid sans, droid serif, optimer
    // weight: normal, bold
    
    var textMesh = new THREE.Mesh( textGeom, material );
    
    textGeom.computeBoundingBox();

    this.material = material;
    this.geom = textGeom;
    this.mesh = textMesh;
    this.textWidth = textGeom.boundingBox.max.x - textGeom.boundingBox.min.x;

    Bub.Mixin.Entity.call( this );
};

Bub.Letter.prototype = Object.create( Bub.Mixin.Entity.prototype );
