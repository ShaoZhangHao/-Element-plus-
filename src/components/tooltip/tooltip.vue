<template>
  <Popper ref="popperRef">
    <tooltip-trigger
      :virtual-ref="virtualRef"
      :virtual-triggering="virtualTriggering"
      :disabled="disabled"
      :trigger="trigger"
    >
      <slot></slot>
    </tooltip-trigger>
    <Content
      ref="contentRef"
      :persistent="persistent"
      :showArrow="showArrow"
      :placement="placement"
      :effect="effect"
      :transition="transition"
      :raw-content="rawContent"
      :content="content"
      :enterable="enterable"
      :append-to="appendTo"
      :teleported="teleported"
      :popper-options="popperOptions"
    >
      <slot v-if="$slots.content" name="content"></slot>
    </Content>
  </Popper>
</template>
<script setup>
  import Popper from "../popper/popper.vue";
  import {
    provide,
    readonly,
    ref,
    watch,
    computed,
    onMounted,
    useSlots,
  } from "vue";
  import Content from "./content.vue";
  import TooltipTrigger from "./trigger.vue";

  import { placements_list, tooltipProps } from "./js/tooltip";
import { unrefElement } from "@vueuse/core";
  const props = defineProps(tooltipProps);
  const popperRef = ref();
  const placement = computed(() => {
    let legit = true;
    if (!!!props.placement || !placements_list.includes(props.placement))
      legit = false;
    // 进一步验证
    return legit ? props.placement : "bottom";
  });
  const contentRef = ref();
  // 监听visible的值的变化 然后触发onOpen和onClose
  onMounted(() => {
    // console.log("tooltip virtualRef",props.virtualRef)
    // 这里监听visible 但是在受控模式下 原生的方法都不能执行 否则会重复
    watch(
      () => props.visible,
      (newVal) => {
        if (newVal) {
          // 为true说明要打开
          onOpen();
        } else {
          onClose();
        }
      },
      { immediate: true }
    );
  });
  const open = ref(false);

  const controlled = computed(() => {
    // 这里有一个问题 visible即使在没有传递内容的情况下也是false
    // 但这里的前提是 有传递props.visible 而无关内容 不能根据props.visible去判断
    // 给visible设置一个默认值null 并且允许他的type为null和boolean 如果不设置为null的话 及时不传递visible 那默认值是false
    return typeof props.visible === "boolean";
  });
  //   编写两个控制open的函数 onOpen或者onHide

  // 根据showAfter和hideAfter要重新包装一下函数
  const show = (indicator = open) => {
    if (indicator.value === true) return;
    else indicator.value = true;
    // show将open改成true
  };
  const hide = (indicator = open) => {
    if (indicator.value === false) return;
    else indicator.value = false;
  };
  // 给onOpen添加一个autoClose  autoClose和hideClose的区别是 hideClose是要等close事件触发后进行
  // 而autoclose是在open事件触发的时候就开始计时准备关闭了

  // 为了防止setTimeout计时器会影响
  // 要利用闭包

  // 在打开的时候 要清空掉原有的关闭timeout 防止打开后还没触发关闭事件 就关闭了
  // 在关闭的时候 要清空掉原有的打开事件 防止关闭后鼠标都没触发tooltip就又自动打开了

  // 所以基本流程就是：记录timeoutid 然后清空掉
  function useDelayedToggle(showAfter, hideAfter, autoClose, show, hide) {
    // 这里有问题 每次调用的时候返回的函数其实引用的都是不同的lastTimeoutid
    const registerTimeout = useTimeout();
    // registerTimeout其实相当于执行了

    // autoClose是在触发open时就开始计时自动关闭
    const onOpen = () =>
      registerTimeout(() => {
        show(open);
        // 再开始即使
        if (autoClose)
          registerTimeout(() => {
            hide(open);
          }, autoClose);
      }, showAfter);
    const onClose = () => registerTimeout(() => hide(open), hideAfter);
    return { onOpen, onClose };
  }

  // 保证时间线上只会存在一个setTimeout
  // registerTimeout多次调用 清空的都是同一个lastTimeoutId
  function useTimeout() {
    let lastTimeoutId = null;
    return function (fn, timeout) {
      if (lastTimeoutId) {
        clearTimeout(lastTimeoutId);
      }
      lastTimeoutId = setTimeout(fn, timeout);
    };
  }

  // 1.首先防抖的基本思路就是 利用闭包 清空上一个事件 然后创造新的计时器
  // 2. 在这里 上一个事件可以是close 也可以是open 那么要怎么将其赋值给闭包中的同一个变量lastTiemoutId呢？
  // 只能使用 闭包函数返回的函数去调用close和open事件，且必须是同一个函数 ，不能是多次调用闭包函数返回的函数，
  // 因为每一次调用闭包函数返回的函数 引用的都是不同的lastTimeoutId
  // 只有open和hide都是用某一次闭包函数返回的函数去创建定时器 才能保证lastTimeoutId是共同使用的
  // onOpen和on

  const { onOpen, onClose } = useDelayedToggle(
    props.showAfter,
    props.hideAfter,
    props.autoClose,
    show,
    hide
  );
  // const onOpen = () => {
  //   // 在open的时候 应该去清空原有的close的定时器
  //   setTimeout(() => {
  //     // 在触发了该函数后然后再开始准备计算时间
  //     show(open);
  //     // 在展示过后注册一个setTimeoutclose事件
  //     if (props.autoClose) {
  //       let autoCloseTimeout = setTimeout(() => {
  //         hide(open);
  //       }, props.autoClose);
  //     }
  //   }, props.showAfter);
  // };
  // const onClose = () => {
  //   setTimeout(() => {
  //     hide(open);
  //   }, props.hideAfter);
  // };
  provide("TOOLTIP_INJECTION_KEY", {
    open: readonly(open),
    onOpen,
    onClose,
    pure: props.pure,
    controlled,
  });
  defineExpose({
    contentRef,
    popperRef,
  });
</script>
<style scoped></style>
