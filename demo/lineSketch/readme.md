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

## clipping 效果

平面（Plane）https://threejs.org/docs/index.html?q=plane#api/zh/math/Plane ,在三维空间中无限延伸的二维平面

Plane( normal : Vector3, constant : Float )
normal - (可选参数) 定义单位长度的平面法向量 Vector3。默认值为 (1, 0, 0)。
constant - (可选参数) 从原点到平面的有符号距离。 默认值为 0.

增加 helper

```js
// helpers
const helpers = new THREE.Group();
helpers.add(new THREE.PlaneHelper(clipPlanes[0], 2, 0xff0000));
helpers.add(new THREE.PlaneHelper(clipPlanes[1], 2, 0x00ff00));
helpers.add(new THREE.PlaneHelper(clipPlanes[2], 2, 0x0000ff));
helpers.visible = false;
scene.add(helpers);
```

```js
this.renderer.localClippingEnabled = true;

const plane = new THREE.Plane(new THREE.Vector3(2, 0, 0), x_range[1]);
this.clipPlanes.push(plane);

const material = new THREE.MeshPhongMaterial({
  color: new THREE.Color().setHSL(
    Math.random(),
    0.5,
    0.5,
    THREE.SRGBColorSpace
  ),
  side: THREE.DoubleSide,
  clippingPlanes: this.clipPlanes, // 指定材质的剪裁面，如果是模型material需要traverse迭代
  clipIntersection: params.clipIntersection,
  alphaToCoverage: true,
});
// 获取模型边界 用于灵活设置constant
function computedRange(model) {
  const box = new THREE.Box3().setFromObject(model);
  const max = box.max;
  const min = box.min;

  return [min.x, max.x];
}
```

`.clipIntersection` 更改剪裁平面的行为，以便仅剪切其交叉点，而不是它们的并集

`.clippingPlanes` 用户定义的剪裁平面，在世界空间中指定为 THREE.Plane 对象。这些平面适用于所有使用此材质的对象

`clipPlanes[ j ].constant = value;` 修改剪裁平台

示例：

https://threejs.org/examples/#webgl_clipping_intersection

removeFromParent 删除原有模型

TODOList:

1. done 支持高亮指定层级
2. done 支持获取到鼠标指向的模型
3. 在模型上添加精灵点
4. 点击精灵点移动摄像机聚焦，展示提示文字
5. 添加 gui
6. 线条的流转和渐变色
7. 添加模型参数描述
8. edge 线条更加明亮

`updateMatrixWorld`非常重要，位移 旋转 缩放后一定得调用一次
.applyMatrix4 ( matrix : Matrix4 ) : undefined
对当前物体应用这个变换矩阵，并更新物体的位置、旋转和缩放。

## 性能相关

```js
class clip {
  this.temp = xxx;

  function clip () {
    this.temp.xx = xx;
  }
}
```

为什么是`temp`不是`const`

避免内存抖动：
在渲染循环中，这些方法每帧都会被调用
如果每帧都创建和销毁对象，会导致频繁的垃圾回收
频繁的垃圾回收会造成性能抖动

## plane 与模型的坐标问题

```js
// 假设模型被缩放了2倍并移动到(10,0,0)
model.scale.set(2, 2, 2);
model.position.set(10, 0, 0);

// 切割平面在世界空间中
clippingPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);

// 需要将平面转换到局部空间才能正确计算交点
// 否则，计算出的交点位置会出错
```

## 通过欧拉角与四元数 灵活的更新物体位置

```js
// 基于欧拉角改变向量位置
export const euler2Matrix = (
  originalVector: Vector3,
  eulerAngles: Euler,
  distance = 1
) => {
  // 1. 将Euler转换为Quaternion
  const quaternion = new Quaternion().setFromEuler(eulerAngles);

  // 2. 创建一个单位方向向量（例如沿Z轴）
  const directionVector = new Vector3(0, 0, 1);

  // 3. 使用Quaternion旋转方向向量
  directionVector.applyQuaternion(quaternion);

  // 4. 将旋转后的方向向量乘以距离，并将其加到原始向量上
  const movedVector = originalVector
    .clone()
    .addScaledVector(directionVector, distance);

  return movedVector;
};
```

我们的目标是让物体沿Z轴发生一定变化，但此时物体可能有自己的旋转角度，结合四元数算出准确更新方式。

比如我原地跳高，和向前跳远，Y轴在计算时 需要物体提供一个欧拉角转换为四元数 再将Y轴的变化通过四元数转换为准确的（XY轴变化），就像跳远是+X+Y 并不是只有+Y
