export const rateProps = {
  max: {
    type: Number,
    default: 5,
    validator: (val) => {
      return val >= 1;
    },
  },
  _icon: {
    type: String,
    default: "ios-star-outline",
  },
  activeIcon: {
    type: String,
    default: "ios-star",
  },
  voidIcon: {
    type:  String,
    default: "ios-star-outline",
  },
  icons:{
    type: [Array, String],
    validator(val) {
      if (Array.isArray(val)) {
        // 如果当前val是个数组的话
        for (let item of val) {
          if (!(item instanceof String)) {
            return false;
          }
          // 如果不是String就返回false
        }
      }
      return true;
    },
    default: "ios-star-outline",
  },
  modelValue: {
    type: Number,
    default: -1,
  },
  colors: {
    type: [Array, String],
    default: "green",
  },
  lowThreshold: {
    type: Number,
    default: 2,
  },
  highThreshold: {
    type: Number,
    default: 4,
  },
  disabled: Boolean,
  allowHalf: Boolean,
  clearable: Boolean,
  showText: Boolean,
  texts: {
    type: Array,
    default: ["Extremely bad", "Disappointed", "Fair", "Satisfied", "Surprise"],
  },
  showScore: Boolean,
  scoreTemplate: { type: String,
    default:"{value}"
   },
};
export const rateEmits = ["update:modelValue", "change"];
