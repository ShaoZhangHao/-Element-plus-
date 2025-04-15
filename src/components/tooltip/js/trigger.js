export const TooltipTriggerProps = {
  virtualRef: Object,
  virtualTriggering: Boolean,
  // 默认的触发方式
  trigger: {
    type: [String,Array],
    default: "hover",
    validator(val){
        // 验证String的合理性
        if(Array.isArray(val)){
            val.forEach(item=>{
                if(typeof item!==String||!TRIGGER_EVENT.includes(item.toLowerCase())) return false
            })
        }else {
            if(!TRIGGER_EVENT.includes(val.toLowerCase()))return false
        }
        return true
    },

  },
  // 禁用组件 也就是根据指定触发方式触发tooltip的时候 tooltip不会显示
  // 1. 控制open变量为false
  // 2. 所有的handler都要添加一个判断disable的条件来决定是否触发
  disabled: Boolean,
};

const TRIGGER_EVENT=["hover","click"]
