import * as THREE from "../../node_modules/three/build/three.module.js";
import { OrbitControls } from "../../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color("#000");

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);
// camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// 创建坐标辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 创建鼠标控制器
let controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener("change", function () {
  renderer.render(scene, camera); //执行渲染操作
});

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(2, 0, 0);



document.body.appendChild(renderer.domElement);

window.onresize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
};

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();