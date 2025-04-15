<template>
  <popperTrigger
    :class="ns.b()"
    :virtual-ref="virtualRef"
    :virtual-triggering="virtualTriggering"
    @mouseenter="onMouseenter"
    @mouseleave="onMouseleave"
    @click="onClick"
  >
    <slot>
      <button>tooltip-trigger</button>
    </slot>
    {{ $slots }}
  </popperTrigger>
</template>
<script setup>
  import popperTrigger from "../popper/trigger.vue";
  import { inject, onMounted, provide, useSlots, watch } from "vue";
  import { TooltipTriggerProps } from "./js/trigger";
  import { useNameSpace } from "@/utils/hooks/UseNameSpace/usenamespace";
  import { composeEventHandlers,whenTrigger } from "@/utils/dom/event";
  const props = defineProps(TooltipTriggerProps);
  const {open, onOpen, onClose,controlled } = inject("TOOLTIP_INJECTION_KEY");
  const { triggerRef } = inject("POPPER_INJECTION_KEY");
  const ns = useNameSpace("popper-trigger");
  // triggerRef是从popper提供的
  // 而是使用emit或者inject去调用父组件中修改triggerRef的方法,ref的修改是不用遵守单向数据流的，一个地方改变了其他使用inject接收该ref的地方都会改变
  // onMounted(()=>{
  //   const slots=useSlots()
  //   console.log(slots.value);
  const is_Disabled = () => {
    return props.disabled || controlled.value;
  };
  //  element是将所有 handler全都添加到了triggerEL上 但是根据trigger的方式不同
  // 并非所有的方法都是要执行的,只需要执行triggerprops的方法 里面可以是数组 也可以是一个字符串
  // 所以做法就是 每一个函数 都对应一个触发方式 ，然后用trigger_props去判断是否包含该方法 如果包含的话就执行
  // 这里需要添加一个判断条件 在受控模式下 也就是visible有值的时候
  // mouseenter 和mouseleave以及click事件的onOpen事件都不能触发
  // 但是可以去调用emit 去修改v-model:visible绑定的变量值 从而触发tooltip父组件内的触发watch监听来改变
  const onMouseenter = composeEventHandlers(
    is_Disabled,
    whenTrigger(props.trigger, "hover", onOpen)
  );
  const onMouseleave = composeEventHandlers(
    is_Disabled,
    whenTrigger(props.trigger, "hover", onClose)
  );
  //先通过whenTrigger拿到一个函数 该函数会根据trigger是否包含click决定是否指定第三个函数 
  // open.value是会变化的 但是 props的数据是单向流的!所以他不会改变 要改变就用provide inject和ref
  const onClick = composeEventHandlers(
    is_Disabled,
    whenTrigger(props.trigger, "click", () => {
      open.value ? onClose() : onOpen();
    })
  );
  // click事件没这么简单 每一次点击都要根据open的值来决定下一个使用的是什么
  // 得到一个空的triggerRef后要将其绑定起来 写一个函数
  const setForwardRef = (el) => {
    triggerRef.value = el;
  };
  provide("FORWARD_INJECTION_KEY", setForwardRef);
</script>
<style>
  .tooltip {
    position: relative;
    left: 200px;
    top: 500px;
    /* width:20px; */
    /* 为什么给button加了border就无法点击？                                                                                                                           */
    /* border:1px solid black; */
  }
</style>
