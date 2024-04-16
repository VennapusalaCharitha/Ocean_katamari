uniform float amplitude;
varying vec3 vPosition;

void main() {
  vPosition = position;
  float wave = amplitude * sin(position.x * 5.0 + time) * sin(position.z * 5.0 + time);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.x, position.y + wave, position.z, 1.0);
}
