// https://github.com/squarefeet/ShaderParticleEngine
// http://squarefeet.github.io/ShaderParticleEngine/
Bub.Particle = {

    emitters: {},

    id: 0,

    // this is not a nice API. I hope to improve it if I get more intimate
    // with https://github.com/squarefeet/ShaderParticleEngine
    register: function( opts, groupOpts, emitterOpts ) {

        var particleGroup = new ShaderParticleGroup( groupOpts ),
            particleEmitter = new ShaderParticleEmitter( emitterOpts ),
            id = this.id;

        var group = {
            group: particleGroup,
            emitter: particleEmitter,
            opts: opts
        };

        group.update = opts.update || function() {};

        particleGroup.addEmitter( particleEmitter );
        Bub.World.scene.add( particleGroup.mesh );

        this.emitters[ id ] = group;

        this.id++;

        return id;
    },

    destroy: function( id ) {
        Bub.World.scene.remove( this.emitters[ id ].group.mesh );
        delete this.emitters[ id ];
    },

    update: function( delta ) {
        _.each( this.emitters,  function( emitter ) {
            emitter.group.tick( delta );
            emitter.update();
        });
    },

    each: function( fn ) {
        _.each( this.emitters, fn ) ;
    },

    lockTo: function( thing ) {
        return function() {
            this.emitter.position.copy( thing.mesh.position );

            _.each( this.group.mesh.geometry.vertices, function( vertex ) {
                //var computed = Bub.Utils.vecMoveOffset( vertex, thing.mesh.position, 5 );
                vertex.copy( thing.mesh.position );
            });
        };
    }
};
