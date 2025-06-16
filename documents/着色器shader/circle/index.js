import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 2.5);
camera.lookAt(new THREE.Vector3());
scene.background = new THREE.Color("rgba(246, 241, 241, 0.23)");

let controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener("change", function () {
  renderer.render(scene, camera); //执行渲染操作
});

document.body.appendChild(renderer.domElement);
// 径向/动态/多组动态
{
  // 创建平面几何体
  const planeGeometry = new THREE.PlaneGeometry(1, 1);

  // 创建shader
  const vertexShader = /* glsl */ `
      varying vec2 v_uv;
      void main() {
        v_uv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

  // fract重复n次，0.707 是0.5(位移了0.5 + uv界限1.0)斜边的长度
  const fragmenShader = /* glsl */ `
      varying vec2 v_uv;
      void main() {
        float distance = fract(length(v_uv - 0.5) / 0.707 * 5.0);
        vec3 color = vec3(step(0.5, distance));
        gl_FragColor = vec4(color, 1.0);
      }
    `;

  // 创建材质
  const material = new THREE.ShaderMaterial({
    fragmentShader: fragmenShader,
    vertexShader: vertexShader,
    side: THREE.DoubleSide,
  });

  // 创建网格
  const mesh = new THREE.Mesh(planeGeometry, material);
  mesh.position.set(-0.6, 0.6, 0);
  scene.add(mesh);
}

{
  // 创建平面几何体
  const planeGeometry = new THREE.PlaneGeometry(1, 1);

  // 创建shader
  const vertexShader = /* glsl */ `
      varying vec2 v_uv;
      void main() {
        v_uv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

  // sin(u_time) * 0.5 + 0.5 确保 范围在[0, 1]，再 * 0.5 = 不是斜边线的最大距离
  const fragmenShader = /* glsl */ `
      uniform float u_time;
      varying vec2 v_uv;
      void main() {
        float distance = length(v_uv - 0.5);
        float radius = 0.5 * (sin(u_time) * 0.5 + 0.5);
        vec3 color = vec3(step(radius, distance));
        gl_FragColor = vec4(color, 1.0);
      }
    `;

  // 创建材质
  const material = new THREE.ShaderMaterial({
    uniforms: {
      u_time: { value: 0 },
    },
    fragmentShader: fragmenShader,
    vertexShader: vertexShader,
    side: THREE.DoubleSide,
  });

  // 创建网格
  const mesh = new THREE.Mesh(planeGeometry, material);
  mesh.position.set(0.6, 0.6, 0);
  scene.add(mesh);

  setInterval(() => {
    material.uniforms.u_time.value += 0.05; // 渲染场景
  }, 16);
}
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

window.onresize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
};

animate();
