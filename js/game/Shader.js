// uniform types https://github.com/mrdoob/three.js/wiki/Uniforms-types
// fireball shader http://www.webgl.com/2012/03/webgl-demo-fireball/
// www.flickr.com/photos/chorando/sets/72157607835630011/
// textures! www.textureking.com
// 3d fireball https://www.shadertoy.com/view/4ssGzn
// pretty flame https://www.shadertoy.com/view/MdX3zr
// 2d water refraction https://www.shadertoy.com/view/4slGRM
// sonar https://glsl.heroku.com/e#10201.0
// spirals spinning https://glsl.heroku.com/e#10207.0
// beautiful cloud-like surface https://glsl.heroku.com/e#10647.1
// broccoli fireball http://clicktorelease.com/code/perlin/green.html
// fire bg https://glsl.heroku.com/e#11554.0
// cell noise (ice?) https://glsl.heroku.com/e#12216.0
// gooey globs https://glsl.heroku.com/e#12123.0
// sandy whores of time https://www.shadertoy.com/view/4dlGDN
// blood vessel? https://www.shadertoy.com/view/lsj3zW
// water caustic-ish https://glsl.heroku.com/e#12412.0 https://glsl.heroku.com/e#12010.0 https://glsl.heroku.com/e#12002.2
// sex cloud rainbow trails https://glsl.heroku.com/e#12881.0
// dualing spirals https://glsl.heroku.com/e#13068.2

