import { readonly } from "vue"

export const inputProps = {
    // input表单的类型是text还是textarea 默认text
    type: {
        type: String,
        default: "text"
    },
    // 为什么在属性中使用clearable 的时候 不应该为 clearable="clearable"吗 那为什么clearable在props中设置为string的时候 接收到的内容为undefined 
    clearable: Boolean,
    disabled: Boolean,
    // modelValue是Vue3中的v-model拆分后的prop 在使用该组件的时候必须要使用v-model
    modelValue: {
        default: ''
    },
    placeholder: {
        type: String,
    },
    // formatter是一个函数 将input输入到用户提供的formatter函数中，得到格式化的内容然后返回显示到input上去
    formatter: {
        type: Function
    },
    parser: {
        type: Function
    },

    showWordLimit: Boolean,
    showPassword: Boolean,
    prefixIcon: String,
    maxlength: [Number, String],
    minlength: [Number, String],
    autocomplete: Boolean,
    _readonly: {
        type: Boolean,
        default: false
    },
    autofocus: Boolean,
    
    // 是否使用验证
    validateEvent:{
        type:Boolean,
        default:true
    }
}

export const InputEmits = ['input',
    // 给用户提供  输入的时候可以触发的回调函数 因为原本的input事件用户无法使用 所以给用户提供一个新的
    'change', 'update:modelValue',
    // 当用户使用了clearable清空的时候可以触发的函数
    'clear']