import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const clock = new THREE.Clock();
const materials = {};
const darkenMaterial = new THREE.MeshBasicMaterial({ color: "black" });
const BLOOM_SCENE = 1;
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);

const sceneWidth = 100;
const sceneHeight = 80;
const scene = new THREE.Scene();
scene.background = new THREE.Color("black");

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  200
);
const personCamera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.5,
  130
);

camera.position.set(-7.6, 9.3, 40.3);
camera.lookAt(5, 2, 0);

// const cameraHelper = new THREE.CameraHelper(camera);
// const cameraHelper2 = new THREE.CameraHelper(personCamera);
let renderCamera = camera;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
// renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;

const controls = new OrbitControls(renderCamera, renderer.domElement);
controls.update();
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);
// scene.add(cameraHelper);
// scene.add(cameraHelper2);

// 云
const cloudPaths = [
  "cloud.glb",
  "cloud2.glb",
  "cloud3.glb",
  "cloud4.glb",
  "cloud5.glb",
  "cloud6.glb",
];

function showToast(message, top = 30, duration = 3000) {
  // 创建toast元素
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.top = top + "px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  toast.style.color = "white";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "3px";
  toast.style.zIndex = "1000";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.8s";
  document.body.appendChild(toast);
  return new Promise((resolve) => {
    setTimeout(() => {
      toast.style.opacity = "1";
    }, 10);
    setTimeout(() => {
      toast.style.opacity = "0";
      resolve(true);
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 800);
    }, duration);
  });
}

function curryShowToast(message) {
  const keys = new Set();
  let count = 0;
  return function (key) {
    if (keys.has(key)) return;
    key && keys.add(key);
    const top = 50 + count * 50;
    count++;
    showToast(message, top, 3000).then(() => {
      count--;
      keys.delete(key);
    });
  };
}

const showOutBorder = curryShowToast("前面的区域以后再来探索吧");
const showWelcome = curryShowToast("欢迎进入Minecraft");

function addProgress(progress = 0) {
  const element = document.getElementById("progress");
  const valueElement = document.getElementById("progress-value");
  return function (increment) {
    progress = Math.min(100, progress + increment);
    document.documentElement.style.setProperty("--progress-value", progress);
    element.setAttribute("value", progress);
    valueElement.innerText = `${progress}%`;
    if (progress === 100) {
      setTimeout(() => {
        document.body.appendChild(renderer.domElement);
        document.getElementById("menu").style.transform =
          "translate(-50%, 30%)";
        document.getElementById("loading").style.display = "none";
        setTimeout(() => {
          [...document.getElementsByClassName("btn")].forEach((btn) => {
            btn.style.opacity = 1;
            btn.style.transform = "translateY(0)";
          });
        }, 200);
      }, 800);
    }
    return progress;
  };
}
const incrementProgress = addProgress(0);

const loadModel = (path) =>
  new Promise((resolve) => {
    gltfLoader.load(path, function (glb) {
      const model = glb.scene;
      model.receiveShadow = true;
      model.castShadow = true;
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      resolve(glb);
    });
  }).finally(() => incrementProgress(10));

const modelsLoader = {
  houseLoader: () => loadModel("house-v1.glb"),
  wolfLoader: () => loadModel("wolf.glb"),
  foxLoader: () => loadModel("fox.glb"),
  benchLoader: () => loadModel("bench.glb"),
  customHouseLoader: () => loadModel("custom_house.glb"),
  blockLoader: () => loadModel("block.glb"),
  villageLoader: () => loadModel("village-v1.glb"),
  steveLoader: () => loadModel("steve.glb"),
  plantLoader: () =>
    Promise.all(
      ["tree.glb", "grass.glb", "flower.glb"].map((path) => loadModel(path))
    ),
  cloudLoader: () => Promise.all(cloudPaths.map((path) => loadModel(path))),
};
// let countModel = modelsLoader.;

// 增加 半球光
{
  const skyColor = "#a3cee9";
  const groundColor = 0x8e8e8e;
  // const skyColor = 0xb1e1ff;
  // const groundColor = 0xeeeeee;
  const intensity = 5;
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  scene.add(light);
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
  light.position.set(0, 55, 30);
  light.target.position.set(0, 0, 0);
  // const helper = new THREE.DirectionalLightHelper(light);
  // const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
  // scene.add(cameraHelper);
  scene.add(light);
  // scene.add(helper);
}

