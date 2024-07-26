import * as THREE from "../../node_modules/three/build/three.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

const sceneWidth = 80;
const sceneHeight = 60;
const scene = new THREE.Scene();
scene.background = new THREE.Color("black");

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const personCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.5,
  120
);
camera.position.set(0, 38, 20);
camera.lookAt(0, 0, 0);
const cameraHelper = new THREE.CameraHelper(camera);
const cameraHelper2 = new THREE.CameraHelper(personCamera);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
scene.add(cameraHelper);
scene.add(cameraHelper2);

document.body.appendChild(renderer.domElement);

const cubes = [];

{
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshPhysicalMaterial({
    // color: 0x00ffff,
    // transparent: true,
    // opacity: 0.5,
    // // depthWrite: false,
    // depthTest: true,
    // transmission: 0.8,
    // reflectivity: 0.5,
    transparent: true,
    // opacity: 0.5,
    transmission: 1, // 透光效果
    roughness: 0.8,
    depthWrite: false, // 关闭深度写入以获得更好的透明效果
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  mesh.position.set(0, 25, 10);
  mesh.needsUpdate = true;
  cubes.push(mesh);
  scene.add(mesh);
}
// 增加半球光
{
  const skyColor = 0xb1e1ff; // light blue
  const groundColor = 0x000000; // brownish orange
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

// 方向光 模拟太阳
{
  const color = 0xffffff;
  const intensity = 10;
  const light = new THREE.DirectionalLight(color, intensity);
  light.castShadow = true;
  light.shadow.camera.left = sceneWidth / -2;
  light.shadow.camera.right = sceneWidth / 2;
  light.shadow.camera.top = sceneHeight / -1;
  light.shadow.camera.bottom = sceneHeight / 1;
  light.shadow.camera.far = 90;
  light.position.set(0, 60, 15);
  light.target.position.set(0, 0, 0);
  const helper = new THREE.DirectionalLightHelper(light);
  const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
  scene.add(cameraHelper);
  scene.add(light);
  scene.add(helper);
}

// https://juejin.cn/post/7265322117771624509
const gltfLoader = new GLTFLoader().setPath("./models/");

// 地面
const groundGroup = new THREE.Group();
const personGroup = new THREE.Group();
groundGroup.add(personGroup);
{
  // 生成地板
  const groundWidth = sceneWidth;
  const groundHeight = sceneHeight;

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
        child.castShadow = true;
        child.renderOrder = 1;
        child.matrixWorldNeedsUpdate = true;
        child.material.reflectivity = 1;
        // console.log("child", child);
        // child.receiveShadow = true;
        // child.material.flatShading = true;
        // child.material.wireframe = true;
        // child.material.roughness = 0.5;
        child.material.metalness = 0.5;
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
    model.position.set(0, 0.5, 15);
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
  // gltfLoader.load("custom_house.glb", function (glb) {
  //   const model = glb.scene;
  //   model.position.set(22, 6.02, 10);
  //   model.rotateY(Math.PI * 0.5);
  //   model.scale.set(0.5, 0.5, 0.5);
  //   model.receiveShadow = true;
  //   model.castShadow = true;
  //   model.traverse((child) => {
  //     if (child.isMesh) {
  //       child.castShadow = true;
  //       child.material.side = THREE.DoubleSide;
  //       child.material.depthWrite = true;
  //       child.material.depthTest = true;
  //     }
  //   });
  //   groundGroup.add(model);
  // });
  gltfLoader.load("block.glb", function (glb) {
    const model = glb.scene;
    model.position.set(15, 0, 1);
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
        child.material.reflectivity = 1;
        // child.receiveShadow = true;
      }
    });
    model.position.set(-22, 8.01, 0);
    model.receiveShadow = true;
    model.castShadow = true;
    model.renderOrder = 1;
    groundGroup.add(model);
  });
  gltfLoader.load("steve.glb", function (glb) {
    const model = glb.scene;
    model.scale.set(0.002, 0.002, 0.002);
    model.position.set(0, 1.18, 0);
    model.receiveShadow = true;
    model.castShadow = true;
    model.renderOrder = 1;
    model.name = "steve";
    model.matrixWorldNeedsUpdate = true;
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.side = THREE.DoubleSide;
      }
    });
    personGroup.add(model);

    // 瞄准的基准点
    const targetElevation = new THREE.Object3D();
    targetElevation.position.set(0, 2, 5);
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({
      color: "red",
    });
    const cube = new THREE.Mesh(geometry, material);
    targetElevation.add(cube);
    targetElevation.name = "targetElevation";
    personGroup.add(targetElevation);

    personGroup.add(personCamera);
    personCamera.position.setY(2);
    personCamera.lookAt(cube.getWorldPosition(new THREE.Vector3()));
    personCamera.updateMatrixWorld();
    personCamera.name = "personCamera";
  });
}

// 天空
const skyGroup = new THREE.Group();
skyGroup.position.set(0, 40, 0);

const cloudGroup = new THREE.Group();
skyGroup.add(cloudGroup);

