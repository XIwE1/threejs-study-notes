import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";

export function throttle(func, wait) {
  let runAble = true;
  return function () {
    if (runAble) {
      func.apply(this, arguments);
      runAble = false;
      setTimeout(() => {
        runAble = true;
      }, wait);
    }
  };
}

export function debounce(func, wait) {
  let timer = null;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, arguments);
    }, wait);
  };
}

// 合并模型的所有几何体
export function mergeModelMesh(modelGroup) {
  let mergedGeometry = new THREE.BufferGeometry();
  let geometries = [];

  modelGroup.traverse((item) => {
    if (item.isMesh) {
      const _geometry = item.geometry.clone();
      _geometry.applyMatrix4(item.matrixWorld);
      geometries.push(_geometry);
    }
  });

  mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);

  const mergedMesh = new THREE.Mesh(
    mergedGeometry,
    new THREE.MeshBasicMaterial()
  );

  return mergedMesh;
}
