import { getSystem } from '../engine'

type ShaderConfig = {
  colorMode?: string
  color?: number[]
  flaring?: number // 0 - 1
  speed?: number // 0 -1
  tail?: number // 0 - 1
  follows?: Phaser.GameObjects.Sprite
}

export function createSmoke (scene: Phaser.Scene, x: number, y: number, width: number, height: number, duration: number = 500, config: ShaderConfig = {}) {
  const smokeShaderCode = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;

float noise(vec2 p) {
    return sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453;
}

float perlin(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = noise(i);
    float b = noise(i + vec2(1.0, 0.0));
    float c = noise(i + vec2(0.0, 1.0));
    float d = noise(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float n = perlin(uv * 10.0 + u_time * 0.5);
    n = smoothstep(0.2, 0.3, n);
    gl_FragColor = vec4(vec3(n), 1.0);
}
`;

  const vertexShaderCode = `
    attribute vec2 aVertexPosition;
    varying vec2 vUV;

    void main(void) {
        vUV = aVertexPosition * 0.5 + 0.5; // Convert from range [-1, 1] to [0, 1]
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);
    }
`;
  const shader = scene.add.shader({
    fragmentSrc: smokeShaderCode,
    key: 'smokeShader',  // Unique identifier for the shader
    uniforms: {
        u_time: { type: '1f', value: 0 },
        u_resolution: { type: '2fv', value: [ width, height ] }
    },
    vertexSrc: vertexShaderCode  // Use default vertex shader
  }, x, y, width, height, ['fireball']);


  const system = getSystem()

  const widthOffset = (config.follows?.displayWidth ?? 0) / 2
  const heightOffset = (config.follows?.displayHeight ?? 0) / 2
  let elapsed = 0

  system.eventQueue.addAction((delta: number) => {
      elapsed += delta

      if (config.follows) {
        const followX = config.follows?.body?.position.x as number
        const followY = config.follows?.body?.position.y as number

        shader.setPosition(
          followX - widthOffset,
          followY - heightOffset
        )
      }

      shader.setUniform('u_time', delta * 0.001);
    },
    () => elapsed >= duration,
    () => shader.destroy()
  )
}