<template>
  <component
    :is="tag"
    v-bind="_props"
    :class="buttonKls"
    @click.prevent="handleClick"
    :style="styles"
  >
    <!-- 这里的loading只要使用了就一定会显示出来 那优先级是什么？自定义的 -->
    <template v-if="loading">
      <!-- loading具名插槽 如果用户使用了具名插槽loading 但是没有定义样式 那就会使用v-else的默认样式-->
      <slot v-if="$slots.loading" name="loading"> </slot>
      <!-- 使用默认样式 -->
      <span v-else
        ><Icon :class="ns.e('loading')" type="ios-loading"></Icon
      ></span>
    </template>
    <!-- $slots.default会返回父组件传递过来的每个插槽的vnode 如果父组件没有使用默认插槽，为null 所以不会显示出默认插槽 -->
    <slot v-if="$slots.default">默认插槽</slot>
  </component>
</template>
<script setup>
  import { buttonEmits, buttonProps } from "./button";
  import { useNameSpace } from "@/utils/hooks/UseNameSpace/usenamespace";
  import { computed, inject } from "vue";
  import { Icon } from "view-ui-plus";
  import { useButtonCustomStyle } from "./button-custom";
  // Vue3用组合式API完成
  // 因为setup也是一个生命周期 这里要给该组件命名要使用defineOptions
  defineOptions({
    name: "ELButton",
  });
  // const emits = defineEmits(["click"]);
  const props = defineProps(buttonProps);
  const emits = defineEmits(buttonEmits);
  const ns = useNameSpace("button");
  const formContext = inject("formContextKey", undefined);
  const styles = useButtonCustomStyle(props);
  const ButtonGroupContext = inject("ButtonGroupKey", undefined);
  const _type = computed(() => ButtonGroupContext?.type || props.type);
  const _size = computed(() => ButtonGroupContext?.size || props.size);
  const useFormDisabled = (props) => {
    // 在Form表单中时，button的状态应当和Form表单同步
    const formContext = inject("formContextKey", undefined);
    const form_disabled = formContext?.disabled;
    return computed(() => {
      return props.disabled || form_disabled;
    });
  };
  function useButton(props) {
    const _disabled = useFormDisabled(props);
    const _props = computed(() => {
      if (props.tag === "button") {
        return {
          disabled: _disabled.value || props.loading,
          type: props.nativeType,
        };
      } else return {};
    });
    return { _disabled, _props };
  }
  const { _disabled, _props } = useButton(props);
  const handleClick = (e) => {
    if (props.disabled || props.loading) {
      e.stopPropagation();
      return;
    }
    if (props.nativeType === "reset") {
      formContext?.resetFields?.();
    }
    emits("click", e);
  };
  // 我现在要做的 是看传递进来的props能否被正确使用
  // console.log(props)
  const buttonKls = computed(() => {
    // console.log("type", ns.m(props.type), props.type);
    // 计算属性要根据用户使用Button时候传入的参数来显示对应的样式
    return [
      ns.b(), //el-button
      ns.m(_type.value), //el-button--type
      ns.m(_size.value), //el-button--size
      // 首先在el-button类中定义button的size值是个var变量, 然后新增的el-button--size类别会覆盖原本的值
      ns.is("plain", props.plain), //is-plain
      ns.is("round", props.round),
      ns.is("circle", props.circle), //is-circle
      ns.is("disabled", _disabled.value),
      ns.is("loading", props.loading),
      ns.is("text", props.text),
      ns.is("has-bg", props.bg),
    ];
  });
  // console.log("buttonkls", buttonKls.value);
  // console.log("buttonKls.value",buttonKls.value)
  // ns包含一堆函数
</script>
<style lang="scss">
  @import "../css/button.css";
</style>
