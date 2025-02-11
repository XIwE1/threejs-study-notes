import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";

function throttle(func, wait) {
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

function debounce(func, wait) {
  let timer = null;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, arguments);
    }, wait);
  };
}

// 合并模型的所有几何体
function dealModel(modelGroup) {
  let mergedGeometry = new THREE.BufferGeometry();
  let geometries = [];

  modelGroup.traverse((item) => {
    if (item.isMesh) {
      const _geometry = item.geometry.clone();
      _geometry.applyMatrix4(item.matrix);
      geometries.push(_geometry);
    }
  });

  if (geometries.length > 0) {
    mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
  }

  const mergedMesh = new THREE.Mesh(mergedGeometry, new THREE.MeshBasicMaterial());
  // mergedMesh.position.y = -3.3
  // mergedMesh.quaternion.identity();
  // mergedMesh.applyMatrix4(modelGroup.matrix)
  // mergedMesh.updateMatrixWorld(true);
  return mergedMesh;
}

export { throttle, debounce, dealModel };
