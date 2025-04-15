//  1. 自定义指令会在不同的声明周期触发对应的函数 而v-clickoutside 点击时基本不会触发
//  生命周期函数 所以不能在directives对象的生命周期中执行回调函数
// 2. 而clickoutside最重要的是点击事件，所以通过监听click事件去监听函数
//  如果在el mounted hooks中去监听点击事件，然后update的时候 当前el可能会改变 需要重新绑定监听时间
// 在 组件销毁的时候要去取消事件监听
// 我这种想法和全局监听事件有什么区别呢？ 1. 多个地方重复注册事件监听 会不会损耗性能？
// 在生命周期钩子中注册el点击事件是没用的 因为我要监听的是点击元素外部的点击事件 我给el注册点击事件就无法监听到点击事件
let startClick;
document.addEventListener("mousedown", (e) => {
  startClick = e;
});
document.addEventListener("mouseup", (e) => {
// console.log("nodeList",);

  if (startClick) {
    // handlers 就是一个数组
    for (const handlers of nodeList.values()) {
      //   遍历这个el 的回调函数数组中的回调函数
      for (const { documentHandler } of handlers) {
        //    执行
        documentHandler(e, startClick);
      }
    }
    startClick = undefined;
  }
});
// 为什么不是监听click事件 而是分开监听mouseup和mousedown？
// click是只有鼠标点击和抬起时都在同一个元素上才会触发，mouseup和mousedown可以实现更加细粒度的区分
// 记录每一个el使用clickoutside绑定的事件
let nodeList = new Map();
// 因为当点击outside时 不是
function createDocumentHandler(el, binding) {
  // 用于判断是否应该执行该函数

  //   exlcudes 排除 就是指 额外的使指令不生效的节点
  let excludes = [];
  //   console.log("binding.arg",Array.isArray(binding.arg)) false [contentRef]不是数组
  //   为什么此时
//   console.log("TYPE", Object.prototype.toString.call(binding.arg));
// 这里要考虑到一个问题 就是binding.arg 也就是contentRef 在tooltip中是用v-if渲染的 所以一开始contentRef是不存在
// 那这里push进来的时候就要考虑到是否存在
  if (Array.isArray(binding.arg)) {
  } else if(binding.arg instanceof Element){
    // binding.arg是通过指令参数传递过来的变量 在级联选择器中传递过来的是contentRef
    // 因为除了点击绑定元素外 当用户点击的是contentRef时也不算点击外面
    // 这里要判断用户传递过来的是Element元素
    excludes.push(binding.arg);
    // 如果不是dom元素就不会push进来
  }
  return function (mouseupEvent, mousedownEvent) {
    // 触发的条件是：鼠标按下和抬起的元素都不是目标元素才会触发clickoutside对应的事件

    const mouseUpTarget = mouseupEvent.target;
    const mouseDownTarget = mousedownEvent.target;
    // 只要鼠标抬起或者按下时的触发对象有一个不存在就为true

    // 接下来的判断条件只要为true 就说明不符合当前回调函数的执行条件
    // 如果点击的mouseup/mousedown其中一个为null

    // const isTargetExists = !mouseUpTarget || !mouseDownTarget;

    // 判断触发对象是否在el中
    const isContainedByEl =
      (mouseUpTarget && el.contains(mouseUpTarget)) ||
      (mouseDownTarget && el.contains(mouseDownTarget));
    //   判断鼠标抬起的元素是否是他自己 为什么只是鼠标抬起呢？
    const isSelf = el === mouseUpTarget;
    // 判断点击的元素是否在el之外的binding.arg中
    const isTargetExcluded =
      (excludes.length &&
        excludes.some((item) => item.contains(mouseDownTarget))) ||
      (excludes.length &&
        excludes.some((item) => item.contains(mouseDownTarget)));
    // 只要mouseup时的元素是el本身或者按下或者抬起时的元素都是el内部的元素 或者bingding.arg 就不算点击外面 拒绝执行
    if (isContainedByEl || isTargetExcluded || isSelf) return;
    // 这两个参数不是必须的 但是也传过去先 以防万一回调函数会需要
    // console.log("执行toggle函数") 
    //有问题 执行的次数变多了
    binding.value(mouseupEvent, mousedownEvent);
  };
}
export const ClickOutside = {
  // 需要哪些生命周期？
  beforeMount(el, binding) {
    // 判断当前el有没有在map中 没有的话就创建
    if (!nodeList.has(el)) {
      nodeList.set(el, []);
    }
    // 将绑定的函数 保存
    // console.log("beforeMount",el)
    nodeList.get(el).push({
      documentHandler: createDocumentHandler(el, binding),
      bindingFn: binding.value,
    });
  },
  // 这里updated反复触发 触发的原因是因为contentRef  el是div 而内部的contentRef是在反复渲染更新
//   所以这里就出问题了 一直在pushnewHandler 但是el没有发生变化 那么应该有对应的oldHandler才对啊
  updated(el, binding) {
    if (!nodeList.has(el)) {

      nodeList.set(el, []);
    }
    const handlers = nodeList.get(el);
    // console.log("handlers",handlers)
    // 函数没变 但是参数变了？
    const oldHandlerIndex = handlers.findIndex((item) => {
     return item.bindingFn === binding.oldValue;
    });
    // console.log("update oldHandlerInex",oldHandlerIndex )
    // 这里不对 不可能每一次都是-1
    const newHandler = {
      documentHandler: createDocumentHandler(el, binding),
      bindingFn: binding.value,
    };
    if (oldHandlerIndex >= 0) {
      handlers.splice(oldHandlerIndex, 1, newHandler);
    } else {
       
      handlers.push(newHandler);
    }
  },
  unmounted(el) {
    nodeList.delete(el);
  },
};