const gltfLoader = new GLTFLoader().setPath("./models/");

// 地面
const groundGroup = new THREE.Group();
const firstViewGroup = new THREE.Group();
const personGroup = new THREE.Group();
const sunGroup = new THREE.Group();

firstViewGroup.add(personGroup);
firstViewGroup.add(sunGroup);

let steve_model;
let modelControls = {};
let mixer;

groundGroup.add(firstViewGroup);
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
  modelsLoader.houseLoader().then((glb) => {
    const model = glb.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        child.renderOrder = 1;
        child.matrixWorldNeedsUpdate = true;
      }
    });
    model.position.set(25, 11.605, -10);
    model.scale.set(0.8, 0.8, 0.8);
    scene.add(model);
  });

  modelsLoader.wolfLoader().then((glb) => {
    const model = glb.scene;
    model.position.set(0, 0.4, 5);
    model.rotateY(Math.PI * 0.5);
    model.scale.set(0.05, 0.05, 0.05);
    groundGroup.add(model);
  });

  modelsLoader.foxLoader().then((glb) => {
    const model = glb.scene;
    model.position.set(5, 0.44, -5);
    model.rotateY(Math.PI * 0.5);
    model.scale.set(0.4, 0.4, 0.4);
    groundGroup.add(model);
  });

  modelsLoader.plantLoader().then((glbs) => {
    const tree_model = glbs[0].scene;
    const grass_model = glbs[1].scene;
    const flower_model = glbs[2].scene;
    tree_model.scale.set(8, 8, 8);
    grass_model.scale.set(0.7, 0.7, 0.7);
    // flower_model.scale.set(8, 8, 8);

    const tree_models = Array.from({ length: 14 }, () => tree_model.clone());
    const positions = [
      [0, -30],
      [10, -10],
      [40, -10],
      [38, 5],
      [25, -30],
      [22.5, 7.5],
      [20, 22.5],
      [35, 20],
      [-35, 20],
      [-25, -30],
      [-25, 10],
      [-12, -10],
      [-22, 25],
      [-38, 3],
    ];
    const get_random_number = () => ~~(Math.random() * 20 - 10);
    tree_models.forEach((model, index) => {
      const position = positions[index];
      model.position.set(position[0], -3.8, position[1]);
      groundGroup.add(model);

      const grass_models = Array.from({ length: 5 }, () => grass_model.clone());
      const flower_models = Array.from({ length: 2 }, () =>
        flower_model.clone()
      );
      grass_models.forEach((grass_model) =>
        grass_model.position.set(
          position[0] + get_random_number(),
          0,
          position[1] + get_random_number()
        )
      );
      grass_models.forEach((model) => groundGroup.add(model));
      flower_models.forEach((flower_model) =>
        flower_model.position.set(
          position[0] + get_random_number(),
          0,
          position[1] + get_random_number()
        )
      );
      flower_models.forEach((model) => groundGroup.add(model));
    });
  });

  modelsLoader.benchLoader().then((glb) => {
    const model = glb.scene;
    model.position.set(0, 0, -5);
    groundGroup.add(model);
  });

  modelsLoader.customHouseLoader().then((glb) => {
    const model = glb.scene;
    model.position.set(-30, 6.02, -10);
    model.scale.set(0.5, 0.505, 0.5);
    model.traverse((child) => {
      if (child.isMesh) {
        child.material.side = THREE.DoubleSide;
        child.material.depthWrite = true;
        child.material.depthTest = true;
      }
    });
    groundGroup.add(model);
  });

  modelsLoader.blockLoader().then((glb) => {
    const model = glb.scene;
    model.position.set(15, 2, 1);
    groundGroup.add(model);

    // // 获取模型的边界框
    // const box = new THREE.Box3().setFromObject(model);
    // const modelWidth = box.getSize(new THREE.Vector3()).x;
    // const modelHeight = box.getSize(new THREE.Vector3()).z;

    // // 计算在地面上需要放置多少个模型
    // const cols = Math.floor(groundWidth / modelWidth);
    // const rows = Math.floor(groundHeight / modelHeight);

    // for (let i = 0; i < cols; i++) {
    //   for (let j = 0; j < rows; j++) {
    //     const clone = model.clone();
    //     clone.position.set(i * modelWidth, -2, j * modelHeight);
    //     groundGroup.add(clone);
    //   }
    // }
  });

  modelsLoader.villageLoader().then((glb) => {
    const model = glb.scene;
    model.traverse((child) => {
      if (child.isMesh) {
        child.material.transparent = true;
      }
    });
    model.position.set(0, 8.01, 22);
    model.rotateY(Math.PI);
    model.renderOrder = 1;
    groundGroup.add(model);
  });

  modelsLoader.steveLoader().then((glb) => {
    const model = glb.scene;

    mixer = new THREE.AnimationMixer(model);
    const action = mixer.clipAction(glb.animations[0]);
    modelControls = {
      walk() {
        action.paused = false;
        action.play();
      },
      stop() {
        action.paused = true;
      },
    };

    steve_model = model;
    model.scale.set(0.002, 0.0018, 0.002);
    model.position.set(0, 1.18, 0);
    model.renderOrder = 1;
    model.name = "steve";
    model.matrixWorldNeedsUpdate = true;
    model.traverse((child) => {
      if (child.isMesh) {
        child.side = THREE.FrontSide;
      }
    });
    personGroup.add(model);

    {
      const sunRadius = 4;
      const sunSegments = 28;
      const sunTexture = new THREE.TextureLoader().load("./texture/sun.png");
      const sunGeoMetry = new THREE.CircleGeometry(sunRadius, sunSegments);
      // sunTexture.magFilter = THREE.NearestFilter;

      const sunMaterial = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        map: sunTexture,
        // transparent: true,
        // emissive: 0xffffff,
      });
      const sunMesh = new THREE.Mesh(sunGeoMetry, sunMaterial);
      sunMesh.name = "sun-material";

      sunGroup.add(sunMesh);
      sunGroup.position.set(0, 39.5, 20);
      sunGroup.rotateX(Math.PI * 0.5);
      sunMesh.layers.enable(BLOOM_SCENE);
    }

    // 瞄准的基准点
    const targetElevation = new THREE.Object3D();
    targetElevation.position.set(0, 2, 5);
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({
      color: "red",
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.visible = false;
    targetElevation.add(cube);
    targetElevation.name = "targetElevation";
    personGroup.add(targetElevation);

    personGroup.add(personCamera);
    personCamera.position.setY(1.9);
    personCamera.position.setZ(0.5);
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

// 后期处理
const skyWidth = sceneWidth;
const skyHeight = sceneHeight;
const params = {
  threshold: 0, // 辉光强度
  strength: 0.8, // 辉光阈值
  radius: 1, // 辉光半径
  exposure: 3,
};
const pixelationShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: {
      value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    pixelSize: { value: 10.0 }, // Adjust this value to control pixelation size
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float pixelSize;

    varying vec2 vUv;

    void main() {
      vec2 dxy = pixelSize / resolution;
      vec2 coord = dxy * floor(vUv / dxy);
      gl_FragColor = texture2D(tDiffuse, coord);
    }
  `,
};

let renderScene = new RenderPass(scene, renderCamera); // 创建一个渲染通道

// 创建辉光效果
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;
renderer.toneMappingExposure = Math.pow(params.exposure, 4.0);
// 创建马赛克效果
const pixelationPass = new ShaderPass(pixelationShader);
pixelationPass.needsSwap = true;

// 辉光合成器
const glowComposer = new EffectComposer(renderer);
glowComposer.renderToScreen = false;
glowComposer.addPass(renderScene);
glowComposer.addPass(bloomPass);
glowComposer.addPass(pixelationPass);

// 创建辉光效果
const mixPass = new ShaderPass(
  new THREE.ShaderMaterial({
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: glowComposer.renderTarget2.texture },
    },
    vertexShader: document.getElementById("vertexshader").textContent,
    fragmentShader: document.getElementById("fragmentshader").textContent,
    defines: {},
  }),
  "baseTexture"
);
mixPass.needsSwap = true;

const outputPass = new OutputPass();

// 场景渲染器
const finalComposer = new EffectComposer(renderer); // 创建效果组合器
finalComposer.addPass(renderScene);
finalComposer.addPass(mixPass);
finalComposer.addPass(outputPass);

finalComposer.setSize(window.innerWidth, window.innerHeight);
glowComposer.setSize(window.innerWidth, window.innerHeight);

{
  {
    modelsLoader.cloudLoader().then((glbs) => {
      Array(4)
        .fill(glbs)
        .flat()
        .map((glb) => glb.scene)
        .forEach((model) => {
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              child.material = new THREE.MeshPhysicalMaterial({
                // color: 'rgb(217,229,253)',
                // transparent: true,
                // opacity: 0.9,
                // depthWrite: false,
                // depthTest: true,
                metalness: 0.0, //玻璃非金属
                roughness: 0.1, //玻璃表面光滑
                transmission: 0.45,
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
          // model.receiveShadow = true;
          cloudGroup.add(_model);
          cloudGroup.add(model);
        });
    });
  }
}

// 天空盒
{
  const skyBoxGeoMetry = new THREE.BoxGeometry(100, 80, 80);
  const skyBoxMaterial = new THREE.MeshBasicMaterial({
    color: "rgb(141,174,252)",
    side: THREE.BackSide,
  });
  const skyBoxMesh = new THREE.Mesh(skyBoxGeoMetry, skyBoxMaterial);
  skyBoxMesh.rotateX(Math.PI * -0.5);
  scene.add(skyBoxMesh);
}

// 创建GUI
const gui = new GUI();
const options = {
  renderType: "third",
};
gui
  .add(options, "renderType", ["first", "third"])
  .name("游戏视角")
  .onChange(changeRolePerspective);

// 放入模型
scene.add(groundGroup);
scene.add(skyGroup);

const changeComposerCamera = (camera) => {
  if (!camera || !finalComposer || !glowComposer) return;
  glowComposer.removePass(renderScene);
  finalComposer.removePass(renderScene);
  renderScene = new RenderPass(scene, camera);
  glowComposer.insertPass(renderScene, 0);
  finalComposer.insertPass(renderScene, 0);
};
function changeRolePerspective(type) {
  const cameraMap = {
    first: personCamera,
    third: camera,
  };
  const targetCamera = cameraMap[type];
  if (!targetCamera) return;
  renderCamera = targetCamera;
  changeComposerCamera(renderCamera);

  controls.enabled = renderCamera === camera;
  personGroup.rotation.y = 0;
  personGroup.rotation.x = 0;
  steve_model.visible = renderCamera === personCamera;
}
// 定义缓动函数
function bezier(t) {
  return t > 1 ? 0 : 4 * t * (1 - t);
}

const jump = (function () {
  let isJumping = false;
  return () => {
    if (isJumping) return;
    isJumping = true;
    const startTime = Date.now();
    const jumping = () =>
      requestAnimationFrame(() => {
        const t = (Date.now() - startTime) / 800;
        const progress = bezier(t);
        personGroup.position.y = 2 * progress;
        if (t > 1) {
          personGroup.position.y = 0;
          isJumping = false;
          return;
        }
        requestAnimationFrame(jumping);
      });
    jumping();
  };
})();

let lastMouseX = window.innerWidth / 2;
// 监听鼠标移动事件 控制人物朝向和视角
document.addEventListener("mousemove", (event) => {
  if (renderCamera !== personCamera) return;
  const { clientX: mouseX, clientY: mouseY } = event; // 当前鼠标位置
  // 控制左右旋转
  const mouse_x_diff = lastMouseX - mouseX;
  const isLeftSide = !mouse_x_diff && lastMouseX === 0;
  const isRightSide = !mouse_x_diff && lastMouseX >= window.innerWidth - 5;
  const value =
    isLeftSide * 0.012 +
    isRightSide * -0.012 +
    (lastMouseX - mouseX) / window.innerWidth;

  const y_rotationAngle = value * 2 * Math.PI;
  personGroup.rotation.y += y_rotationAngle;

  // 控制上下旋转
  const x_rotationAngle =
    ((window.innerHeight / 2 - mouseY) / window.innerHeight) * 1.3 * -Math.PI;
  const x_format_rotationAngle = Math.min(
    Math.max(x_rotationAngle, Math.PI / -2),
    Math.PI / 3
  );
  personCamera.rotation.x = x_format_rotationAngle - Math.PI;

  lastMouseX = mouseX;
});

document.addEventListener("keydown", (event) => {
  keyStates[event.key] = true;
  if (event.key === " ") jump();
});

document.addEventListener("keyup", (event) => {
  keyStates[event.key] = false;
});

// 定义移动速度
const baseMoveSpeed = 0.15;
let moveSpeed = baseMoveSpeed;
const baseCloudSpeed = 0.012;
let cloudSpeed = baseCloudSpeed;

// 键盘状态
const keyStates = {
  w: false,
  s: false,
  a: false,
  d: false,
  q: false,
  e: false,
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};
const moveCloudGroup = () => {
  const clouds = cloudGroup.children;
  clouds.forEach((cloud) => {
    cloud.position.z += cloudSpeed;
    if (cloud.position.z > skyHeight / 2) {
      cloud.position.z = -skyHeight / 2;
      cloud.rotateY(Math.PI / 2);
    }
  });
};
const computedMoveDistance = (speed, states, angle) => {
  const sin = Math.sin(angle);
  const cos = Math.cos(angle);
  const forward =
    (states["w"] || states["ArrowUp"]) - (states["s"] || states["ArrowDown"]);
  const right =
    (states["d"] || states["ArrowRight"]) -
    (states["a"] || states["ArrowLeft"]);
  const x_distance = speed * (sin * forward - cos * right);
  const z_distance = speed * (sin * right + cos * forward);
  return [x_distance, z_distance];
};
const maxBorderHeight = sceneHeight / 2 - 2;
const maxBorderWidth = sceneWidth / 2 - 2;
const validateBorder = () => {
  const { x, z } = firstViewGroup.position;
  const isOut =
    x > maxBorderWidth ||
    x < -maxBorderWidth ||
    z > maxBorderHeight ||
    z < -maxBorderHeight;
  if (!isOut) return;
  firstViewGroup.position.x = 0;
  firstViewGroup.position.z = 0;
  showOutBorder("out");
};

const moveFirstViewGroup = () => {
  const y_rotationAngle = personGroup.rotation.y;
  const [x_distance, z_distance] = computedMoveDistance(
    moveSpeed,
    keyStates,
    y_rotationAngle
  );
  if (x_distance || z_distance) modelControls.walk();
  else return modelControls.stop && modelControls.stop();
  firstViewGroup.position.x += x_distance;
  firstViewGroup.position.z += z_distance;
  validateBorder();
};
const rotatePerson = () => {
  const y_rotationAngle =
    (keyStates["q"] - keyStates["e"]) * 0.003 * 2 * Math.PI;
  personGroup.rotation.y += y_rotationAngle;
};
const refreshSpeed = (fps) => {
  moveSpeed = baseMoveSpeed * (60 / fps);
  cloudSpeed = baseCloudSpeed * (60 / fps);
};

animate();

function animate(lastTime = 0) {
  const curTime = Date.now();
  const fps = ~~(1000 / (curTime - lastTime)) || 60;

  requestAnimationFrame(() => animate(curTime));

  // 根据键盘状态移动物体
  rotatePerson();
  refreshSpeed(fps);
  moveFirstViewGroup();
  moveCloudGroup();
  controls.update();

  scene.traverse(darkenNonBloomed);
  glowComposer.render();

  scene.traverse(restoreMaterial);
  finalComposer.render();

  const delta = clock.getDelta();
  mixer && mixer.update(delta);
  // renderer.render(scene, renderCamera);
}

window.onresize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  personCamera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
  personCamera.updateProjectionMatrix();
};

function darkenNonBloomed(obj) {
  if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
    materials[obj.uuid] = obj.material;
    obj.material = darkenMaterial;
  }
}

function restoreMaterial(obj) {
  if (materials[obj.uuid]) {
    obj.material = materials[obj.uuid];
    delete materials[obj.uuid];
  }
}

function startGame() {
  document.getElementById("menu").style.pointerEvents = "none";
  document.getElementById("menu").style.transform = "translate(-50%, -100%)";
  setTimeout(() => {
    document.getElementById("menu").style.display = "none";
    document.getElementById("ui").style.display = "flex";
  }, 800);
  document.body.style.filter = "blur(10px)";
  setTimeout(() => {
    document.body.style.filter = "blur(0px)";
    changeRolePerspective("first");
    showWelcome();
  }, 800);
}
document.getElementById("start").addEventListener("click", startGame);
