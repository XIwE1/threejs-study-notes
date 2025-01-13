import * as THREE from "three";

class PickHelper {
  constructor(canvas) {
    this.canvas = canvas;
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
    this.pickPosition = { x: 0, y: 0 };
    clearPickPosition.apply(this);
    window.addEventListener("mousemove", setPickPosition.bind(this));
    window.addEventListener("mouseout", clearPickPosition.bind(this));
    window.addEventListener("mouseleave", clearPickPosition.bind(this));
  }
  pick(scene, camera, time) {
    // 恢复上一个被拾取对象的颜色
    if (this.pickedObject) {
      setMaterialColor(this.pickedObject.material, this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }

    // 发出射线
    this.raycaster.setFromCamera(this.pickPosition, camera);
    // 获取与射线相交的对象
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // 找到第一个对象，它是离鼠标最近的对象
      this.pickedObject = intersectedObjects[0].object;
      //   console.log("this.pickedObject", this.pickedObject);
      // 保存它的颜色
      const material = this.pickedObject.material;
      this.pickedObjectSavedColor = getMaterialColor(material);
      //   this.pickedObject.scale.set(1.2, 1.2, 1.2);
    //   this.pickedObject.material.transparent = true;
    //   this.pickedObject.material.opacity = 0.3;
      // 设置它的发光为 黄色/红色闪烁
      setMaterialColor(material, (time * 8) % 2 > 1 ? 0xE0FFE0 : 0x90EE90);
    }
  }
}

function getMaterialColor(material) {
  const colorKey = material.hasOwnProperty("emissive") ? "emissive" : "color";
  return material?.[colorKey]?.getHex();
}

function setMaterialColor(material, color) {
  const colorKey = material.hasOwnProperty("emissive") ? "emissive" : "color";
  material?.[colorKey]?.setHex(color);
}

function getCanvasRelativePosition(event) {
  const rect = this.canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * this.canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * this.canvas.height) / rect.height,
  };
}

function setPickPosition(event) {
  const pos = getCanvasRelativePosition.call(this, event);
  this.pickPosition.x = (pos.x / this.canvas.width) * 2 - 1;
  this.pickPosition.y = (pos.y / this.canvas.height) * -2 + 1; // note we flip Y
}

function clearPickPosition() {
  // 对于触屏，不像鼠标总是能有一个位置坐标，
  // 如果用户不在触摸屏幕，我们希望停止拾取操作。
  // 因此，我们选取一个特别的值，表明什么都没选中
  this.pickPosition.x = -100000;
  this.pickPosition.y = -100000;
}

export { PickHelper };
