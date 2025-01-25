function throttle(func, wait) {
  let runAble = true;
  return function () {
    if (runAble) {
      func.apply(this, arguments);
      runAble = false;
      setTimeout(() => {
        runAble = true;
      }, wait);
    }
  };
}

function debounce(func, wait) {
  let timer = null;
  return function () {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, arguments);
    }, wait);
  };
}

export { throttle, debounce };
