precision mediump float;

varying vec2 vTexCoordinate;
uniform sampler2D uMapNormal;
uniform sampler2D uMapPosition;
uniform sampler2D uMapShadow;
uniform sampler2D uMapPing;

uniform vec3 uLightPosition0;

// todo: should this be turned into a uniform variable?
float uKsExponent = 100.0;

vec4 calcLight(vec3 normal, vec3 position, vec3 lightPosition, vec3 lightColor)
{
    highp vec3 lightDirection = normalize(lightPosition - position); 

    highp float diffuseFactor = max(0.0, dot(normal, lightDirection)); 
    
    diffuseFactor /= 3.0;
    
    vec3 E = normalize(-position.xyz);
    vec3 R = reflect(-lightDirection, normal);
    float specular =  max(dot(R, E), 0.0);

    float specularFactor = pow(specular, uKsExponent);

    return vec4(lightColor* diffuseFactor, specularFactor);
}


void main(void)
{
    vec4 tv4Normal   = texture2D(uMapNormal,   vTexCoordinate);
    highp vec4 tv4Position = texture2D(uMapPosition, vTexCoordinate);
	
	vec4 shadowMap   = texture2D( uMapShadow,    vTexCoordinate);
	
	
    vec4 tv4Ping   = texture2D(uMapPing,   vTexCoordinate);
	
	
	

	
	
    vec3 lightColor = vec3( 1, 1, 1 );

    vec4 lightRes = calcLight( normalize(tv4Normal.xyz), 
                               tv4Position.xyz, 
                               uLightPosition0, 
                               lightColor );
        
    
	
	gl_FragColor = (shadowMap * lightRes) + tv4Ping;
    
    
} 



