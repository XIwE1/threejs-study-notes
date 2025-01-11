function showToast(message, top = 30, duration = 3000) {
  // 创建toast元素
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.top = top + "px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  toast.style.color = "white";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "3px";
  toast.style.zIndex = "1000";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.8s";
  document.body.appendChild(toast);
  return new Promise((resolve) => {
    setTimeout(() => {
      toast.style.opacity = "1";
    }, 10);
    setTimeout(() => {
      toast.style.opacity = "0";
      resolve(true);
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 800);
    }, duration);
  });
}

export {
  showToast,
};
