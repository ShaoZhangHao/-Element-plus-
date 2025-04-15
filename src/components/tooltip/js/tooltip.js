export const tooltipProps = {
  disabled: Boolean,
  placement: {
    type: String,
    default: "bottom",
    // validator(val) {
    //   if (!!!val) return false;
    // },
  },
  effect: {
    type: String,
    default: "dark",
  },
  transition: {
    type: String,
    default: "fade-in-linear",
  },
  rawContent: Boolean,
  virtualTriggering: Boolean,
  // 没有使用Typescript的情况下 只能判断ref是不是一个对象了
  virtualRef: Object,
  content: {
    type: String,
    default: "",
  },
  // 默认的触发方式
  trigger: {
    type: [String, Array],
    default: "hover",
  },
  // 禁用组件 也就是根据指定触发方式触发tooltip的时候 tooltip不会显示
  // 1. 控制open变量为false
  // 2. 所有的handler都要添加一个判断disable的条件来决定是否触发
  disabled: Boolean,
  showArrow: {
    type: Boolean,
    default: true,
  },
  showAfter: {
    type: Number,
    default: 0,
  },
  hideAfter: {
    type: Number,
    default: 200,
  },
  autoClose: {
    type: Number,
    default: 0,
  },
  // 鼠标可以进入tooltip且不会消失， 我的思路:定时器延迟tooltip的关闭让鼠标可以进入tooltip中，然后
  // 然后取消掉原本的关闭事件，让tooltip也有onOpen和onClose事件
  enterable: Boolean,
  visible: { type: [null || Boolean], default: null },
  appendTo: { type: [Object, String] },
  teleported: Boolean,
  pure: Boolean,
  persistent: Boolean,
  popperOptions: { type: Object, default: {} },
  // pure是一个非公开的属性 用于将padding设置为0 这个pure是给其他组件使用的 不是给使用者使用的
};

const placement_direction = ["top", "bottom", "left", "right"];
const placement_align = ["start", "end"];
export const placements_list = [];
placement_direction.forEach((direction) => {
  placements_list.push(direction);
  placement_align.forEach((align) => {
    placements_list.push(direction + "-" + align);
  });
});
