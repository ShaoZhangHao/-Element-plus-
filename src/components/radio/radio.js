export const props = {
    // 接收一个值 这个值等于某一个单选框radio的 value属性的值 
    // 然后对应value值的radio会被勾选
    modelValue: {
        type: [String, Number, Boolean]
    },
    // 用于和modelValue搭配 用于被选中的时候使用
    value: {
        type: [String, Number, Boolean]
    },
    actualValue: {
        type: [String, Number, Boolean]
    },
    name: {
        type: String,
        default: undefined
    },
    disabled: Boolean
}

export const emitEvent = [
    'change',
    "update:modelValue"
]