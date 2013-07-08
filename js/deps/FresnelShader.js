/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Based on Nvidia Cg tutorial
 */

THREE.FresnelShader = {

	uniforms: {
        "mRefractionRatio": { type: "f", value: 0.1 },
        "mFresnelBias": { type: "f", value: -1 },
        "mFresnelPower": { type: "f", value: 2.0 },
        "mFresnelScale": { type: "f", value: 2.0 },
        "time": { type: "f", value: 0.0 },
		"tCube": { type: "t", value: null }
	},

	vertexShader: [

		"uniform float mRefractionRatio;",
		"uniform float mFresnelBias;",
		"uniform float mFresnelScale;",
		"uniform float mFresnelPower;",
        "uniform float time;",

		"varying vec3 vReflect;",
		"varying vec3 vRefract[3];",
		"varying float vReflectionFactor;",

        // dongus
        "uniform vec3 viewVector;",
        "uniform float c;",
        "uniform float p;",
        "varying float intensity;",

		"void main() {",

			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",

			"vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",

			"vec3 I = worldPosition.xyz - cameraPosition;",

			"vReflect = reflect( I, worldNormal );",
			"vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );",
			"vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio );",
			"vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio );",
			"vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );",

			"gl_Position = projectionMatrix * mvPosition;",

            // dngus
            "vec3 vNormal = normalize( normalMatrix * normal );",
            "vec3 vNormel = normalize( normalMatrix * viewVector );",
            "intensity = pow( c - dot(vNormal, vNormel), p );",

            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform samplerCube tCube;",

		"varying vec3 vReflect;",
		"varying vec3 vRefract[3];",
		"varying float vReflectionFactor;",

        "uniform vec3 glowColor;",
        "varying float intensity;",

		"void main() {",

			"vec4 reflectedColor = textureCube( tCube, vec3( vReflect.x, vReflect.yz ) );",
			"vec4 refractedColor = vec4( 1.0 );",

			"refractedColor.r = textureCube( tCube, vec3( vRefract[0].x, vRefract[0].yz ) ).r;",
			"refractedColor.g = textureCube( tCube, vec3( vRefract[1].x, vRefract[1].yz ) ).g;",
			"refractedColor.b = textureCube( tCube, vec3( vRefract[2].x, vRefract[2].yz ) ).b;",

            "vec4 thing = vec4( glowColor * intensity, 1.0 );",
			"refractedColor = refractedColor + ( 0.6 * thing + refractedColor.r );",

            "vec4 mixed = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );",
            "mixed.a = clamp( intensity * 3.6, 0.4, 0.8);",

			"gl_FragColor = mixed;",

            //"vec3 glow = glowColor * intensity;",
            //"gl_FragColor = vec4( glow, 1.0 );",
		"}"

	].join("\n")

};
