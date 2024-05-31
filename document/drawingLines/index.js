import * as THREE from "../../node_modules/three/build/three.module.js";
import {OrbitControls} from "../../node_modules/three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  500
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// 摆设相机位置，设置视点方向
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);

//创建鼠标控制器    
let controls = new OrbitControls(camera, renderer.domElement );
//监听控制器，每次拖动后重新渲染画面
controls.addEventListener('change', function () {
    renderer.render(scene, camera); //执行渲染操作
});

const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
// 创建带有顶点的几何体
const points = [];
points.push(new THREE.Vector3(-10, 0, 0));
points.push(new THREE.Vector3(0, 10, 0));
points.push(new THREE.Vector3(10, 0, 0));
const geometry = new THREE.BufferGeometry().setFromPoints(points);

const line = new THREE.Line(geometry, material);

scene.add(line);

document.body.appendChild(renderer.domElement);

renderer.render(scene, camera);
