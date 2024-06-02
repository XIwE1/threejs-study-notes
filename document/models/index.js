import * as THREE from "../../node_modules/three/build/three.module.js";
import { OrbitControls } from "../../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color("#eee");

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 10);
camera.lookAt(0, 0, 0);
// camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

//创建鼠标控制器
let controls = new OrbitControls(camera, renderer.domElement);
//监听控制器，每次拖动后重新渲染画面
controls.addEventListener("change", function () {
  renderer.render(scene, camera); //执行渲染操作
});

const loader = new GLTFLoader();
loader.load(
  "./public/scene.gltf",
  function (gltf) {
    // scene.add(gltf.scene);
    console.log("gltf", gltf);
    let model = gltf.scene;
    // 添加以下代码
    // 遍历模型
    model.traverse((child, index) => {
      if (!child.isMesh) return;
      // 将图片作为纹理加载hair.texture_emissive
      console.log("index", index);
      console.log("images", gltf.parser.json.images);
      console.log("materials", gltf.parser.json.materials);
      let imgTexture = new THREE.TextureLoader().load(
        "./public/textures/hair.texture_emissive.png"
      );
      // 调整纹理图的方向
      imgTexture.flipY = false;
      // 将纹理图生成材质
      const material = new THREE.MeshBasicMaterial({
        map: imgTexture,
      });
      child.material = material;
    });

    scene.add(model);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

document.body.appendChild(renderer.domElement);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
