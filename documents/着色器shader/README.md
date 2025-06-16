# shader学习记录

学习记录自于 https://juejin.cn/post/7233359844974182437

`console.log(geometry)` 打印几何体，可以看到其中 `attributes` 上携带的每个顶点的数据，里面包含:
1. **顶点坐标 position** 三维 顶点相对模型原点的坐标
2. **纹理坐标 uv** 二维
    1. 纹理在模型的位置，比如流光的线条 可以通过移动纹理实现
3. **法线 normal** 三维 面的朝向，可以协助计算光线的入射与反射效果

shader 里无法像 JavaScript 那样 console.log() 打印数据或 debug 调试，所以大家碰到问题可能会不知道如何解决，此时将数值转换成颜色，多通过图形实际的效果去理解和培养直觉或许是个不错的学习方式。

## vertex

### normal

希望每个顶点朝自己原本的方向去偏移，左侧的点往左，右侧的点往右，上方的点往上，下方的点往下......此时可以借助每个顶点自带的法线 normal 来达到这个目的


### position
count 是顶点数，itemSize 是每个属性的维度数

比如 position 和 normal 都是3维的、uv 是2维的，具体说来就是 position 的 array 里是3个一组表示某个顶点的坐标数据

不管物体在哪个地方 position 都是几何体自身的坐标

**改变 position = 改变几何体的形状**

### uv

<img src="https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9ccdfa718a0f42479c50f00f34dc9274~tplv-k3u1fbpfcp-watermark.image?" width="50%" />

u 从左到右增加、v 从下到上增加，范围从左下角 (0, 0) 到右上角 (1, 1) 

## 使用ShaderMaterial

用 `ShaderMaterial` 替换 `MeshBasicMaterial`

并且通过设置 `vertexShader` 顶点着色器和 `fragmentShader` 片元着色器，来实现自定义每个顶点、每个片元/像素如何显示

* 在顶点（vertex）着色器里需要设置 `gl_Position` 顶点位置
* 在片元（fragment）着色器里需要设置 `gl_FragColor` 片元/像素颜色
* **GPU 分别对每个顶点、每个片元独立执行代码**
```js
const vertex = `
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = `
  void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
`;

// const material = new THREE.MeshBasicMaterial({ color: 0x0ca678 });
const material = new THREE.ShaderMaterial({
  vertexShader: vertex,
  fragmentShader: fragment
});
```
* **`position` 是几何体 attributes 里各顶点的坐标**
* **`position` 需要先变成 `vec4` 四维向量类型，才能进行矩阵操作，实现旋转、平移、缩放等操作**
    * 乘以 **`modelMatrix`** 模型矩阵，将原本模型以自身本地坐标定位的方式变成世界坐标里适当的位置和大小
    * 乘以 **`viewMatrix`** 视图矩阵，实现物体基于相机的位置（因为相机位置、视角的不同看到的画面也会不同）
    * 以上合并称为 **`modelViewMatrix`**
    * 乘以 **`projectionMatrix`** 投影矩阵，变换到剪裁空间，最终变成二维屏幕上渲染出来的效果
* **`modelViewMatrix`、`projectionMatrix` 和属性 `position` 都是 ShaderMaterial 里内置的可以直接拿来用**
* shader 程序可以单独写在诸如 `vertex.glsl`、`fragment.glsl` 导入使用；也可以直接在 JavaScript 里用字符串格式表示

### uniforms

在 `ShaderMaterial` 里可以通过 `uniforms` 从主程序 js 里传入所需的变量，其在顶点着色器和片元着色器里都能获取到，且对于每个顶点或片元数值统一相同。

```c#
const material = new THREE.ShaderMaterial({
  uniforms: { 
    uTime: 
      { value: 0 } 
  },
  vertexShader: vertex,
  fragmentShader: fragment,
});

// Animation
material.uniforms.uTime.value = time;

// fragment shader
varying vec2 vUv;

uniform float uTime;

void main() {
  // 先居中，再绘制圆形
  float dist = length(vUv - vec2(0.5));
  // 半径大小随时间周期变化
  float radius = 0.5 * (sin(uTime) * 0.5 + 0.5);
  vec3 color = vec3(step(radius, dist));
  gl_FragColor = vec4(color, 1.0);
}
```

### extensions

### vertexShader顶点着色器

**当每个顶点的变化不再步调一致、单调统一时，shader 的威力才开始显现。**

三维空间里的物体显示到二维屏幕上需要通过 MVP 矩阵变换操作




## GLSL语法

### 类型与运算规则
* vec 向量类型系列，其中包含二维向量 vec2、三维向量 vec3、四维向量 vec4，可以分别看成由 (x,y)、(x,y,z)或(r,g,b)、(x,y,z,w)或(r,g,b,a) 等分量组成
* 可以像下面代码里一样直接访问或修改对应分量数值；
* 当分量的值都一样时，可以只写一个值；
* 向量之间或向量与浮点数之间的加减乘除四则运算，都是基于每个分量单独计算的

```js
// 浮点数 float、整型 int、布尔型 bool
float alpha = 0.5; 
int num = 10; 
bool flag = true;

vec2 a = vec2(1.0, 0.0);
// a.x=1.0 a.y=0.0
a.x = 2.0;
a.y = 0.5;

vec2 a = vec2(1.0);
// a.x=1.0 a.y=1.0

// 向量之间或向量与浮点数之间的加减乘除四则运算是基于每个分量单独计算
vec2 a = vec2(1.0) + vec2(0.1, 0.2);
// a.x=1.1 a.y=1.2
vec2 a = vec2(1.0) * 2.0;
// a.x=2.0 a.y=2.0

