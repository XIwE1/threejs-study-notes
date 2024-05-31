import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import {OrbitControls} from "../../node_modules/three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  25,
  window.innerWidth / window.innerHeight,
  1,
  500
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 50);
camera.lookAt(0, 0, 0);

//创建鼠标控制器    
let controls = new OrbitControls(camera, renderer.domElement );
//监听控制器，每次拖动后重新渲染画面
controls.addEventListener('change', function () {
    renderer.render(scene, camera); //执行渲染操作
});

document.body.appendChild(renderer.domElement);

var loader = new FontLoader();
loader.load("helvetiker_regular.typeface.json", function (font) {
  // 创建文本几何体
  var textGeometry = new TextGeometry("Hello, Three.js!", {
    font: font,
    size: 1,
    height: 0.5,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 5,
  });

  // 创建材质
  var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  // 创建文本网格
  var textMesh = new THREE.Mesh(textGeometry, material);
  scene.add(textMesh);

  // 渲染场景
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();
});
