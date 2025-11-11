import { defineConfig } from "vite";
import { resolve } from "path";
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 复制目录的辅助函数
function copyDir(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = resolve(src, entry.name);
    const destPath = resolve(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

// 自定义插件：复制静态资源
function copyStaticAssets() {
  return {
    name: "copy-static-assets",
    writeBundle() {
      const minecraftDir = resolve(__dirname, "demo/minecraft");
      const distDir = resolve(__dirname, "dist/minecraft");

      // 需要复制的目录
      const dirsToCopy = ["models", "texture", "font", "images"];

      dirsToCopy.forEach((dir) => {
        const src = resolve(minecraftDir, dir);
        const dest = resolve(distDir, dir);
        if (existsSync(src)) {
          copyDir(src, dest);
          console.log(`✓ Copied ${dir}/ to dist/minecraft/${dir}/`);
        }
      });

      // 移动 HTML 文件到正确位置
      const wrongHtmlPath = resolve(distDir, "demo/minecraft/index.html");
      const correctHtmlPath = resolve(distDir, "index.html");

      if (existsSync(wrongHtmlPath)) {
        copyFileSync(wrongHtmlPath, correctHtmlPath);
        // 清理错误的目录结构
        try {
          fs.rmdirSync(resolve(distDir, "demo/minecraft"), { recursive: true });
          fs.rmdirSync(resolve(distDir, "demo"), { recursive: true });
        } catch (e) {
          // 忽略清理错误
        }
        console.log(`✓ Moved HTML file to dist/minecraft/index.html`);
      }
    },
  };
}

export default defineConfig({
  build: {
    outDir: "dist/minecraft",
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      input: resolve(__dirname, "demo/minecraft/index.html"),
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    open: "index.html",
  },
  publicDir: false,
  assetsInclude: [
    "**/*.glb",
    "**/*.gltf",
    "**/*.ttf",
    "**/*.png",
    "**/*.jpg",
    "**/*.jpeg",
  ],
  // 添加自定义插件
  plugins: [copyStaticAssets()],
});