const skyWidth = 2 * sceneWidth;
const skyHeight = 2 * sceneHeight;
{
  //

  const skyGeometry = new THREE.PlaneGeometry(skyWidth, skyHeight);
  const skyMaterial = new THREE.MeshBasicMaterial({
    color: "rgb(141,174,252)",
    side: THREE.DoubleSide,
  });
  const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
  skyMesh.rotateX(Math.PI * -0.5);
  skyGroup.add(skyMesh);

  //太阳
  {
    const sunSize = 5;
    const sunColor = 0xffffff;
    const sunGeoMetry = new THREE.PlaneGeometry(sunSize, sunSize);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: sunColor,
      side: THREE.DoubleSide,
    });
    const sunMesh = new THREE.Mesh(sunGeoMetry, sunMaterial);
    sunMesh.position.set(0, -0.1, 10);
    sunMesh.rotateX(Math.PI * -0.5);
    skyGroup.add(sunMesh);
  }
  // 云
  const cloudPaths = [
    "cloud.glb",
    "cloud2.glb",
    "cloud3.glb",
    "cloud4.glb",
    "cloud5.glb",
    "cloud6.glb",
  ];
  const loadModel = (path) =>
    new Promise((resolve) => {
      gltfLoader.load(path, function (glb) {
        const model = glb.scene;
        resolve(model);
      });
    });
  {
    let allModels = cloudPaths.map((path) => loadModel(path));
    allModels = [...allModels, ...allModels, ...allModels, ...allModels];
    Promise.all(allModels).then((models) => {
      models.forEach((model) => {
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material = new THREE.MeshPhysicalMaterial({
              // color: 'rgb(217,229,253)',
              // transparent: true,
              // opacity: 0.8,
              // depthWrite: false,
              // depthTest: true,
              // metalness: 0.0, //玻璃非金属
              // roughness: 0.0, //玻璃表面光滑d
              transmission: 0.6,
            });
          }
        });
        const _model = model.clone();
        _model.position.set(
          Math.random() * skyWidth - skyWidth / 2,
          -1.18,
          Math.random() * skyHeight - skyHeight / 2
        );
        model.position.set(
          Math.random() * skyWidth - skyWidth / 2,
          -1.18,
          Math.random() * skyHeight - skyHeight / 2
        );
        _model.rotateY(Math.PI * 0.5);
        model.castShadow = true;
        model.receiveShadow = true;
        cloudGroup.add(_model);
        cloudGroup.add(model);
      });
    });
  }
}

let renderCamera = camera;

// 创建GUI
const gui = new GUI();
const options = {
  renderType: "third",
};
gui
  .add(options, "renderType", ["first", "third"])
  .name("切换视角")
  .onChange((val) => {
    if (val === "first") {
      renderCamera = personCamera;
      controls.enabled = false;
      personGroup.rotation.y = 0;
      personGroup.rotation.x = 0;
    } else if (val === "third") {
      renderCamera = camera;
      controls.enabled = true;
      personGroup.rotation.y = 0;
      personGroup.rotation.x = 0;
    }
    const cameraMap = {
      first: personCamera,
      third: camera,
    };
    renderCamera = cameraMap[val];
  });

// 放入模型
scene.add(groundGroup);
scene.add(skyGroup);

// 定义移动速度
const moveSpeed = 0.1;

// 键盘状态
const keyStates = {
  w: false,
  s: false,
  a: false,
  d: false,
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

// 监听键盘事件
document.addEventListener("keydown", (event) => {
  keyStates[event.key] = true;
});

document.addEventListener("keyup", (event) => {
  keyStates[event.key] = false;
});

let lastMouseX = window.innerWidth / 2;
// 监听鼠标移动事件
document.addEventListener("mousemove", (event) => {
  const { clientX: mouseX, clientY: mouseY } = event; // 当前鼠标位置
  const y_rotationAngle =
    ((lastMouseX - mouseX) / window.innerWidth) * 3 * Math.PI;
  personGroup.rotation.y += y_rotationAngle;

  const x_rotationAngle =
    ((window.innerHeight / 2 - mouseY) / window.innerHeight) * 1.3 * -Math.PI;
  const x_format_rotationAngle = Math.min(
    Math.max(x_rotationAngle, Math.PI / -2),
    Math.PI / 6
  );
  personCamera.rotation.x = x_format_rotationAngle - Math.PI;

  lastMouseX = mouseX;
});

const moveCloudGroup = () => {
  const clouds = cloudGroup.children;
  clouds.forEach((cloud) => {
    cloud.position.z += 0.012;
    if (cloud.position.z > skyHeight / 2) {
      cloud.position.z = -skyHeight / 2;
      cloud.rotateY(Math.PI / 2);
    }
  });
};

function animate() {
  requestAnimationFrame(animate);
  const y_rotationAngle = personGroup.rotation.y;
  const sinMoveSpeed = Math.sin(y_rotationAngle);
  const cosMoveSpeed = Math.cos(y_rotationAngle);
  // 根据键盘状态移动物体
  if (keyStates["w"] || keyStates["ArrowUp"]) {
    personGroup.position.z += moveSpeed * cosMoveSpeed;
    personGroup.position.x += moveSpeed * sinMoveSpeed;
  }
  if (keyStates["s"] || keyStates["ArrowDown"]) {
    personGroup.position.z -= moveSpeed * cosMoveSpeed;
    personGroup.position.x -= moveSpeed * sinMoveSpeed;
  }
  if (keyStates["a"] || keyStates["ArrowLeft"]) {
    personGroup.position.z -= moveSpeed * sinMoveSpeed;
    personGroup.position.x += moveSpeed * cosMoveSpeed;
  }
  if (keyStates["d"] || keyStates["ArrowRight"]) {
    personGroup.position.z += moveSpeed * sinMoveSpeed;
    personGroup.position.x -= moveSpeed * cosMoveSpeed;
  }
  moveCloudGroup();
  renderer.render(scene, renderCamera);
}

animate();
