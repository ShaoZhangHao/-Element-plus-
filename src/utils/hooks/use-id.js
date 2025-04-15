import { computed } from "vue"
export const defaultId={
    prefix:Math.floor(Math.random()*1000),
    current:0
}
export const generateUseId=()=>{
    const idRef=computed(()=>{
        return `el-id-${defaultId.prefix}-${defaultId.current++}`
    })
    return idRef
}