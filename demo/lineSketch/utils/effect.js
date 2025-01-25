import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

function setupComposer(scene, camera, renderer) {
  // 创建渲染通道
  const renderPass = new RenderPass(scene, camera);
  const params = {
    threshold: 0.2,
    strength: 0.35,
    radius: 0,
  };
  // 创建辉光通道
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight)
  );
  bloomPass.threshold = params.threshold;
  bloomPass.strength = params.strength;
  bloomPass.radius = params.radius;
  // 创建输出通道
  const outputPass = new OutputPass();
  // 创建合成器，组合通道
  const composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);

  return composer;
}

export { setupComposer };
