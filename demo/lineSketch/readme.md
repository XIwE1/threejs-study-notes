## 根据 mesh 网格 创建 线型轮廓 LineSegments + EdgesGeometry

```js
import * as THREE from "three";

function getSketchInfos(meshs) {
  const sketchInfos = meshs.map((mesh) => {
    if (mesh.isMesh) {
      // 获取四元数
      const quaternion = new THREE.Quaternion();
      mesh.getWorldQuaternion(quaternion);
      // 获取世界坐标
      const worldPos = new THREE.Vector3();
      mesh.getWorldPosition(worldPos);
      // 获取缩放比例
      const worldScale = new THREE.Vector3();
      mesh.getWorldScale(worldScale);

      return {
        geometry: mesh.geometry,
        quaternion,
        worldPos,
        worldScale,
      };
    }
  });
  return sketchInfos;
}

function createLine(material) {
  return function (sketchInfo, angle = 1) {
    const { geometry, quaternion, worldPos, worldScale } = sketchInfo;
    const edges = new THREE.EdgesGeometry(geometry, angle);
    const line = new THREE.LineSegments(edges);
    line.material = material;
    line.quaternion.copy(quaternion);
    line.position.copy(worldPos);
    line.scale.copy(worldScale);
    return line;
  };
}

function createSketch(sketchInfos, color = "#0fb2fb", opacity = 1) {
  const material = new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
  });
  const createLineWithMaterial = createLine(material);

  const sketch = new THREE.Group();
  sketchInfos.forEach((sketchInfo) => {
    // 以模型顶点信息创建线条
    const line = createLineWithMaterial(sketchInfo);
    sketch.add(line);
  });
  return sketch;
}

export { getSketchInfos, createSketch };
```

## 封装后期处理

后续优化灵活性

```js
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

function setupComposer(scene, camera, renderer) {
  const renderPass = new RenderPass(scene, camera);
  const params = {
    threshold: 0.2,
    strength: 0.35,
    radius: 0,
  };
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight)
  );
  bloomPass.threshold = params.threshold;
  bloomPass.strength = params.strength;
  bloomPass.radius = params.radius;

  const outputPass = new OutputPass();

  const composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(bloomPass);
  composer.addPass(outputPass);

  return composer;
}

export { setupComposer };
```

## 根据鼠标指向拾取 mesh

```js
class PickHelper {
  constructor(canvas) {
    this.canvas = canvas;
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(scene, camera, time) {
    // 发出射线
    this.raycaster.setFromCamera(this.pickPosition, camera);
    // 获取与射线相交的对象
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // 找到第一个对象，它是离鼠标最近的对象
      this.pickedObject = intersectedObjects[0].object;

      this.pickedObjectSavedColor = getMaterialColor(material);

      setMaterialColor(material, (time * 8) % 2 > 1 ? 0xe0ffe0 : 0x90ee90);
    }
  }
}
```

removeFromParent 删除原有模型

TODOList:

1. done 支持高亮指定层级
2. done 支持获取到鼠标指向的模型
3. 在模型上添加精灵点
4. 点击精灵点移动摄像机聚焦，展示提示文字
5. 添加 gui
6. 线条的流转和渐变色
7. 添加模型参数描述
