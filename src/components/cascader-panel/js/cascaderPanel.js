import { computed } from "vue";
import { NOOP } from "@vue/shared";
export const CascaderProps = {
  options: {
    type: Array,
    default: [],
  },
  props: Object,
  //   这个props 是额外配置 可以通过通过props属性传入一个对象 可以设置多选multipel:true
  //  collapse：true折叠
  showAllLevels: {
    type: Boolean,
    default: true,
  },
};
// DefaultProp是options和额外配置extra_props的默认值
export const DefaultProps = {
  // 最简单的就只有三个
  children: "children",
  value: "value",
  label: "label",
  lazy: false,
  expandTrigger: "click",
  // 默认情况下 disabled的值仅仅是代表options中表示禁用的key名称
  // 但是可以通过传递一个函数 来筛选哪些Node需要被禁用 接收(options.data和Node)两个参数
  disabled: "disabled",
  multiple:true,
  // 选择非叶子节点 也可以作为答案 只要新增checkStrictly判断 让非叶子节点也可以执行check方法
  checkStrictly:false,
  lazy:false,
  // NOOP是一个no operation函数 功能就是什么都不做
  lazyLoad:NOOP,
  initialLazyLoad:NOOP
};
// 展开运算符 后面的会覆盖掉前面的内容

export const useCascaderConfig = (props) => {
  // 为什么这里使用展开运算符一定要在{}外面嵌套一个()
  return computed(() => ({
    ...DefaultProps,
    ...props,
  }));
};
