import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";

const gltfLoader = new GLTFLoader().setPath("./models/");

const loadModel = (path, onProgress) =>
  new Promise((resolve) => {
    gltfLoader.load(
      path,
      (glb) => {
        const model = glb.scene;
        // 设置shadow
        model.receiveShadow = true;
        model.castShadow = true;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        resolve(glb);
      },
      onProgress,
      (e) => console.warn(path + " failed \n [reason] " + e.message)
    );
  });

const textureLoader = new TextureLoader().setPath("./textures/");

const loadTexture = (path) => new Promise((resolve) => textureLoader.load(path, resolve));

export { loadModel, loadTexture };