vec3 b = vec3(1.0, 2.0, 0.0);
// b.x=1.0 b.y=2.0 b.z=0.0
// b.r=1.0 b.g=2.0 b.b=0.0
b.z = 3.0;

vec4 c = vec4(1.0, 1.0, 1.0, 1.0);
// c.x=c.y=c.z=c.w=1.0
// c.r=c.g=c.b=c.a=1.0
c.r = 0.9
c.g = 0.0;
c.b = 0.0;

vec3 d = vec3(vec2(0.5), 1.0);
vec4 e = vec4(vec3(1.0), 1.0);
vec4 e = vec4(vec2(0.3), vec2(0.1));
```

### 修饰符
在 `ShaderMaterial` 中 ，顶点坐标 position、纹理坐标 uv、法线向量 normal 都是顶点上的数据，已经被定义好了

如果使用 `RawShaderMaterial` 就需要手动声明

* **`attribute` 修饰符表明这个数据是每个顶点上都不同**

> 如每个顶点都不同的一个随机值 `aRandom`

```c#
attribute float aRandom;
```

* **每个顶点或像素数值都相同时变量使用 `uniform` 修饰符**

> 如传入统一的时间 `uTime`

```c#
uniform float uTime;
```

* **`varying` 修饰符表示数据的传递**，在片元着色器里使用顶点着色器里的变量 

> 如果将 uv 从顶点着色器传递到片元着色器里

```c#
// Vertex Shader
attribute vec2 uv;

varying vec2 vUv;

void main() {
  vUv = uv;
}

// Fragment Shader
varying vec2 vUv;

void main() {
  gl_FragColor = vec4(vUv, 1.0, 1.0);
}
```

### 内置函数
#### **`step(edge, x)` 函数**

返回0.0或1.0数值，如果 `x<edge` 返回0.0，如果 `x>edge` 返回1.0
```c#
float color = step(0.5, vUv.x);
// 倒序
float color = step(vUv.x, 0.5);
```

#### **`fract(float)` 函数**

取小数使得数值在 0.0-1.0 里循环重复，比如1.1、2.1取小数后都变回0.1

```c#
// 重复
gl_FragColor = vec4(vec3(fract(vUv.x * 3.0)), 1.0);
// 条纹
gl_FragColor = vec4(vec3(step(0.5, fract(vUv.x * 3.0))), 1.0);
// 乘以正数 = 重复n次
fract(float * n);
```

#### **`length(vec2)` 函数**

获取向量的长度，可用 `vUv` 计算每个像素离原点(0.0, 0.0)位置的距离 `dist`。

也可以用 **`distance()`** 函数计算两个点的距离来代替 `length()`

```c#
float dist = length(vUv);
// 减正数 = 中心点往右上偏移
float dist = length(vUv - vec2(0.5));
```

#### **`sin/cos/tan...` 三角函数**

#### **`mix(x, y, a)` 函数**

线性插值，结果为 `x*(1-a)+y*a`，浮点数 a 的范围是0.0到1.0，根据其数值大小对 x、y 进行插值。

```c#
// linear interpolation 线性插值
mix(x, y, 0.0) => x
mix(x, y, 1.0) => y
mix(x, y, 0.5) => (x + y) / 2.0
mix(x, y, a) => x * (1 - a) + y * a

// 颜色渐变
mix(color1, color2, vUv.x);
x = color1 = vec3(1.0, 0.0, 0.0) = red
y = color2 = vec3(0.0, 1.0, 0.0) = green
a = vUv.x = 0.0 - 1.0 范围

mix(x, y, a) = x * (1-a) + y * a
当 a = 0.25 =>
x * (1 - 0.25) + y * 0.25 
= x * 0.75 + y * 0.25
= vec3(1.0, 0.0, 0.0) * 0.75 + vec3(0.0, 1.0, 0.0) * 0.25 
= vec3(0.75, 0.25, 0.00) // 分别对 rgb 分量套下公式得到对应数值
```

#### `smoothstep()` 内置函数

`smoothstep(edge1, edge2, x)` 接收3个参数，当 x<=edge1 时返回0.0；当 x>=edge2 时返回1.0；当 edge1<x<edge2 时返回平滑插值的数值。

### 辅助函数

#### **`aastep` 函数**

解决抗锯齿问题，使变化更平滑。需要在 ShaderMaterial 里设置 `extensions: { derivatives: true }` 才能生效

```c#
float aastep(float threshold, float value) {
  #ifdef GL_OES_standard_derivatives
    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
    return smoothstep(threshold-afwidth, threshold+afwidth, value);
  #else
    return step(threshold, value);
  #endif  
}

void main() {
  // float strength = aastep(0.25, distance(vUv, vec2(0.5)));
  float strength = aastep(0.01, abs(distance(vUv, vec2(0.5)) - 0.2));
  vec3 color = vec3(strength);
  gl_FragColor = vec4(color, 1.0);
}

const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: vertex,
    fragmentShader: fragment,
    extensions: {
      derivatives: true,
    },
  });
```

#### **`noise` 噪声函数**

借助 noise 函数能使相邻的点（一维、二维、三维的点都行）产生相近的数值，而不是 random 随机函数那种每个位置的数值都和附近无关的效果.

```c#
//	Classic Perlin 3D Noise 
//	by Stefan Gustavson
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}
```

#### `random` 函数
```c#
// 3D Randomness
float random(vec3 pos){
  return fract(sin(dot(pos, vec3(64.25375463, 23.27536534, 86.29678483))) * 59482.7542);
}

void main() {
  vec3 newPos = position;
  // newPos += normal * cnoise(position);
  newPos += normal * random(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
```