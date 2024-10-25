https://threejs.org/examples/#webgl_postprocessing_unreal_bloom

后期处理：简单的说就是先渲染一张图存起来，在这张图上面"添油加醋"，处理完后再渲染到屏幕上。这一过程three进行了封装，使用现成的可以更快实现需求

几乎任何后期处理，都需要 EffectComposer.js 和 RenderPass.js。