import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

import {
  showToast,
  loadModel,
  loadTexture,
  getSketchInfos,
  createSketch,
  App,
  Clip,
  throttle,
} from "./utils/index.js";

const app = new App(document.getElementById("container"));

app.animate();

let clipping;
// 加载模型
loadModel("gpu.glb").then((glb) => {
  const model = glb.scene;
  model.scale.set(2, 2, 2);
  model.position.x = 2;
  // app.scene.add(model);
  // clipping = new Clip(model, app.renderer);

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

  const sketchGroup = new THREE.Group();
  sketchGroup.add(sketch);
  sketchGroup.add(_sketch);
  app.scene.add(sketchGroup);
  clipping = new Clip(sketchGroup, app.renderer);

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

// 设置剪裁动画
app.container.addEventListener("pointerdown", () => {
  clipping.cover();
});
// 抬起播放恢复动画
app.container.addEventListener("pointerup", () => {
  clipping.restore();
});
