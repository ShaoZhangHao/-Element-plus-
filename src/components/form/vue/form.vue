<!-- 因为所有的form表单内所有的元素都是封装过的组件，真正的值都在不在input表单元素上
所以这里要去获取封装组件的表单元素的内容 
-->

<template>
  <form :class="formClasses">
    <slot></slot>
  </form>
</template>

<script setup>
  import { toRefs, provide, ref, onMounted ,computed} from "vue";
  import { formProps } from "../js/form";
import { useNameSpace } from "@/utils/hooks/UseNameSpace/usenamespace";

  // form组件主要的用处是在于表单验证和样式排布 其他地方没啥区别
  const props = defineProps(formProps);
  const ns=useNameSpace('form')
  const formClasses=computed(()=>{
    return [
      ns.b(),
      {[ns.m('inline')]:props.inline}
    ]
  })
  // fields用于收集所有formItem的context 每个context都会在onmounted的时候添加到这里
  const fields = [];
  const addField = (field) => {
    // field应该是一个对象 prop:rules
    fields.push(field);
  };
  // 编写一个validate函数 去遍历fields 调用每一个context
  const validate =async () => {
    for (let field of fields) {
     await field.validate?.();
    }
  };
  const clearValidate=()=>{
    for (let field of fields) {
      field.clearValidate?.();
    }
  }
  provide("formContextKey", {
    // 这里将model rules都传递给子组件
    // 会将props中的每一个属性都变成ref
    ...toRefs(props),
    addField,
  });
  defineExpose({
    // Form.validate函数暴露出去 是为了让使用者可以决定在什么时候去验证全部的表单
    validate,
    clearValidate
    // 但是要用户自己去决定是否调用有点麻烦 (1)设置开关决定是否调用 (2)如果有Form或者FormItem在 且允许验证 Button组件
  })
</script>

<style lang="scss" scoped></style>
