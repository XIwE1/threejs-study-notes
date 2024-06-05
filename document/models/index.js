import * as THREE from "../../node_modules/three/build/three.module.js";
import { OrbitControls } from "../../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color("#eee");

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
// controls.autoRotate = true;
// controls.enableDamping = true;
// 监听控制器，每次拖动后重新渲染画面
controls.addEventListener("change", function () {
  renderer.render(scene, camera); //执行渲染操作
});

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.set(2, 0, 0);

const loader = new GLTFLoader().setPath("./public/");
let model;
loader.load(
  "scene.gltf",
  function (gltf) {
    console.log("gltf", gltf);
    model = gltf.scene;
    model.position.set(-2, 0, 0);
    model.scale.set(2, 2, 2);
    // model.rotation.set(0, -Math.PI / 4, 0, "XYZ");
    model.add(cube);
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

document.body.appendChild(renderer.domElement);

window.onresize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
};

function animate() {
  controls.update();
  // if (model) {
  //   model.position.x += 0.01;
  //   model.rotation.y += 0.01;
  //   if (model.position.x > 2) {
  //     model.position.x = -2;
  //   }
  // }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

const reset_button = document.createElement("div");
reset_button.classList.add("reset_button");
reset_button.innerText = "重置";
document.body.appendChild(reset_button);
reset_button.onclick = function () {
  reset();
};

function reset() {
  controls.reset();
}
