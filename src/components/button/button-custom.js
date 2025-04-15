import { useNameSpace } from "@/utils/hooks/UseNameSpace/usenamespace"
import { TinyColor } from "@ctrl/tinycolor"
import { buttonProps } from "./button"
import { computed } from 'vue'
export function darken(color, amount = 20) {
  // color.mix是颜色混合 将目标颜色和黑色进行一定百分比混合 然后将混合后的颜色输出
  return color.mix('#141414', amount).toString()
}
// 生成 自定义属性 保存在style动态属性中给button的所有类去使用
// 这里是给用户自定义颜色使用的，使用了其他颜色的时候 这里会自动去计算那些地方要改变
export function useButtonCustomStyle(props) {
  const ns = useNameSpace('button')
  return computed(() => {
    let styles = {}
    let buttonColor = props.color
    // console.log("button", buttonColor)
    // 如果有传递color进来
    if (buttonColor) {
      const color = new TinyColor(buttonColor)
      // 使用了朴素模式
      if (props.plain) {
        // --el-button-bg-color
        // 生成对应的自定义属性键值对 不要太难随便弄点简单的就好了
        styles = ns.cssVarBlock({
          // 没有任何反应？？？
          // 如果在使用了朴素模式 的情况下还用了dark 那就将颜色变暗90% tint函数是指和白色混合
          'bg-color': props.dark ? darken(color, 90) : color.tint(90).toString,
          // 文字颜色不需要变暗 和传入颜色保持一致
          'text-color': buttonColor,
          'border-color': props.dark ? darken(color, 50) : color.tint(90).toString,
          // 'hover-text-color':`var(${ns.cssVarName('color0white')})`
          // 'border-color': new TinyColor("blue")
        })
        // console.log("styles", styles)
      }
      else {
        // 悬浮状态下的背景颜色 
        const hoverBgColor = color.tint(70).toString()
        // console.log(color)
        // textColor默认是蓝色的
        const textColor = color.tint(5).toString()
        styles = ns.cssVarBlock({
          // 'bg-color': buttonColor,
          // buttonColor是用户传递的颜色 如果用户没有传递颜色怎么办 那就为空 
          // 'text-color': textColor,
          // 'border-color': buttonColor,
          'hover-bg-color': hoverBgColor,
          'hover-text-color': textColor,
          // 'hover-border-color': hoverBgColor,
          // 'active-bg-color': activeBgColor,
          // 'active-border-color': activeBgColor,
        })
      }
      // 写在这里的话 优先级太高 后续无法改变大小了
      // else {
      //   styles = ns.cssVarBlock({
      //     'size': "32px"
      //   })
      // console.log(styles)
      // }
      return styles
    }

  })
}