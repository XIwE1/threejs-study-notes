import * as THREE from "../../node_modules/three/build/three.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color("black");

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 8, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;

const controls = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

document.body.appendChild(renderer.domElement);

const cubes = [];

{
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshPhongMaterial({ color: "lightblue" });
  const mesh = new THREE.Mesh(geometry, material);
  cubes.push(mesh);
  //   scene.add(mesh);
}
{
  const skyColor = 0xb1e1ff; // light blue
  const groundColor = 0xb97a20; // brownish orange
  const intensity = 10;
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  scene.add(light);
}
function makePointLight(color, intensity, position, castShadow, container) {
  const light = new THREE.PointLight(color, intensity);
  light.castShadow = castShadow;
  light.position.set(position[0], position[1], position[2]);
  const helper = new THREE.PointLightHelper(light);
  container.add(light);
  container.add(helper);
}

makePointLight(0xffffff, 10000, [0, 30, 15], true, scene);

// https://juejin.cn/post/7265322117771624509
const gltfLoader = new GLTFLoader().setPath("./models/");
// 地面
const groundGroup = new THREE.Group();
// {
//   const color = 0xffffff;
//   const intensity = 10000;
//   const light = new THREE.PointLight(color, intensity);
//   light.castShadow = true;
//   light.position.set(-15, -20, 0);

//   const helper = new THREE.PointLightHelper(light);

//     groundGroup.add(light);
//     groundGroup.add(helper);
// }
{
  // 生成地板
  const groundWidth = 80;
  const groundHeight = 60;

  const roundTexture = new THREE.TextureLoader().load("./texture/floor2.png");
  roundTexture.wrapS = THREE.RepeatWrapping;
  roundTexture.wrapT = THREE.RepeatWrapping;
  roundTexture.magFilter = THREE.NearestFilter;
  roundTexture.colorSpace = THREE.SRGBColorSpace;
  roundTexture.repeat.set(groundWidth / 2, groundHeight / 2);

  const roundGeometry = new THREE.PlaneGeometry(groundWidth, groundHeight);
  const roundMaterial = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    map: roundTexture,
  });
  const roundMesh = new THREE.Mesh(roundGeometry, roundMaterial);
  roundMesh.receiveShadow = true;
  roundMesh.rotateX(Math.PI * -0.5);
  groundGroup.add(roundMesh);
  // 放入模型
  gltfLoader.load("house.glb", function (glb) {
    console.log("glb", glb);
    const model = glb.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        console.log("child.material.map", child.material.map);

        child.castShadow = true;
        child.renderOrder = 1;
        child.matrixWorldNeedsUpdate = true;
        // console.log("child", child);
        // child.receiveShadow = true;
        // child.material.flatShading = true;
        // child.material.wireframe = true;
        // child.material.roughness = 0.5;
        // child.material.metalness = 0.5;
        // child.material.emissive = 'green';
        // child.material.alphaHash = true;
        // child.material.alphaTest = 0.5;
        // child.material.side = THREE.DoubleSide;
        // child.material.transparent = true;
        // child.material.needsUpdate = true;
      }
    });
    model.position.set(15, 12.5, -10);
    model.scale.set(0.8, 0.8, 0.8);
    model.receiveShadow = true;
    model.castShadow = true;
    scene.add(model);
  });
  gltfLoader.load("wolf.glb", function (glb) {
    const model = glb.scene;
    model.position.set(5, 0.5, 15);
    model.rotateY(Math.PI * 0.5);
    model.scale.set(0.05, 0.05, 0.05);
    model.receiveShadow = true;
    model.castShadow = true;
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });
    groundGroup.add(model);
  });
  gltfLoader.load("grass.glb", function (glb) {
    const model = glb.scene;
    model.position.set(5, 1, 10);
    model.receiveShadow = true;
    model.castShadow = true;
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });
    groundGroup.add(model);
  });
  gltfLoader.load("flower.glb", function (glb) {
    const model = glb.scene;
    model.position.set(10, 0, 10);
    model.rotateY(Math.PI * 0.5);
    model.receiveShadow = true;
    model.castShadow = true;
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });
    groundGroup.add(model);
  });
  gltfLoader.load("bench.glb", function (glb) {
    const model = glb.scene;
    model.position.set(0, 0, -5);
    model.receiveShadow = true;
    model.castShadow = true;
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });
    groundGroup.add(model);
  });
  gltfLoader.load("custom_house.glb", function (glb) {
    const model = glb.scene;
    model.position.set(22, 6.02, 10);
    model.rotateY(Math.PI * 0.5);
    model.scale.set(0.5, 0.5, 0.5);
    model.receiveShadow = true;
    model.castShadow = true;
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.material.side = THREE.DoubleSide;
      }
    });
    groundGroup.add(model);
  });
  gltfLoader.load("block.glb", function (glb) {
    const model = glb.scene;
    model.position.set(5, 0, 1);
    model.receiveShadow = true;
    model.castShadow = true;
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
      }
    });
    groundGroup.add(model);
  });
  gltfLoader.load("village.glb", function (glb) {
    const model = glb.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        // child.receiveShadow = true;
      }
    });
    // model.rotateX(Math.PI * 0.5);
    model.position.set(-22, 8.01, 0);
    model.receiveShadow = true;
    model.castShadow = true;
    model.renderOrder = 1;
    groundGroup.add(model);
  });
  gltfLoader.load("steve.glb", function (glb) {
    const model = glb.scene;
    model.position.set(0, 1.18, 1.18);
    // model.rotateX(Math.PI * 0.5);
    model.scale.set(0.002, 0.002, 0.002);
    model.receiveShadow = true;
    model.castShadow = true;
    model.renderOrder = 1;
    model.matrixWorldNeedsUpdate = true;
    groundGroup.add(model);
  });
}

// groundGroup.rotation.x = Math.PI * -0.5;

scene.add(groundGroup);

function animate() {
  requestAnimationFrame(animate);
  //   {
  //     cubes.forEach((cube) => {
  //       cube.rotation.x += 0.01;
  //       cube.rotation.y += 0.01;
  //     });
  //   }
  renderer.render(scene, camera);
}

animate();
