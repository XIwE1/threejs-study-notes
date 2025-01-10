## 按照实体模型创建线型模型

```js
xx_model.traverse((mesh) => {
  if (mesh.isMesh) {
    const quaternion = new THREE.Quaternion();
    const worldPos = new THREE.Vector3();
    const worldScale = new THREE.Vector3();
    // 获取四元数
    mesh.getWorldQuaternion(quaternion);
    // 获取位置信息
    mesh.getWorldPosition(worldPos);
    // 获取缩放比例
    mesh.getWorldScale(worldScale);

    mesh.material.transparent = true;
    mesh.material.opacity = 0.4;
    // 以模型顶点信息创建线条
    const line = createLine(mesh, 30, undefined, 1);
    // 给线段赋予模型相同的坐标信息
    line.quaternion.copy(quaternion);
    line.position.copy(worldPos);
    line.scale.copy(worldScale);

    lineGroup.add(line);
  }
});

const material = new THREE.LineBasicMaterial({
  color: new THREE.Color(color),
  depthTest: true,
  transparent: true,
});
const createLine = (
  object,
  thresholdAngle = 1,
  color = new THREE.Color("#ff0ff0"),
  opacity = 1
) => {
  const edges = new THREE.EdgesGeometry(object.geometry, thresholdAngle);
  const line = new THREE.LineSegments(edges);
  material.opacity = opacity;
  line.material = material;
  return line;
};
```

removeFromParent 删除原有模型