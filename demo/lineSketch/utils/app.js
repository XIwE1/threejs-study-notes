import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { setupComposer, PickHelper } from "./index";

class App {
  scene = null;
  camera = null;
  renderer = null;
  controls = null;
  composer = null;
  picker = null;
  callbacks = [];

  // todo:接收scene、camera、renderer...而非自己生成
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

  addCallback(callback) {
    this.callbacks.push(callback);
  }
  removeCallback(callback) {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    // this.picker.pick(this.scene, this.camera);
    this.composer
      ? this.composer.render()
      : this.renderer.render(this.scene, this.camera);
    // this.renderer.render(this.scene, this.camera);
    this.callbacks.forEach((callback) => callback());
  }
}

export { App };
