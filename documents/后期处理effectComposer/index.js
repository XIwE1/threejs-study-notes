import * as THREE from "three";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

function init() {
  // 1【渲染开始】创建了一个RenderPass对象，用于将场景渲染到纹理上。
  const renderScene = new RenderPass(scene, camera);

  // 2【需要合成的中间特效】创建了一个UnrealBloomPass对象，用于实现辉光效果。≈
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  // 【特效设置】设置发光参数,阈值、强度和半径。
  bloomPass.threshold = params.threshold;
  bloomPass.strength = params.strength;
  bloomPass.radius = params.radius;

  // 3【效果输出】创建了一个OutputPass对象，用于将最终渲染结果输出到屏幕上。
  const outputPass = new OutputPass();

  // 4【特效合并】创建了一个EffectComposer对象，并将RenderPass、UnrealBloomPass和OutputPass添加到渲染通道中。
  composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);
}

function animate() {
  requestAnimationFrame(animate);
  // 5【渲染特效】通过调用 render 方法，将场景渲染到屏幕上。
  composer.render();
}
