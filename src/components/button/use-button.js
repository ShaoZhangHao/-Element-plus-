import { form } from ''
import { useFormSize } from ''
import { ref, useSlots } from 'vue'
// 使用表格的尺寸 是因为elementui中按钮可以使用在form中，然后使用form指定的大小渲染样式
// 如果没有form 那就为空
// 以下buttonGroupContent useForm 都是为了让button和父组件的样式保持一致。
// const buttonGroupContext = inject(buttonGroupContextKey, undefined)
// const globalConfig = useGlobalConfig('button')
// const { form } = useFormItem()
// const _size = useFormSize(computed(() => buttonGroupContext?.size))
// const _disabled = useFormDisabled()
// const _ref = ref(undefined)
// const slots = useSlots()
// const _type = computed(() => props.type || buttonGroupContext?.type || '')

// 自动在两个中文字符之间插入空格 auto-insert-space
const slots = useSlots()
// 当用户指定的按钮的名称为两个字的时候，才能添加空格，返回一个bool值
const shouldAddSpace = computed(() => {
    const defaultSlot = slots.default?.()
    // defaultSlot返回的是默认插槽的Vnode
    if (autoInsertSpace.value && defaultSlot?.length === 1) {
        // 先判断props中是否有指定自定插入空格，并且判断默认插槽的长度是否为1
        const slot = defaultSlot[0]
        // 获取默认插槽[0]?
        if (slot?.type === Text) {
            // 如果是文本的话 
            const text = slot.children //childeren里面是文本的内容
            return /^\p{Unified_Ideograph}{2}$/u.test(text.trim())
            // 用来检测输入的文字是否为两个字 如果不是一
        }
    }
    return false
})
// button的click事件是触发父组件绑定的click函数，并且将触发事件的源头e传递出去。
const handleClick = (e, emit) => {
    emit('click', e)
}
