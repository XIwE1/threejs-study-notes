https://threejs.org/examples/#webgl_postprocessing_unreal_bloom

后期处理：简单的说就是先渲染一张图存起来，在这张图上面"添油加醋"，处理完后再渲染到屏幕上。这一过程three进行了封装，使用现成的可以更快实现需求

1. EffectComposer（渲染后处理的通用框架，用于将多个渲染通道（pass）组合在一起创建特定的视觉效果）
2. RenderPass(是用于渲染场景的通道。它将场景和相机作为输入，使用Three.js默认的渲染器（renderer）来进行场景渲染，并将结果输出给下一个渲染通道)
3. UnrealBloomPass(是 three.js 中用于实现泛光效果的后期处理效果，通过高斯模糊和屏幕混合技术，将亮度较高的区域扩散开来，从而实现逼真的泛光效果。)
4. ShaderPass（是一个自定义着色器的通道。它允许你指定自定义的着色器代码，并将其应用于场景的渲染结果。这样你可以创建各种各样的图形效果，如高斯模糊、后处理效果等）


几乎任何后期处理，都需要 EffectComposer.js 和 RenderPass.js。