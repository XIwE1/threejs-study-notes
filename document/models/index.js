import * as THREE from "../../node_modules/three/build/three.module.js";
import { OrbitControls } from "../../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color("#494141");

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

// 创建光源
const color = 0xFFFFFF;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 });
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
    gui.add(model.position, "x", -5, 5).step(1).name("模型X轴位置");
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
  if (model) {
      // model.position.x += 0.01;
      // model.rotation.y += 0.01;
      // if (model.position.x > 2) {
      //   model.position.x = -2;
      // }
  }
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

const eventObj = {
  ResetCamera: function () {
    controls.reset();
  },
  myNumber: 1,
  myString: "lil-gui",
};

// 创建GUI
const gui = new GUI();
// 添加按钮 function类型案例
gui.add(eventObj, "ResetCamera").name("重置");

// 控制数字
const number_folder = gui.addFolder("number类型UI");
number_folder.add(eventObj, "myNumber", 0, 1);
number_folder.add(eventObj, "myNumber", 0, 100, 2); // snap to even numbers
number_folder.add(eventObj, "myNumber", [0, 1, 2]);
number_folder.add(eventObj, "myNumber", { Label1: 0, Label2: 1, Label3: 2 });

// 创建控制菜单
const folder = gui.addFolder("cube 位置");
// 控制物体位置 number类型案例
folder
  .add(cube.position, "x", -5, 5)
  .step(1)
  .name("立方体X轴位置")
  .onChange((val) => {
    console.log("立方体X轴位置", val);
  });
folder
  .add(cube.position, "y")
  .min(-5)
  .max(5)
  .step(1)
  .name("立方体Y轴位置")
  .onFinishChange((val) => {
    console.log("立方体Y轴位置", val);
  });
// 线框模式 boolean类型案例
gui.add(cube.material, "wireframe").name("线框模式");
// 颜色选择器 color类型案例
const colorFormats = {
  cubeColor: "#ffffff",
  int: 0xffffff,
  object: { r: 1, g: 1, b: 1 },
  array: [1, 1, 1],
};

gui.addColor(colorFormats, "cubeColor").onChange((val) => {
  cube.material.color.set(val);
});

gui.add(eventObj, "myString");
