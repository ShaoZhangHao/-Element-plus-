<template>
  <teleport :disabled="!teleported" :to="appendTo">
    <!-- transition组件可以传递一个name来声明一个过渡效果名称 -->
    <!-- <transition :name="'fade'"> -->
    <!-- transition的name属性是用来给transition的类名提供一个前缀 -->
    <Transition @before-enter="onBeforeEnter" :name="transitionClass">
      <!-- <div class="content" v-if="shouldShow" v-show="shouldShow" ref="contentRef">
      <slot>
        <span>我是内容</span>
      </slot>
    </div> -->
      <popper-content
        v-if="shouldRender"
        ref="contentRef"
        v-show="shouldShow"
        :effect="effect"
        :placement="placement"
        :popper-options="popperOptions"
        :raw-content="rawContent"
        :content="content"
        :showArrow="showArrow"
        @mouseenter="onContentEnter"
        @mouseleave="onContentLeave"
        :pure="pure"
      >
        <slot></slot>
      </popper-content>
    </Transition>
  </teleport>
</template>
<script setup>
  import { computed, provide, inject, ref, watch, unref } from "vue";
  import popperContent from "../popper/content.vue";
  import { ToolTipContentProps } from "./js/content";
  import { composeEventHandlers, whenTrigger } from "@/utils/dom/event";
  const props = defineProps(ToolTipContentProps);
  const contentRef = ref();
  // console.log("content",props.pure);
  const stopWhenControlled = () => {
    if (unref(controlled)) return true;
  };
  const shouldRender = computed(() => (props.persistent ? true : unref(open)));

  const shouldShow = computed(() => {
    // 在禁用模式下不应该显示 否则就看有没有打开 还需要另一个功能来控制
    return props.disabled ? false : open.value;
  });

  // 第二个参数是默认值 没有找到key时使用的
  const { open, onOpen, onClose, controlled } = inject(
    "TOOLTIP_INJECTION_KEY",
    undefined
  );
  // 定义transitionClass 让用户可以自定义tooltip显示和隐藏的样式
  const transitionClass = computed(() => {
    // transitionClass返回的的不是bool值 而是一个名称 作为transition Class类名的前缀
    // 默认情况下类名为el-fade-in-linear

    return props.transition || `fade-in-linear`;
  });

  const onContentEnter = composeEventHandlers(stopWhenControlled, () => {
    if (props.enterable) {
      // console.log("onContentEnter");
      onOpen();
    }
  });

  const onContentLeave = composeEventHandlers(stopWhenControlled, () => {
    if (props.enterable) {
      // console.log("onContentLeave");
      onClose();
    }
  });
  const onBeforeEnter = () => {
    // console.log("onbeforeenter");

    contentRef.value?.update?.();
  };
</script>
<style lang="scss" scoped>
  // @import url("../../css/global_var.css");
  @import "../../style/css/transition.css";
</style>
