<template>
  <!-- 不使用虚拟触发的话就会onlychild渲染 将popper内的 triggerRef通过onlyChild内的自定义指令自动绑定在
     插槽内的DOM元素上 并且其他的各种事件会通过透传绑定在这个DOM元素上 -->
  <onlyChild v-if="!virtualTriggering" >
    <slot>
      <button>slot-trigger</button>
    </slot>
  </onlyChild>
</template>
<script setup>
  import { inject, onMounted, watch, unref } from "vue";
  import onlyChild from "../slot/onlyChild.vue";
  import { PopperTrigger } from "./js/trigger";
  import { isElement } from "@/utils/hooks/types";
import { unrefElement } from "@vueuse/core";
  const props = defineProps(PopperTrigger);
  const { triggerRef } = inject("POPPER_INJECTION_KEY");
  // 虚拟触发:既然要将触发器设置在tooltip组件外的组件上,那么tooltip组件内部的trigger就不能渲染
  // 否则会触发onlychild内的自定义指令将triggerRef绑定在tooltip默认插槽组件上
  // 然后虚拟触发其实就是换一个triggerRef元素去和contentRef绑定在一起
  // 所以只需要在这里接收popper的triggerRef 然后绑定起来即可 因此需要去监听virtualTriggering的值是否为true
  const TRIGGER_ELE_EVENTS = [
    "onMouseenter",
    "onMouseleave",
    "onClick",
    "onKeydown",
    "onFocus",
    "onBlur",
    "onContextmenu",
  ];

  onMounted(() => {
    // console.log("virtual",props.virtualRef)
    watch(
      () => props.virtualRef,
      (virtualEl) => {
        // console.log("popper-trigger",unrefElement(virtualEl))
        if (props.virtualTriggering && props.virtualRef)
          triggerRef.value = unrefElement(virtualEl);
        // console.log("watch virtualRef in popper trigger----",triggerRef.value)
      },
      {
        immediate: true,
      }
    );
    // 还需要给这个虚拟触发器添加mouseenter和mouseleave方法 用的不是透传 而是watch中给组件绑定
    // 不然不能实现同时给虚拟触发器也添加显示和隐藏tooltip的事件
    watch(
      triggerRef,
      (newEl, prevEl) => {
        
        console.log("new pre",newEl)
        // document.isElement(newEl)
        // 拿到triggerRef之后呢先判断是不是el
        if (isElement(newEl)) {
          //  确认是一个元素之后 然后遍历事件
          TRIGGER_ELE_EVENTS.forEach((eventName) => {
            const handler = props[eventName];
            // console.log("handler",eventName,handler);
            
            // console.log(eventName.slice(2).toLowerCase(),props[eventName])
            //  拿到事件后添加事件
            // 事件名从TRIGGER_ELE_EVENTS中 从每一个名字的第二个位置开始 然后转换成小写
            if (handler) {
              newEl.addEventListener(
                eventName.slice(2).toLowerCase(),
                handler
              );
              // console.log("eventName",eventName.slice(2).toLowerCase());
              
              // 同时还要将之前的prevEL的内容去掉
              prevEl?.removeEventListener(
                eventName.slice(2).toLowerCase(),
                handler
              );
            }
          });

        }
        console.log("给虚拟triggerRef添加事件",newEl);
      },
      {
        immediate: true,
      }
    );
  });
</script>
<style lang="scss" scoped></style>
