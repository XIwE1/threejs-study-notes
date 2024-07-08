import * as THREE from "../../node_modules/three/build/three.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color("#000");

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 10, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.update();
// controls.addEventListener("change", function () {
//   renderer.render(scene, camera);
// });

// 创建地板
{
  const planeSize = 40;
  const loader = new THREE.TextureLoader();
  const texture = loader.load(
    "https://threejsfundamentals.org/threejs/resources/images/checker.png"
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  const repeats = planeSize / 2;
  texture.repeat.set(repeats, repeats);
  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(planeGeo, planeMat);
  mesh.receiveShadow = true;
  mesh.rotation.x = Math.PI * -0.5;
  scene.add(mesh);
}

// 创建光源
{
  const color = 0xffffff;
  const intensity = 100;
  const light = new THREE.PointLight(color, intensity);
  light.castShadow = true;
  light.position.set(0, 10, 0);
  scene.add(light);

  const helper = new THREE.PointLightHelper(light);
  scene.add(helper);
}

// 摆放球体和立方体
{
  const cubeSize = 4;
  const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const material = new THREE.MeshPhongMaterial({ color: "#8ac" });
  const cubeMesh = new THREE.Mesh(geometry, material);
  cubeMesh.receiveShadow = true;
  cubeMesh.castShadow = true;
  cubeMesh.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(cubeMesh);

  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const shpereGeo = new THREE.SphereGeometry(
    sphereRadius,
    sphereWidthDivisions,
    sphereHeightDivisions
  );
  const sphereMat = new THREE.MeshPhongMaterial({ color: "#8ac" });
  const sphereMesh = new THREE.Mesh(shpereGeo, sphereMat);
  sphereMesh.receiveShadow = true;
  sphereMesh.castShadow = true;
  sphereMesh.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(sphereMesh);
}

// 创建墙体用于接收阴影
{
  const cubeSize = 30;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({
    color: "#CCC",
    side: THREE.BackSide,
  });
  const mesh = new THREE.Mesh(cubeGeo, cubeMat);
  mesh.receiveShadow = true;
  mesh.position.set(0, cubeSize / 2 - 0.1, 0);
  scene.add(mesh);
}
function animation() {
  requestAnimationFrame(animation);
  renderer.render(scene, camera);
}
animation();
