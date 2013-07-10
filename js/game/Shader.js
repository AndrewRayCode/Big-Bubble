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

            if( !(shader.fragment && shader.vertex) ) {
                throw 'Shader ' + shaderName + ' could not be loaded! Please makre sure it is in the DOM.';
            }

            shader.src = shader.fragment + '\n' + shader.vertex;
            shader.uniforms = me.parseUniforms( shader.src );

            me.shaders[ shaderName ] = function() {
                var args = Array.prototype.slice( arguments, 0 ),
                    material;

                shader.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

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
        int: { type: 'i', value: 0 },
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

        // Defaults
        uniforms.resolution = {
            value: new THREE.Vector2( World.stage.width , World.stage.height ),
            type:'v2'
        };
        uniforms.mouse = {
            value: new THREE.Vector2( 10, 10 ),
            type:'v2'
        };

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

        bubble: function( shader, _uniforms ) {

            // Set default values
            shader.uniforms.c.value = 1.2;
            shader.uniforms.p.value = 2.4;
            shader.uniforms.glowColor.value = new THREE.Color( 0xffffff );

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
        },

        oceanbg: function( shader, _uniforms ) {

            shader.uniforms.beamSpeed.value = 0.26;
            shader.uniforms.beamColor.value = new THREE.Vector3( 0.1, 0.2, 0.8 );
            shader.uniforms.bgColor.value = World.bgColor;
            shader.uniforms.dModifier.value = 0;
            shader.uniforms.brightness.value = 0.8;
            shader.uniforms.slantBrightness.value = 0.8;
            shader.uniforms.fractalBrightness.value = 1.3;
            shader.uniforms.fractalSpeed.value = 0.3;
            shader.uniforms.numBeams.value = 13;

            return new THREE.ShaderMaterial({
                uniforms: $.extend( {}, shader.uniforms, _uniforms ),
                side: THREE.BackSide,
                fragmentShader: shader.fragment,
                vertexShader: shader.vertex
            });
        }
    }
});

}(this));
