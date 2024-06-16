import * as THREE from "../../node_modules/three/build/three.module.js";
import { OrbitControls } from "../../node_modules/three/examples/jsm/controls/OrbitControls.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { AxisGridHelper } from "./class_AxisGridHelper.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color("#000");

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 100, 0);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);
// camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// 创建坐标辅助器
// const axesHelper = new THREE.AxesHelper(5);
// axesHelper.scale.set(3, 3, 3);
// axesHelper.material.depthTest = false;
// axesHelper.renderOrder = 2;
// scene.add(axesHelper);

// 创建鼠标控制器
let controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener("change", function () {
  renderer.render(scene, camera); //执行渲染操作
});

// 创建GUI
const gui = new GUI();

// 添加光源
{
  const color = 0xffffff;
  const intensity = 500;
  const light = new THREE.PointLight(color, intensity);
  scene.add(light);
}

// 记录需要旋转的对象数组
const rotate_objects = [];

{
  // 创建通用的球体
  const radius = 1;
  const widthSegments = 6;
  const heightSegments = 6;
  const sphere_geometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments
  );
  // 创建代表太阳系的局部坐标系 , 仅用于坐标系 本身没有材质和几何体
  const solarSystem = new THREE.Object3D();
  scene.add(solarSystem);
  rotate_objects.push(solarSystem);

  // 模拟太阳的几何体
  const sun_material = new THREE.MeshPhongMaterial({
    emissive: 0xffff00,
  });
  const sun_mesh = new THREE.Mesh(sphere_geometry, sun_material);
  sun_mesh.scale.set(5, 5, 5);
  // scene.add(sun_mesh);
  solarSystem.add(sun_mesh);
  rotate_objects.push(sun_mesh);

  // 模拟地球的几何体
  const earth_material = new THREE.MeshPhongMaterial({
    color: 0x2233ff,
    emissive: 0x112244,
  });
  const earth_mesh = new THREE.Mesh(sphere_geometry, earth_material);
  // earth_mesh.position.x = 10;
  // scene.add(earth_mesh);
  // solarSystem.add(earth_mesh);
  rotate_objects.push(earth_mesh);
  // 将地球设置为太阳的子节点 但是这样scale.set会通用对地球生效
  // sun_mesh.add(earth_mesh);

  // 模拟地球的局部坐标系
  const earth_orbit = new THREE.Object3D();
  earth_orbit.position.x = 10;
  earth_orbit.add(earth_mesh);
  solarSystem.add(earth_orbit);
  rotate_objects.push(earth_orbit);

  // 模拟月球的几何体
  const moon_orbit = new THREE.Object3D();
  moon_orbit.position.x = 2;
  earth_orbit.add(moon_orbit);

  const moon_material = new THREE.MeshPhongMaterial({
    color: 0x888888,
    emissive: 0x222222,
  });
  const moon_mesh = new THREE.Mesh(sphere_geometry, moon_material);
  moon_mesh.scale.set(0.5, 0.5, 0.5);
  moon_orbit.add(moon_mesh);
  rotate_objects.push(moon_mesh);

  makeAxisGrid(solarSystem, "solarSystem", 25);
  makeAxisGrid(sun_mesh, "sun_mesh");
  makeAxisGrid(earth_orbit, "earth_orbit");
  makeAxisGrid(earth_mesh, "earth_mesh");
  makeAxisGrid(moon_orbit, "moon_orbit");
  makeAxisGrid(moon_mesh, "moon_mesh");
}

// 为每个旋转的节点添加坐标系
{
  rotate_objects.forEach((node) => {
    const axes = new THREE.AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 1;
    node.add(axes);
  });
}

function makeAxisGrid(node, label, units) {
  const helper = new AxisGridHelper(node, units);
  gui.add(helper, "visible").name(label);
}

document.body.appendChild(renderer.domElement);

window.onresize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
};

function animate() {
  controls.update();
  rotate_objects.forEach((obj) => {
    obj.rotation.y += 0.01;
  });
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
