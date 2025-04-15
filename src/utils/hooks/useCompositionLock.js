import { ref, nextTick } from 'vue'

export function useCompositionLock(afterComposition, emit) {
    // 默认情况下不使用
    const isComposing = ref(false)
    const handleCompositionStart = (event) => {
        //   该事件需要接受一个event函数 为什么要用emit将event发送出去呢？
        isComposing.value = true
    }
    // 当结束中文输入法的时候 是需要触发一次完整的input事件的，但是当按下空格键的时候会先触发input事件 然后再触发compisitionEnd事件
    // 所以这时候应该把本来的值也返回回去
    const handleCompositionEnd = (event) => {
        // console.log("compositionend")
        if (isComposing.value) {
            // 如果已经触发了handleCompositionStart 才会为true
            isComposing.value = false
            // 
        }
        // 在end的时候必须要再触发一次完整的input绑定的事件 并且由于是从input.value上获取新的value
        // 所以必须要保证是在DOM更新完之后才去获取 因此要使用nextTick
        nextTick(() => { afterComposition(event) })
    }
    return { isComposing, handleCompositionStart, handleCompositionEnd }
}