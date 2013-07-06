/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Based on Nvidia Cg tutorial
 */

THREE.BubbleShader = {

	uniforms: {
	},

	vertexShader: [

        "uniform vec3 viewVector;",
        "uniform float c;",
        "uniform float p;",
        "varying float intensity;",

		"void main() {",
            "vec3 vNormal = normalize( normalMatrix * normal );",
            "vec3 vNormel = normalize( normalMatrix * viewVector );",
            "intensity = pow( c - dot(vNormal, vNormel), p );",
            
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [
        "uniform vec3 glowColor;",
        "varying float intensity;",

		"void main() {",
            //"vec4 thing = vec4( glowColor * intensity, 1.0 );",

            //"vec4 mixed = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );",

			//"gl_FragColor = thing;",

            "vec4 glow = vec4( glowColor * intensity, 1.0 );",
            "glow.a = clamp( intensity * 1.6, 0.2, 1.0 );",
            "gl_FragColor = glow;",

		"}"

	].join("\n")

};
