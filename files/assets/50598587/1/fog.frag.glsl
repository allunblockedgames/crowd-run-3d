#ifdef MAPFLOAT
uniform float material_opacity;
#endif

#ifdef MAPTEXTURE
uniform sampler2D texture_opacityMap;
#endif

uniform float fog_start_dist;
uniform float fog_end_dist;

void getOpacity() {
    dAlpha = 1.0;

    #ifdef MAPFLOAT
    dAlpha *= material_opacity;
    #endif

    #ifdef MAPTEXTURE
    dAlpha *= texture2D(texture_opacityMap, $UV).$CH;
    #endif

    #ifdef MAPVERTEX
    dAlpha *= clamp(vVertexColor.$VC, 0.0, 1.0);
    #endif
    
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogFactor = (fog_end_dist - depth) / (fog_end_dist - fog_start_dist);
    fogFactor = clamp(fogFactor, 0.0, 1.0);
    
    dAlpha *= fogFactor;
}
