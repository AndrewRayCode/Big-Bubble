// Created by inigo quilez - iq/2013
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

//-----------------------------------------------------------------------------------

vec4 map( in vec3 p ) {
    float h = 1.0;
    vec3 q = p;
    float th = 0.0;
    float rr = 0.0;
    h = 0.9 + (1.0-0.6*rr)*(1.5-1.0*th) * 0.1*(1.0-texture2D( iChannel0, 0.1*q.xz, -100.0 ).x);
    h += th*1.25;
    h -= 0.24*rr;
    h *= 0.75;
    vec4 res = vec4( (p.y+h)*0.3, p.x, 0.0, 0.0 );

    return res;
}

vec4 intersect( in vec3 ro, in vec3 rd )
{
    return vec4( 0.0, 0.0, 0.0, 0.0);
}

vec3 calcNormal( in vec3 pos, in float e )
{
    vec3 eps = vec3(e,0.0,0.0);
    return normalize( vec3(
           map(pos+eps.xyy).x - map(pos-eps.xyy).x,
           map(pos+eps.yxy).x - map(pos-eps.yxy).x,
           map(pos+eps.yyx).x - map(pos-eps.yyx).x ) );
}

vec3 lig = normalize(vec3(0.9,0.35,-0.2));

void main( void )
{
    vec2 q = gl_FragCoord.xy / iResolution.xy;
    vec2 p = -1.0 + 2.0 * q;
    p.x *= iResolution.x/iResolution.y;
    vec2 m = vec2(0.5);
    if( iMouse.z>0.0 ) m = iMouse.xy/iResolution.xy;


    //-----------------------------------------------------
    // camera
    //-----------------------------------------------------

    float an = 1.5 + 0.1*iGlobalTime - 12.0*(m.x-0.5);

    vec3 ta =  vec3(0.0,0.0,-2.0);
    vec3 ro = ta + vec3(4.0*sin(an),4.0,4.0*cos(an));

    // shake
    ro += 0.01*sin(4.0*iGlobalTime*vec3(1.1,1.2,1.3)+vec3(3.0,0.0,1.0) );
    ta += 0.01*sin(4.0*iGlobalTime*vec3(1.7,1.5,1.6)+vec3(1.0,2.0,1.0) );

    // camera matrix
    vec3 ww = normalize( ta - ro );
    vec3 uu = normalize( cross(ww,vec3(0.0,1.0,0.0) ) );
    vec3 vv = normalize( cross(uu,ww));
    
    // create view ray
    p.x += 0.012*sin( 3.0*sin(4.0*p.y+0.5*iGlobalTime) + 4.0*p.x + 0.5*iGlobalTime );
    vec3 rd = normalize( p.x*uu + p.y*vv + 2.5*ww );

    //-----------------------------------------------------
    // render
    //-----------------------------------------------------

    vec3 col = vec3(0.4,0.6,0.8);
    vec3 bcol = col;
    
    float pt = (1.0-ro.y)/rd.y;
    
    vec3 oro = ro;
    if( pt>0.0 ) ro=ro+rd*pt;
    
    // raymarch
    vec4 tmat = intersect(ro,rd);
    if( tmat.z>-0.5 )
    {
        float eps = 0.01 + 0.03*step(0.5,tmat.z);
        // geometry
        vec3 pos = ro + tmat.x*rd;
        vec3 nor = calcNormal(pos,eps);
        vec3 ref = reflect( rd, nor );

        // materials
        vec4 mate = vec4(0.0,0.6,1.0,0.0);
        
        
        // lighting
        float dif = max(dot(nor,lig),0.0);

        // lights
        vec3 brdf = vec3(0.0);
        float cc  = 0.55*texture2D( iChannel2, 1.8*0.02*pos.xz + 0.007*iGlobalTime*vec2( 1.0, 0.0) ).x;
              cc += 0.25*texture2D( iChannel2, 1.8*0.04*pos.xz + 0.011*iGlobalTime*vec2( 0.0, 1.0) ).x;
              cc += 0.10*texture2D( iChannel2, 1.8*0.08*pos.xz + 0.014*iGlobalTime*vec2(-1.0,-1.0) ).x;
        cc = 0.6*(1.0-smoothstep( 0.0, 0.025, abs(cc-0.4))) + 
             0.4*(1.0-smoothstep( 0.0, 0.150, abs(cc-0.4)));
        dif *= 1.0 + 2.0*cc;

        brdf += 3.5*dif*vec3(1.00,1.00,1.00);

        // surface-light interacion
        col = mate.xyz* brdf;

        // fog
        tmat.x = max(0.0,tmat.x-1.3); col *= 0.65;
        float hh = 1.0-exp(-0.2*tmat.x); 
        col = col*(1.0-hh)*(1.0-hh) + 1.25*vec3(0.0,0.12,0.2)*hh;
    }
    
    //-----------------------------------------------------
    // postprocessing
    //-----------------------------------------------------

    col *= smoothstep( 0.0, 1.0, iGlobalTime );
    
    gl_FragColor = vec4( col, 1.0 );
}


