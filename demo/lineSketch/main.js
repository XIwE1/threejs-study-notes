import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/addons/renderers/CSS2DRenderer.js";
import { showToast, loadModel, loadTexture } from "./utils/index.js";

class App {
  scene = null;
  camera = null;
  renderer = null;
  controls = null;

  constructor(container) {
    this.container = container;
    console.log("container", container);

    container && this.init();
  }

  init() {
    // 初始化场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#212121");

    // 初始化相机
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.container,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer;
    this.controls = new OrbitControls(this.camera, this.container);

    window.addEventListener("resize", this.onResize.bind(this));
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

const app = new App(document.getElementById("container"));

app.animate();

// 在场景中添加物体
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
console.log(cube);

loadModel("gpu.glb").then((glb) => {
  const model = glb.scene;
  app.scene.add(model);
});

loadTexture("background.png").then((texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  app.scene.background = texture;
});

app.scene.add(cube);
