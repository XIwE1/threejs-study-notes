import * as THREE from "three";

class Clip {
  model = null;
  clipPlanes = [];
  renderer = null;
  edgeColor = 0x80deea;
  range = [0, 0];

  constructor(model, renderer, color) {
    this.model = model;
    this.renderer = renderer;
    this.renderer.localClippingEnabled = true;
    this.edgeColor = color || 0x80deea;
    this.init();
  }

  toggoleIntersection() {}

  setConstant(constant) {
    this.clipPlanes[0].constant = constant;
  }

  init() {
    if (!this.model) return;

    // 获取模型边界
    const x_range = computedRange(this.model);
    this.range = x_range;
    // 生成剪裁平面
    const plane = new THREE.Plane(new THREE.Vector3(2, 0, 0), x_range[1]);
    this.clipPlanes.push(plane);

    // 修改模型材质设置剪裁面
    this.model.traverse((child) => {
      if (child.isMesh) {
        child.material.clippingPlanes = this.clipPlanes;
        child.material.clipShadows = true;
      }
    });
  }
}

function computedRange(model) {
  const box = new THREE.Box3().setFromObject(model);
  const max = box.max;
  const min = box.min;

  return [min.x, max.x];
}

export { Clip };
