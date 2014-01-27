Bub.Mixins.tweenable = {

    tween: function( to, duration ) {
        var tweener = {},
            me = this,
            update = function() {},
            key, sendTo;

        if( 'material' in to ) {
            key = Bub.Utils.getKey( to.material );
            tweener = this.mesh.material.map[ key ];
            sendTo = to.material[ key ];
        } else if( 'shader' in to ) {
            key = Bub.Utils.getKey( to.shader );
            tweener = this.mesh.material.uniforms[ key ];
            sendTo = { value: to.shader[ key ] };
        } else if( 'position' in to ) {
            tweener = this.mesh.position;
            sendTo = to.position;

        } else if( 'rotation' in to ) {
            tweener = this.mesh.rotation;
            sendTo = to.rotation;

        } else if( 'opacity' in to ) {
            tweener = {
                opacity: this.mesh.material.opacity
            };
            sendTo = {
                opacity: to.opacity
            };
            update = function() {
                me.mesh.material.opacity = this.opacity;
            };
        }

        var sendValue = Bub.Utils.getValue( sendTo );

        if( sendTo instanceof THREE.Color ) {
            sendTo = _.pick( sendTo, 'r', 'g', 'b' );
        }

        return new TWEEN.Tween( tweener )
            .to( sendTo, duration || 1000 )
            .onUpdate( update )
            .start();

    }

};
