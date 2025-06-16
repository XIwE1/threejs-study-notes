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

// 渐变
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

  const fragmenShader = /* glsl */ `
varying vec2 v_uv;
  void main() {
    float color_red = step(0.5, v_uv.y);
    gl_FragColor = vec4(v_uv, 0.0, 1);
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
  mesh.position.set(-0.6, -0.6, 0);
  scene.add(mesh);
}

// 突变
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

  const fragmenShader = /* glsl */ `
  varying vec2 v_uv;
    void main() {
      float color = step(v_uv.x, 0.5);
      gl_FragColor = vec4(vec3(color), 1);
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
  mesh.position.set(0.6, 0.6, 0);
  scene.add(mesh);
}

// 条纹
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
  
    const fragmenShader = /* glsl */ `
    varying vec2 v_uv;
      void main() {
        float color = step(fract(v_uv.x * 3.0), 0.5);
        gl_FragColor = vec4(vec3(color), 1.0);
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
    mesh.position.set(0.6, -0.6, 0);
    scene.add(mesh);
  }

 
{
    // 创建平面几何体
    const planeGeometry = new THREE.BoxGeometry(1, 1, 1);
  
    // 创建shader
    const vertexShader = /* glsl */ `
        varying vec2 v_uv;
      void main() {
        v_uv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
  
    const fragmenShader = /* glsl */ `
    varying vec2 v_uv;
      void main() {
        float color = step(fract(v_uv.x * 3.0), 0.5);
        gl_FragColor = vec4(vec3(color), 1.0);
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

// 渲染场景
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
