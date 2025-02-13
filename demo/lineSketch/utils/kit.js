import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
import { MeshBVH } from "three-mesh-bvh";

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

// 生成bvh加速结构 和 用于碰撞测试的网格
export function initBVH(model) {
  if (!model.isMesh) return;

  const geometry = model.geometry.clone();
  const bvh = new MeshBVH(geometry, {
    maxLeafTris: 10, // 增加每个叶节点的最大三角形数
    maxDepth: 100, // 增加最大深度限制
    strategy: 0, // SAH 策略，可以提供更好的树结构
  });
  geometry.boundsTree = bvh;

  const colliderMesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      wireframe: false,
      transparent: true,
      opacity: 0.01,
      depthWrite: false,
    })
  );
  colliderMesh.renderOrder = 2;
  colliderMesh.position.copy(model.position);
  colliderMesh.rotation.copy(model.rotation);
  colliderMesh.visible = false;
  colliderMesh.scale.copy(model.scale);

  return { bvh, mesh: colliderMesh };
}

// 合并模型的所有几何体
export function dealModel(modelGroup) {
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
