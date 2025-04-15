export const isElement=(el)=>{
    if(typeof el===undefined)return false
    return el instanceof Element
}