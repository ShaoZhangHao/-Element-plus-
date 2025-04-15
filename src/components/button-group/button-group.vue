<template>
  <div :class="ns.b('group')">
    <slot></slot>
  </div>
</template>

<script setup>
  import { useNameSpace } from "@/utils/hooks/UseNameSpace/usenamespace";
  import { ButtonGroupProps } from "./button-group";
  import { provide } from "vue";

  const ns = useNameSpace("button");
  const props = defineProps(ButtonGroupProps);
  provide("ButtonGroupKey", props);
</script>

<style lang="scss" scoped>
  @import "../css/button-group.css";
</style>
