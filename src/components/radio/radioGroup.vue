<template>
  <div>
    <slot> </slot>
  </div>
</template>
<script setup>
  import { provide, computed, toRefs, inject,watch } from "vue";
  import { radioGroupProps, radioGroupEvent } from "./radioGroup";
  import { radioGroupKey } from "./constants";
  import { generateUseId } from "@/utils/hooks/use-id";
  const props = defineProps(radioGroupProps);
  const emit = defineEmits(radioGroupEvent);
  const formItemContext=inject("formItemContextKey",undefined)
  const id = generateUseId();
  const name = computed(() => {
    // props中有传递name就用name 没有就自动生成
    return props.name || id.value;
  });

  const changeModelValue = (val) => {
    // console.log("changeModelValue");
    emit("update:modelValue", val);
  };
  // 要同时传递给所有slot中的radio 所以一个一个绑定不可取 用provide可以直接提供给所有radio
  provide(radioGroupKey, {
    // 包括modelValue disabled 这些属性 都是写在radioGroup上 然后再传递给radio上
    ...toRefs(props),
    name,
    changeModelValue,
  });
 
  watch(()=>props.modelValue,()=>{
  // 监听变化
  if(props.validateEvent){
    // 有校验规则 
    formItemContext?.validate?.()
  }
})
  // radio的验证事件:change
</script>
<style></style>
