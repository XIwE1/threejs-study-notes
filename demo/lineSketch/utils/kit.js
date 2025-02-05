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
      const instanceGeometry = item.geometry.clone();
      instanceGeometry.applyMatrix4(item.matrix);
      geometries.push(instanceGeometry);
    }
  });

  if (geometries.length > 0) {
    mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries);
  }

  // mergedMesh.position.y = -3.3
  // mergedMesh.quaternion.identity();
  // mergedMesh.applyMatrix4(gltf.scene.matrix)
  // mergedMesh.updateMatrixWorld(true);
  return new THREE.Mesh(mergedGeometry, new THREE.MeshBasicMaterial());
}

export { throttle, debounce, dealModel };
