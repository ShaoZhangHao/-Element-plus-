export const composeEventHandlers = (controll_Function, handler) => {
  // controll_Function是控制handler函数是否执行的函数
  if (!controll_Function || !handler) {
    console.log("参数函数不能为空 必须都填写",controll_Function);
  }
  const handleEvent = (event) => {
    const shouldPrevent = controll_Function(event);
    if (!shouldPrevent) {
      // prevent为false 说明可以执行 那就直接执行
      handler(event);
    }
  };
  return handleEvent;
};
export const whenTrigger = (trigger, type, handler) => {
  // whenTrigger执行后返回一个函数 该函数可以根据trigger是否与当前type对应 来决定是否执行函数
  // 不考虑disabled 仅仅根据trigger判断能否触发 trigger有两种 一种是string 一种是array
  // 如果是array
  let _include = false;
  if (Array.isArray(trigger)) {
    if (trigger.includes(type)) {
      // 如果指定的触发方式中包含这种 就执行
      _include = true;
    } else {
      console.log("trigger数组中没有", type);
    }
  } else {
    trigger === type ? (_include = true) : undefined;
  }
  return () => {
    _include && handler();
  };
};
