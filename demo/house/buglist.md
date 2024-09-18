### 1. 加载、引入模型后 无论怎么设置都没有纹理

关键信息：```Unknown extension “KHR_materials_pbrSpecularGlossiness“```

错误原因：较新版本的 three.js 不包含 spec/gloss PBR 材料，而此模型需要这些材料

解决方法：
1. **在线转换**
    将模型加载到https://gltf.report/ ，然后将结果导出到新文件

2. **离线转换**
    ```js
    npm install --global @gltf-transform/cli

    gltf-transform metalrough input.glb output.glb
    ```
3. **运行时转换**
    ```js
    import { WebIO } from '@gltf-transform/core';
    import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
    import { metalRough } from '@gltf-transform/functions';

    // Load model in glTF Transform.
    const io = new WebIO().registerExtensions(KHRONOS_EXTENSIONS);
    const document = await io.read('path/to/model.glb');

    // Convert materials.
    await document.transform(metalRough());

    // Write back to GLB.
    const glb = await io.writeBinary(document);

    // Load model in three.js.
    const loader = new GLTFLoader();
    loader.parse(glb.buffer, '', (gltf) => {
    scene.add(gltf.scene);
    // ...
    });
    ```