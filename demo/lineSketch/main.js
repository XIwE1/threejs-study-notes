import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";


import {
  showToast,
  loadModel,
  loadTexture,
  getSketchInfos,
  createSketch,
  setupComposer,
  PickHelper
} from "./utils/index.js";

class App {
  scene = null;
  camera = null;
  renderer = null;
  controls = null;
  composer = null;
  picker = null;

  constructor(container) {
    this.container = container;
    container && this.init();
  }

  init() {
    // 初始化场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#212121");
    this.scene.colorSpace = THREE.SRGBColorSpace;

    // 初始化相机
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 2.5;
    this.camera.position.y = 2;

    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    // 创建轨道控制器
    this.controls = new OrbitControls(this.camera, this.container);
    this.controls.enableDamping = true;
    window.addEventListener("resize", this.onResize.bind(this));

    // 注册composer
    this.composer = setupComposer(this.scene, this.camera, this.renderer);
    // 创建拾取器picker
    this.picker = new PickHelper(this.container);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer &&
      this.composer.setSize(window.innerWidth, window.innerHeight);
  }



  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.picker.pick(this.scene, this.camera);
    this.composer
      ? this.composer.render()
      : this.renderer.render(this.scene, this.camera);
  }
}

const app = new App(document.getElementById("container"));

app.animate();

// 加载模型
loadModel("gpu.glb").then((glb) => {
  console.log(glb);
  const model = glb.scene;
  model.scale.set(2, 2, 2);
  model.position.x = 2;
  app.scene.add(model);

  // 根据模型生成边缘轮廓
  const meshs = [];
  const fanMeshs = [];
  const fanName = [
    "left_darker_Black_Plastic_001_0",
    "Plane_darker_Black_Plastic_001_0",
    "Plane044_darker_Black_Plastic_001_0",
    "left002_darker_Black_Plastic_001_0",
  ];
  model.traverse((item) => {
    if (item.isMesh) {
      fanName.includes(item.name) ? fanMeshs.push(item) : meshs.push(item);
    }
  });
  const sketchInfos = getSketchInfos(meshs);
  const _sketchInfos = getSketchInfos(fanMeshs);
  const sketch = createSketch(sketchInfos);
  const _sketch = createSketch(_sketchInfos, "lightgreen", 0.8);

  // app.scene.add(sketch);
  // app.scene.add(_sketch);

  // 旋转扇叶
  setInterval(() => {
    _sketch.children.forEach((item) => {
      item.rotation.z += 0.2;
    });
  }, 16);
});

// 加载背景贴图
loadTexture("background.png").then((texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  app.scene.background = texture;
});

// 添加光源
const ambientLight = new THREE.AmbientLight("#2f2f2f", 40);

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.set(1, 2, 5);

app.scene.add(directionalLight);
app.scene.add(ambientLight);
