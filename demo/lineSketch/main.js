import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

import {
  loadModel,
  loadTexture,
  getSketchInfos,
  createSketch,
  App,
  Clip,
} from "./utils/index.js";

const app = new App(document.getElementById("container"));

app.animate();

let clipping;
let clipping2;
// 加载模型
loadModel("gpu.glb").then((glb) => {
  const model = glb.scene;
  model.scale.set(2, 2, 2);
  model.position.x = 2;
  app.scene.add(model);
  clipping = new Clip(app.scene, model, app.renderer);

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
  // app.scene.add(sketchGroup);

  // clipping2 = new Clip(app.scene, sketchGroup, app.renderer);
  // clipping2.invert();

  const box = new THREE.Box3().setFromObject(sketchGroup);
  const helper = new THREE.Box3Helper(box, 0xffff00);
  app.scene.add(helper);

  const helpers = new THREE.Group();
  helpers.add(new THREE.PlaneHelper(clipping.clipPlanes[0], 2, 0xff0000));
  helpers.visible = true;
  app.scene.add(helpers);

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
{
  const ambientLight = new THREE.AmbientLight("#2f2f2f", 40);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
  directionalLight.position.set(1, 2, 5);

  app.scene.add(directionalLight);
  app.scene.add(ambientLight);
}

// 设置剪裁动画
app.container.addEventListener("pointerdown", () => {
  clipping.cover();
  // clipping2.cover();
});
// 抬起播放恢复动画
app.container.addEventListener("pointerup", () => {
  clipping.restore();
  // clipping2.restore();
});
