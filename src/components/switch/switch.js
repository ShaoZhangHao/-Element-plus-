export const switchProps = {
  modelValue: {
    type: Boolean,
    default: false,
  },
  activeValue: {
    type: Boolean,
    default: true,
  },
  inactiveValue: {
    type: Boolean,
    default: false,
  },
  activeText: String,
  inactiveText: String,
  activeIcon:String,
  inactiveIcon:String,
  inlinePrompt: Boolean,
  size: {
    type: String,
    default: "",
    validator: (value) => {
      return value === "default" || value === "samll" || value === "large"||value === "default" || value === "samll" || value === "";
    },
  },
  activeActionIcon:String,
  inactiveActionIcon:String,
  loading:Boolean,
  disabled:Boolean,
  // beforeChange用于传输到组件内在点击click的时候执行 返回的结果必须得是Promise或者Boolean 如果不是的话就报错
  beforeChange:{
    type:Function
  }
};
export const switchEmits = ["update:modelValue","change"];
