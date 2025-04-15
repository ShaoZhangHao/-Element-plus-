import { ref, unref, computed, getCurrentInstance, inject } from 'vue'
// 设置默认命名空间前缀
const defaultNameSpace = "el"
const namespace = "el"
const statePrefix = "is-"
const _bem = (
  // 命名空间
  NameSpace,
  block,
  blockSuffix,
  element,
  modifier
) => {
  if (NameSpace === undefined || block === undefined) {
    console.log("namespace和block必填不允许为空")
    return false
  }
  // 按顺序连接起来
  let cls = `${NameSpace}-${block}`
  if (blockSuffix) {
    if (typeof (blockSuffix) === "string")
      cls = `${cls}-${blockSuffix}`
    else {
      console.log("blockSuffix必须得是字符串类型")
      return false
    }
  }
  if (element)
    if (typeof (element) === "string")
      cls = `${cls}__${element}`
    else {
      console.log("element必须得是字符串类型")
      return false
    }
  if (modifier)
    if (typeof (modifier) === "string")
      cls = `${cls}--${modifier}`
    else {
      console.log("element必须得是字符串类型")
      return false
    }
  // 前两个必填
  return cls
}

const namespaceConetextKey = Symbol("namespaceContextKey")

// 使用自定义的命名空间作为前缀
const useGetDerivedNameSpace = (
  namespaceOverrides
) => {
  const derivedNameSpace =
    namespaceOverrides || (getCurrentInstance() ? inject(namespaceConetextKey, ref(defaultNameSpace)) : ref(defaultNameSpace))
  // 先查看调用该函数的时候有没有提供自定义命名空间名 有的话就直接用
  // 如果没有的话 先判断当前函数调用的时候是否实在Vue实例中 如果在的话就用inject去接受祖先的默认命名空间，否则使用当前默认命名空间 并变成ref响应式
  // 为什么要变成ref呢？
  const namespace = computed(() => {
    return unref(derivedNameSpace) || defaultNameSpace
  })
  // 为什么又要用unref解除响应式
  return namespace
}

export const useNameSpace = (
  block,
  namespaceOverrides
) => {
  const namespace = useGetDerivedNameSpace(namespaceOverrides)
  // 计算属性得到的值为什么要用.value来获取？
  const b = (blockSuffix = '') =>
    _bem(namespace.value, block, blockSuffix, "", "")

  const e = (element) =>
    element ? _bem(namespace.value, block, "", element, "") : ''

  const m = (modifier) => {
    // console.log(modifier)
    return modifier ? _bem(namespace.value, block, "", "", modifier) : ""
  }

  const be = (blockSuffix = '', element) =>
    _bem(namespace.value, block, blockSuffix, element, "")

  const em = (element, modifier) =>
    _bem(namespace.value, block, "", element, modifier)

  const bm = (blockSuffix, modifier) =>
    _bem(namespace.value, block, blockSuffix, "", modifier)

  const bem = (blockSuffix, element, modifier) =>
    _bem(namespace.value, block, blockSuffix, element, modifier)

  // 在button中 is用于生成plain round loading disabled等等的CSS选择器名称 
  // 第一个参数name就是plain round loading disabled，第二个参数就是调用组件时传递的值
  // 如果使用btn组件的时候绑定了属性plain 那么props.plain="plain"
  // 举例 is('plain',props.plain)
  const is = (name, ...args) => {
    if (!args) args = []
    // 如果args没有传参，那就当做空数组
    const state = args.length >= 1 ? args[0] : true
    // console.log("is",name && state ? `${statePrefix}${name}` : '');
    
    // 最后return一个字符串 name&& state是一个整体 判断name和state是否存在，存在就返回一个字符串
    // 举例 is-plain is-disabled is-loading 如果在调用的时候没有传递参数就会返回""在class的数组中，自然就不会有对应的样式了
    // 所以针对round和plain 都是单独生成一个样式
    return name && state ? `${statePrefix}${name}` : ''
  }

  // 生成css Var自定义属性键值对
  const cssVar = (object) => {
    const styles = {}
    for (const key in object) {
      if (object[key]) {
        styles[`--${namespace.value}-${key}`] = object[key]
      }
    }
  }
  // --el-button-
  const cssVarBlock = (object) => {
    const styles = {}
    for (const key in object) {
      if (object[key]) {
        styles[`--${namespace.value}-${block}-${key}`] = object[key]
      }
    }
    return styles
  }
  const cssVarName = (name) => {
    return `--${namespace}-${name}`
  }
  const cssVarBlockName = (name) => {
    return `--${namespace}-${block}-${name}`
  }
  return {
    namespace,
    b, e, m, be, em, bm, bem, is, cssVar, cssVarBlock, cssVarName, cssVarBlockName
  }
}
