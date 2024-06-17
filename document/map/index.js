import * as THREE from "../../node_modules/three/build/three.module.js";
import { OrbitControls } from "../../node_modules/three/examples/jsm/controls/OrbitControls.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { RGBELoader } from "three/examples/jsm/Addons.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color("#000");
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  500
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// 摆设相机位置，设置视点方向
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

//创建鼠标控制器
let controls = new OrbitControls(camera, renderer.domElement);
//监听控制器，每次拖动后重新渲染画面
controls.addEventListener("change", function () {
  renderer.render(scene, camera); //执行渲染操作
});

// 创建纹理加载器
let textureLoader = new THREE.TextureLoader();
const map = textureLoader.load("/textures/xxxx.png");
const aoMap = textureLoader.load("/textures/xxxx.png");
const alphaMap = textureLoader.load("/textures/xxxx.png");
const lightMap = textureLoader.load("/textures/xxxx.png");
const specularMap = textureLoader.load("/textures/xxxx.png");
// 创建场景加载器
const rgbeLoader = new RGBELoader();
rgbeLoader.load("/textures/xxxx.hdr", (envMap) => {
  // 设置为环境映射模式
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  // 设置为场景贴图
  scene.background = envMap;
  scene.environment = envMap; // 场景中没有环境贴图的物理材质 会以他为环境贴图
  // 设置材质的环境贴图
  planeMaterial.envMap = envMap;
});

const planeGeometry = new THREE.PlaneGeometry(1, 1);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  map: map,
  transparent: true,
  aoMap: aoMap,
  alphaMap: alphaMap,
  lightMap: lightMap,
  specularMap: specularMap,
  reflectivity: 0.5,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

GUI.add(planeMaterial, "aoMapIntensity")
  .min(0)
  .max(1)
  .step(0.01)
  .name("环境遮罩光强度");

document.body.appendChild(renderer.domElement);

renderer.render(scene, camera);
