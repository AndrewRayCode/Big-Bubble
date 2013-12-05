Bub.ModeManager.modes.descend = new Bub.Mode({

    updateSpawner: function() {
        var frustrum = Bub.camera.data.frustrum;

        this.spawner.position.set( 0, -frustrum.min.y + 100, 0 );
        this.spawner.scale.set( frustrum.max.x - frustrum.min.x, 0, 0 );
        this.spawner.update();
    },

    entities: Bub.Mode.defaultEntities,

    start: function() {
        Bub.World.phys.gravity = new THREE.Vector3( 0, -100, 0 );
    },
    end: function() {},
    loop: function() {}
});
