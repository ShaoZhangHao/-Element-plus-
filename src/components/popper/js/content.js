export const contentProps={
    placement:{
        type:String,
        default:"bottom"
    },
    effect:{
        type:String,
        default:"dark"
    },
    rawContent:Boolean,
    content:{
        type:String,
        default:""
    },
    showArrow:{
        type:Boolean,
        default:true
    },
    popperOptions:{
        type:Object,
        default: () => ({})
    },

 
}