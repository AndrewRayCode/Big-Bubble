Bub.Mixins.forcable = {

    makeForcable: function() {
        this.updateFns.unshift({
            name: 'phys',
            fn: this.physUpdateFn
        });
    },

    applyForce: function( forceVector ) {
        this.phys.acceleration.add( forceVector );
    },

    drag: function() {

        var velocity = this.phys.velocity.clone(),
            speed = velocity.length(),
            dragMagnitude = -( this.phys.dragCoefficient || Bub.World.phys.dragCoefficient ) * speed * speed;
    
        velocity.normalize().multiplyScalar( dragMagnitude );
    
        //Apply the force.
        this.applyForce( velocity );
    },

    physUpdateFn: function() {
        if( !this.noGravity ) {
            this.applyForce( Bub.World.phys.gravity );
        }

        // Friciton force
        this.applyForce(
            this.phys.velocity.clone().normalize().multiplyScalar( -1 * this.phys.friction )
        );

        this.drag();

        var elapsed = Bub.Game.time.delta;

        this.mesh.position.add(
            this.phys.velocity.add(
                this.phys.acceleration.multiplyScalar( elapsed )
            ).clone().multiplyScalar( elapsed )
        );

        if( this.phys.minCap && this.phys.velocity.length() < this.phys.minCap ) {
            this.phys.velocity.set( 0, 0, 0 );
        }

        this.phys.acceleration.set( 0, 0, 0 );
    }
};
