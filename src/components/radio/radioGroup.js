export const radioGroupProps = {
  modelValue: {
    type: [String, Number, Boolean],
  },
  disabled: Boolean,
  size: {
    type: String,
    default: "default",
  },
  name:String,
  validateEvent:{
    type:Boolean,
    default:true
  }
};
export const radioGroupEvent = [
    'update:modelValue'
];
