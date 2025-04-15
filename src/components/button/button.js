// 第一个要导出的是props js语法是使用export 和 export default
export const buttonProps = {

  tag: {
    type: String,
    default: "button"
  },
  size: {
    type: String,
    default: "default"
  },
  // button本身就有一个type属性，用来定义submit reset和button，但是这里不是
  // primary / success / warning / danger / info / text
  type: {
    type: String,
    default: ""
  },
  round: Boolean,
  plain: Boolean,
  color: String,
  circle: Boolean,
  disabled: Boolean,
  loading: Boolean,
  text:Boolean,
  bg:Boolean,
  nativeType:{
    type:String,
    default:"button",
    validator(val){
      if(["reset","button","submit"].includes(val))return true
      return false
    }
  }
}

export const buttonEmits=['click']
