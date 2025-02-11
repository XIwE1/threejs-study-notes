import * as THREE from "three";
import { MeshBVH } from "three-mesh-bvh";
import { dealModel } from "./kit.js";

// 用于生成模型切割轮廓线的工具类
export default class OutlineGenerator {
  constructor(model, options = {}) {
    if (model.isGroup) {
      this.model = dealModel(model);
    } else {
      this.model = model;
    }
    this.options = {
      maxSegments: options.maxSegments || 100000,
      color: options.color || 0x00acc1,
    };

    // 将所有临时对象组织在一起
    this.temp = {
      intersectPoint: new THREE.Vector3(), // 用于存储交点
      vector3_1: new THREE.Vector3(), // 用于存储三重交点的第一个三维向量
      vector3_2: new THREE.Vector3(),
      vector3_3: new THREE.Vector3(),
      line: new THREE.Line3(),
      matrix: new THREE.Matrix4(),
      plane: new THREE.Plane(),
    };

    // 初始化BVH
    this.initBVH();
    // 初始化轮廓线对象
    this.outlines = this.initOutLines();
  }

  /**
   * @private
   * @description 初始化BVH加速结构
   */
  initBVH() {
    const geometry = this.model.geometry;
    this.bvh = new MeshBVH(geometry, {
      maxLeafTris: 10, // 增加每个叶节点的最大三角形数
      maxDepth: 100, // 增加最大深度限制
      strategy: 0, // SAH 策略，可以提供更好的树结构
    });
    geometry.boundsTree = this.bvh;
  }

  initOutLines() {
    const lineGeometry = new THREE.BufferGeometry();
    const linePosAttr = new THREE.BufferAttribute(
      new Float32Array(this.options.maxSegments * 3),
      3,
      false
    );
    linePosAttr.setUsage(THREE.DynamicDrawUsage);
    lineGeometry.setAttribute("position", linePosAttr);

    const outlines = new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({ color: this.options.color })
    );
    outlines.frustumCulled = false;
    outlines.renderOrder = 3;

    outlines.scale.copy(this.model.scale);
    return outlines;
  }

  // 根据切割平面 更新 轮廓线对象
  updateOutLines(clippingPlane) {
    // 进行坐标空间转换，将切割平面从世界空间转换到模型的局部空间
    // clippingPlane 是在世界空间中定义的
    // 模型的几何数据（顶点）是在模型的局部空间中定义的
    // 要计算平面与模型的交点，需要在同一个空间中进行计算

    // 1. 获取从世界空间到模型局部空间的转换矩阵
    // mode.matrixWorld 获取模型的世界矩阵（包含所有变换信息，缩小放大 旋转 平移）
    // .invert() 获取逆矩阵（从世界空间转换到局部空间）
    this.temp.matrix.copy(this.model.matrixWorld).invert();

    // 2. 将切割平面转换到模型的局部空间
    // 将获得的逆矩阵作用到plane上
    this.temp.plane.copy(clippingPlane).applyMatrix4(this.temp.matrix);

    let index = 0;
    const posAttr = this.outlines.geometry.attributes.position;

    // 使用BVH检测相交
    this.bvh.shapecast({
      intersectsBounds: (box) => this.temp.plane.intersectsBox(box),
      intersectsTriangle: (tri) => {
        // 检查三角形的三条边
        const edges = [
          [tri.a, tri.b],
          [tri.b, tri.c],
          [tri.c, tri.a],
        ];

        let count = 0;
        for (const [start, end] of edges) {
          this.temp.line.start.copy(start);
          this.temp.line.end.copy(end);
          if (
            this.temp.plane.intersectLine(
              this.temp.line,
              this.temp.intersectPoint
            )
          ) {
            posAttr.setXYZ(
              index,
              this.temp.intersectPoint.x,
              this.temp.intersectPoint.y,
              this.temp.intersectPoint.z
            );
            index++;
            count++;
          }
        }

        // 处理特殊情况（三个交点）
        if (count === 3) {
          this.handleTripleIntersection(posAttr, index, count);
        }

        // 如果不是两个交点，移除这些交点
        if (count !== 2) {
          index -= count;
        }
      },
    });

    // 更新轮廓线显示
    this.outlines.geometry.setDrawRange(0, index);
    // 稍微偏移轮廓线位置，避免与模型表面重叠
    this.outlines.position
      .copy(clippingPlane.normal)
      .multiplyScalar(-0.00001);
    posAttr.needsUpdate = true;

    return this.outlines;
  }

  // 处理三重交点的特殊情况
  handleTripleIntersection(posAttr, index, count) {
    this.temp.vector3_1.fromBufferAttribute(posAttr, index - 3);
    this.temp.vector3_2.fromBufferAttribute(posAttr, index - 2);
    this.temp.vector3_3.fromBufferAttribute(posAttr, index - 1);

    if (
      this.temp.vector3_3.equals(this.temp.vector3_1) ||
      this.temp.vector3_3.equals(this.temp.vector3_2)
    ) {
      count--;
      index--;
    } else if (this.temp.vector3_1.equals(this.temp.vector3_2)) {
      posAttr.setXYZ(
        index - 2,
        this.temp.vector3_3.x,
        this.temp.vector3_3.y,
        this.temp.vector3_3.z
      );
      count--;
      index--;
    }
  }

  dispose() {
    this.outlines.geometry.dispose();
    this.outlines.material.dispose();
    this.bvh = null;
  }
}
