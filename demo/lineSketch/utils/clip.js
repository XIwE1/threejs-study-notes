import * as THREE from "three";
import OutlineGenerator from "./outline";

const ANIMATE_TIME = 100;

class Clip {
  isAnimating = false;
  animationId = null;
  scene = null;
  model = null;
  clipPlanes = [];
  clipLines = []; // 用于记录裁剪面与模型相交的轮廓线段
  renderer = null;
  edgeColor = 0x80deea;
  range = [0, 0];
  step = 0;

  constructor(scene, model, renderer, color) {
    this.scene = scene;
    this.model = model;
    this.renderer = renderer;
    this.renderer.localClippingEnabled = true;
    this.edgeColor = color || 0x80deea;
    this.outline = new OutlineGenerator(model);
    this.init();
  }

  animate(isReStore, timeStamp, lastTime = 0) {
    if (timeStamp - lastTime > 25) {
      lastTime = timeStamp;
      const plane = this.clipPlanes[0];
      const isRevert = plane.normal.x < 0;

      const max = this.range[1];
      const min = this.range[0];
      this.isAnimating = true;

      let result =
        this.clipPlanes[0].constant - (2 * !!isReStore - 1) * this.step;

      if (isReStore) {
        if (isRevert) result = result < min ? min : result;
        else result = result > min ? min : result;
      } else {
        if (isRevert) result = result > max ? max : result;
        else result = result < max ? max : result;
      }

      this.setConstant(result);
      this.outline.updateOutLines(plane);
      if (result === this.range[isRevert ? +isReStore : +!isReStore])
        return this.stopAnimate();
    }
    this.animationId = requestAnimationFrame((now) =>
      this.animate(isReStore, now, lastTime)
    );
  }

  stopAnimate() {
    this.animationId && cancelAnimationFrame(this.animationId);
    this.animationId = null;
    this.isAnimating = false;
  }

  invert() {
    const plane = this.clipPlanes[0];
    this.range = [-this.range[0], -this.range[1]];
    // this.range = [-this.range[1], -this.range[0]];

    plane.negate();
    this.step = -this.step;
  }

  cover() {
    this.stopAnimate();
    requestAnimationFrame((timeStamp) => this.animate(false, timeStamp));
  }

  restore() {
    this.stopAnimate();
    requestAnimationFrame((timeStamp) => this.animate(true, timeStamp));
  }

  setConstant(constant) {
    this.clipPlanes[0].constant = constant;
  }

  init() {
    if (!this.model) return;

    // 获取模型边界
    const x_range = computedRange(this.model);
    this.range = x_range;
    // 计算每步（帧）更新的距离
    this.step = (x_range[1] - x_range[0]) / ANIMATE_TIME;

    // 生成剪裁平面
    const plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), x_range[0]);
    this.clipPlanes.push(plane);

    // todo:优化写法
    // plane.applyMatrix4(this.model.matrixWorld);

    // 修改模型材质设置剪裁面
    this.model.traverse((child) => {
      if (child.isMesh || child.isLineSegments) {
        child.material.clippingPlanes = this.clipPlanes;
        child.material.clipShadows = true;
      }
    });

    // 将剪裁面与模型重叠的轮廓添加到场景中
    this.scene.add(this.outline.outlines)
  }
}

function computedRange(model) {
  const box = new THREE.Box3().setFromObject(model);
  const max = box.max;
  const min = box.min;

  return [-min.x, -max.x];
}

export { Clip };
