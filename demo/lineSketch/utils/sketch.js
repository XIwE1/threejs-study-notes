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

      mesh.material.transparent = true;
      mesh.material.opacity = 0.4;
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
