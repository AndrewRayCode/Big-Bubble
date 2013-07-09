// uniform types https://github.com/mrdoob/three.js/wiki/Uniforms-types
(function( global ) {

var Shader = global.Shader = Class.create({

    load: function() {
        var me = this;

        _.each( me.shaders, function( _fn, shaderName ) {
            var $container = $('#' + shaderName),
                shader = {
                    fragment: $container.find('script[type="x-shader/x-fragment"]').text(),
                    vertex: $container.find('script[type="x-shader/x-vertex"]').text()
                };

            shader.src = shader.fragment + '\n' + shader.vertex;
            shader.uniforms = me.parseUniforms( shader.src );

            me.shaders[ shaderName ] = function() {
                var args = Array.prototype.slice( arguments, 0 ),
                    material;

                args = [ shader ].concat( args );
                material = _fn.apply( me, args );

                _.each( material.uniforms, function( uniform, key ) {
                    if( uniform.value instanceof THREE.Color ) {
                        material.uniforms[ key ].type = 'c';
                    }
                });

                me.cache[ shaderName ] = material;

                return material;
            };
        });
    },

    cache: {},

    umap: {
        float: { type: 'f', value: 0 },
        vec2: { type: 'v2', value: function() { return new THREE.Vector2(); } },
        vec3: { type: 'v3', value: function() { return new THREE.Vector3(); } },
        vec4: { type: 'v4', value: function() { return new THREE.Vector4(); } },
        samplerCube: { type: 't' },
        sampler2D: { type: 't' }
    },

    parseUniforms: function( src ) {
        var regex = /^\s*uniform\s+(\w+)\s+(\w+)\s*;$/gm,
            uniforms = {},
            match;

        while ( (match = regex.exec( src )) !== null ) {
            var mapped = $.extend( {}, this.umap[ match[ 1 ] ] );

            if( mapped.value && typeof mapped.value === 'function' ) {
                mapped.value = mapped.value();
            } else if( !( 'value' in mapped) ) {
                mapped.value = null;
            }

            uniforms[ match[ 2 ] ] = mapped;
        }

        return uniforms;
    },

    shaders: {
        fresnel: function( shader, _uniforms ) {

            // Set default values
            shader.uniforms.tCube.value = Camera.mirror.renderTarget;
            shader.uniforms.c.value = 1.0;
            shader.uniforms.p.value = 2.4;
            shader.uniforms.glowColor.value = new THREE.Color( 0xffffff );
            shader.uniforms.mRefractionRatio.value = 0.1;
            shader.uniforms.mFresnelBias.value = -1;
            shader.uniforms.mFresnelPower.value = 2.0;
            shader.uniforms.mFresnelScale.value = 2.0;

            return new THREE.ShaderMaterial({
                fragmentShader: shader.fragment,
                vertexShader: shader.vertex,
                uniforms: $.extend( {}, shader.uniforms, _uniforms ),
                transparent: true
            });
        },

        fireball: function( shader, _uniforms ) {

            // Set default values
            shader.uniforms.tExplosion.value = THREE.ImageUtils.loadTexture( 'media/explosion.png' );
            shader.uniforms.brightness.value = 0.6;
            shader.uniforms.fireSpeed.value = 0.6;
            shader.uniforms.noiseHeight.value = 1.0;

            return new THREE.ShaderMaterial({
                uniforms: $.extend( {}, shader.uniforms, _uniforms ),
                fragmentShader: shader.fragment,
                vertexShader: shader.vertex,
            });
        }
    }
});

}(this));
