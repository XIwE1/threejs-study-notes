import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

import {
  showToast,
  loadModel,
  loadTexture,
  getSketchInfos,
  createSketch,
  App
} from "./utils/index.js";



const app = new App(document.getElementById("container"));

app.animate();

// 加载模型
loadModel("gpu.glb").then((glb) => {
  const model = glb.scene;
  model.scale.set(2, 2, 2);
  model.position.x = 2;
  // app.scene.add(model);

  // 根据模型生成边缘轮廓
  const meshs = [];
  const fanMeshs = [];
  const fanName = [
    "left_darker_Black_Plastic_001_0",
    "Plane_darker_Black_Plastic_001_0",
    "Plane044_darker_Black_Plastic_001_0",
    "left002_darker_Black_Plastic_001_0",
  ];
  console.log(model);
  model.traverse((item) => {
    if (item.isMesh) {
      fanName.includes(item.name) ? fanMeshs.push(item) : meshs.push(item);
    }
  });

  const sketchInfos = getSketchInfos(meshs);
  const _sketchInfos = getSketchInfos(fanMeshs);
  const sketch = createSketch(sketchInfos);
  const _sketch = createSketch(_sketchInfos, "lightgreen", 0.8);

  app.scene.add(sketch);
  app.scene.add(_sketch);

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
