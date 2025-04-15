<template>
    <slot></slot>
</template>
<script setup>
import { provide, ref,watch } from 'vue';
const triggerRef=ref()
// 这里的contentRef的确没有和任何东西绑定在一起 
const contentRef=ref()

const popperInstanceRef=ref()
provide("POPPER_INJECTION_KEY",{
    triggerRef,
    contentRef,
    popperInstanceRef
})
// 还需要define
defineExpose({
    contentRef
})
</script>
<style></style>