// game assets
// http://www.blendswap.com/
// http://opengameart.org/
(function() {

var Shader = function() {
    this.cache = [];
};

Shader.prototype = {

    constructor: Shader,

    load: function() {
        var me = this;

        _.each( me.shaders, function( _fn, shaderName ) {
            var $container = $('#' + shaderName),
                shader = {
                    fragment: $container.find('script[type="x-shader/x-fragment"]').text(),
                    vertex: $container.find('script[type="x-shader/x-vertex"]').text()
                };

            if( !(shader.fragment && shader.vertex) ) {
                throw 'Bub.Shader ' + shaderName + ' could not be loaded! Please make sure it is in the DOM.';
            }

            shader.src = shader.fragment + '\n' + shader.vertex;
            $.extend( shader, me.parseMembers( shader.src ) );

            me.shaders[ shaderName ] = function() {
                var args = Array.prototype.slice( arguments, 0 ),
                    material;

                shader.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

                // Defaults
                shader.uniforms.opacity = { type: 'f', value: 1 };

                args = [ shader ].concat( args );
                material = _fn.apply( me, args );

                _.each( material.uniforms, function( uniform, key ) {
                    if( uniform.value instanceof THREE.Color ) {
                        material.uniforms[ key ].type = 'c';
                    }
                });

                me.cache.push( material );

                return material;
            };
        });
    },

    umap: {
        float: { type: 'f', value: 0 },
        int: { type: 'i', value: 0 },
        vec2: { type: 'v2', value: function() { return new THREE.Vector2(); } },
        vec3: { type: 'v3', value: function() { return new THREE.Vector3(); } },
        vec4: { type: 'v4', value: function() { return new THREE.Vector4(); } },
        samplerCube: { type: 't' },
        sampler2D: { type: 't' }
    },

    parseMembers: function( src ) {
        var regex = /^\s*(uniform|attribute)\s+(\w+)\s+(\w+)\s*;$/gm,
            members = {
                uniforms: {},
                attributes: {}
            },
            match, mapped;

        while ( (match = regex.exec( src )) !== null ) {
            mapped = $.extend( {}, this.umap[ match[ 2 ] ] );

            if( mapped.value && typeof mapped.value === 'function' ) {
                mapped.value = mapped.value();
            } else if( !( 'value' in mapped) ) {
                mapped.value = null;
            }

            members[ match[ 1 ] + 's' ][ match[ 3 ] ] = mapped;
        }

        // Defaults
        members.uniforms.resolution = {
            value: Bub.World.size.clone(),
            type:'v2'
        };
        members.uniforms.mouse = {
            value: new THREE.Vector2( 10, 10 ),
            type:'v2'
        };

        return members;
    },

    shaders: {

        lava: function( shader, members ) {
            members = members || {};

            shader.uniforms.texture1.value = Bub.Assets.textures.cloud;
            shader.uniforms.texture2.value = Bub.Assets.textures.lava;
            shader.uniforms.fog.value = 0.1;
            shader.uniforms.offset.value = Bub.Utils.randInt( -100, 100 );
            shader.uniforms.speed.value = Bub.Utils.randFloat( 0.2, 2.2 );
            shader.uniforms.fogColor.value = new THREE.Color( 0x000000 );
            shader.uniforms.glowColor.value = new THREE.Color( 0xffcda3 );
            shader.uniforms.uvScale.value = new THREE.Vector2( 3.0, 1.0 );

            var mat = new THREE.ShaderMaterial({
                fragmentShader: shader.fragment,
                vertexShader: shader.vertex,
                uniforms: $.extend( {}, shader.uniforms, members.uniforms ),
                attributes: $.extend( {}, shader.attributes, members.attributes ),
                transparent: true
            });

            return mat;
        },

        caustic: function( shader, members ) {
            members = members || {};

            // http://www.goodboydigital.com/pixijs/examples/15/indexAll.html
            // http://www.goodboydigital.com/pixijs/docs/files/src_pixi_filters_DisplacementFilter.js.html#l6
            shader.uniforms.opacity.value = 1.0;
            var mat = new THREE.ShaderMaterial({
                fragmentShader: shader.fragment,
                vertexShader: shader.vertex,
                uniforms: $.extend( {}, shader.uniforms, members.uniforms ),
                attributes: $.extend( {}, shader.attributes, members.attributes ),
                transparent: true
            });

            return mat;
        },

        displacement: function( shader, members ) {
            members = members || {};

            // http://www.goodboydigital.com/pixijs/examples/15/indexAll.html
            // http://www.goodboydigital.com/pixijs/docs/files/src_pixi_filters_DisplacementFilter.js.html#l6
            shader.uniforms.displacementMap.value = THREE.ImageUtils.loadTexture( 'media/caustic.jpg' );
            shader.uniforms.scale.value = new THREE.Vector2( 30, 30 );
            shader.uniforms.offset.value = new THREE.Vector2( 0, 0 );
            shader.uniforms.mapDimensions.value = new THREE.Vector2( 512, 512 );
            shader.uniforms.dimensions.value = new THREE.Vector4( 0, 0, 0, 0 );

            var mat = new THREE.ShaderMaterial({
                fragmentShader: shader.fragment,
                vertexShader: shader.vertex,
                uniforms: $.extend( {}, shader.uniforms, members.uniforms ),
                attributes: $.extend( {}, shader.attributes, members.attributes ),
                transparent: true
            });

            return mat;
        },

        wiggly: function( shader, members ) {
            members = members || {};

            shader.uniforms.amplitude.value = 0.055;
            shader.uniforms.frequency.value = 0.03;
            shader.uniforms.speed.value = 2.0;
            shader.uniforms.tex.value = Bub.Assets.textures.veiny;

            var mat = new THREE.ShaderMaterial({
                fragmentShader: shader.fragment,
                vertexShader: shader.vertex,
                uniforms: $.extend( {}, shader.uniforms, members.uniforms ),
                attributes: $.extend( {}, shader.attributes, members.attributes ),
                transparent: true
            });

            mat.depthWite = false;

            return mat;
        },

        fresnel: function( shader, members ) {
            members = members || {};

            // Set default values
            shader.uniforms.tCube.value = Bub.camera.mirror.renderTarget;
            // Anything lower than this seems to cause a black artifact on
            // the bubble
            shader.uniforms.c.value = 1.01;
            shader.uniforms.p.value = 2.4;
            shader.uniforms.glowColor.value = new THREE.Color( 0x69D2E7 );
            shader.uniforms.mRefractionRatio.value = 0.1;
            shader.uniforms.mFresnelBias.value = -1;
            shader.uniforms.mFresnelPower.value = 2.0;
            shader.uniforms.mFresnelScale.value = 2.0;
            shader.uniforms.amplitude.value = 0;
            shader.uniforms.frequency.value = 200;
            shader.uniforms.speed.value = 20.0;

            var mat = new THREE.ShaderMaterial({
                fragmentShader: shader.fragment,
                vertexShader: shader.vertex,
                uniforms: $.extend( {}, shader.uniforms, members.uniforms ),
                attributes: $.extend( {}, shader.attributes, members.attributes ),
                transparent: true
            });

            mat.depthWite = false;

            return mat;
        },

        bubble: function( shader, members ) {
            members = members || {};

            // Set default values
            shader.uniforms.c.value = 1.2;
            shader.uniforms.p.value = 2.4;
            shader.uniforms.opacity.value = 1.0;
            shader.uniforms.glowColor.value = new THREE.Color( 0x69D2E7 );
            shader.uniforms.addColor.value = new THREE.Color( 0x000000 );

            var mat = new THREE.ShaderMaterial({
                fragmentShader: shader.fragment,
                vertexShader: shader.vertex,
                uniforms: $.extend( {}, shader.uniforms, members.uniforms ),
                attributes: $.extend( {}, shader.attributes, members.attributes ),
                side: THREE.FrontSide,
                blending: THREE.AdditiveBlending,
                transparent: true
            });

            return mat;
        },

        fireball: function( shader, members ) {
            members = members || {};

            // Set default values
            shader.uniforms.tExplosion.value = THREE.ImageUtils.loadTexture( 'media/explosion.png' );
            shader.uniforms.brightness.value = 1.0;
            shader.uniforms.fireSpeed.value = 0.15;
            shader.uniforms.noiseHeight.value = 0.01;
            shader.uniforms.displacementHeight.value = 0.2;
            shader.uniforms.turbulenceDetail.value = 0.7;

            return new THREE.ShaderMaterial({
                uniforms: $.extend( {}, shader.uniforms, members.uniforms ),
                attributes: $.extend( {}, shader.attributes, members.attributes ),
                fragmentShader: shader.fragment,
                vertexShader: shader.vertex,
                transparent: true
            });
        },

        oceanbg: function( shader, members ) {
            members = members || {};

            shader.uniforms.beamSpeed.value = 0.26;
            shader.uniforms.beamColor.value = new THREE.Vector3( 0.1, 0.2, 0.8 );
            shader.uniforms.bgColor.value = Bub.World.bgColor;
            shader.uniforms.dModifier.value = 0;
            shader.uniforms.brightness.value = 0.8;
            shader.uniforms.slantBrightness.value = 0.2;
            shader.uniforms.fractalBrightness.value = 1.3;
            shader.uniforms.fractalSpeed.value = 0.3;
            shader.uniforms.numBeams.value = 13;

            return new THREE.ShaderMaterial({
                uniforms: $.extend( {}, shader.uniforms, members.uniforms ),
                attributes: $.extend( {}, shader.attributes, members.attributes ),
                side: THREE.BackSide,
                fragmentShader: shader.fragment,
                vertexShader: shader.vertex
            });
        }
    }
};

Bub.Shader = new Shader();

}());
