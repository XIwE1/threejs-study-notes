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

// 创建几何体
const geometry = new THREE.BufferGeometry();

// 创建顶点数据，以三个坐标为一个顶点，逆时针为正面
// const vertices = new Float32Array([
//   -1.0, -1.0, 0.0,
//   1.0, -1.0, 0.0,
//   1.0, 1.0, 0.0,
//   1.0, 1.0, 0.0,
//   -1.0, 1.0, 0.0,
//   -1.0, -1.0, 0.0,
// ]);
// // 创建顶点属性
// geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
// console.log(geometry);

// 使用索引绘制
const vertices2 = new Float32Array([
  -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, 0.0, -1.0, 1.0, 0.0,
]);
// 创建索引
const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
geometry.setIndex(new THREE.BufferAttribute(indices, 1));
geometry.setAttribute("position", new THREE.BufferAttribute(vertices2, 3));
console.log(geometry);

// 设置2个顶点组，形成2个材质
geometry.addGroup(0, 3, 0);
geometry.addGroup(3, 3, 1);

// 创建材质
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  side: THREE.DoubleSide,
  wireframe: true,
});
const material1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(geometry, [material, material1]);
scene.add(cube);

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial1 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const boxMaterial2 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const boxMaterial3 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const boxMaterial4 = new THREE.MeshBasicMaterial({ color: 0xff00ff });
const boxMaterial5 = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const boxMaterial6 = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const boxMaterials = [boxMaterial1, boxMaterial2, boxMaterial3, boxMaterial4, boxMaterial5, boxMaterial6];
const boxCube = new THREE.Mesh(boxGeometry, boxMaterials);
boxCube.position.set(2, 0, 0);
scene.add(boxCube);

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
