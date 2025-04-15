<template>
  <div :class="contentClass" ref="contentRef">
    <!-- 要使用多行文本 或者设置文本内容的格式  -->
    <!-- 没有使用content插槽的时候 通过content属性传递的内容会作为插槽的默认值
     如果传递了content 那么默认值不会生效 而是渲染插槽传递的内容
     如果使用了rawContent 那么插槽传递的内容就不会生效 
     -->
    <slot v-if="!rawContent"
      ><span>{{ content }}</span></slot
    >
    <span v-else v-html="content"></span>
    <!-- data-popper-arrow会在floating-ui自动计算过后赋值为placement -->
    <div
      v-if="showArrow"
      :data-popper-arrow="placement"
      :class="[ns.e('arrow')]"
      ref="arrowRef"
    ></div>
  </div>
</template>
<script setup>
  import { computed, inject, ref, watch, unref } from "vue";
  import {
    arrow,
    autoUpdate,
    computePosition,
    flip,
    offset,
    shift,
  } from "@floating-ui/vue";
  import { contentProps } from "./js/content";
  import { useNameSpace } from "@/utils/hooks/UseNameSpace/usenamespace";
  const props = defineProps(contentProps);

  const ns = useNameSpace("popper-content");
  // 实现用floating-ui进行定位 将popper组件内的contentRef放到这里 就会和content.vue的content绑定 所以popper那边也可能会绑定
  const { triggerRef, contentRef } = inject("POPPER_INJECTION_KEY");
  const { pure } = inject("TOOLTIP_INJECTION_KEY");
  // const contentRef = ref();
  const arrowRef = ref();
  // const concreateOffset = computed(() => {
  //   return props.placement.split("-").length > 1
  //     ? props.placement.split("-")[1]
  //     : null;
  // });
  // const arrow_offsetX = (arrowX) => {
  //   return props.placement.split("-").length > 1
  //     ? unref(concreateOffset) === "top"
  //       ? //  如果是顶头部 应该往右移动triggerRef.width/4
  //         arrowX + triggerRef.value.getBoundingClientRect().width / 4
  //       : arrowX - triggerRef.value.getBoundingClientRect().width / 4
  //     : arrowX;
  // };
  watch([triggerRef, contentRef], ([triggerDOM, contentDOM]) => {
    // console.log("content",triggerDOM)
    if (!triggerDOM || !contentDOM) return;
    // computePosition的返回结果是一个Promise 通过then catch获得resolve的值
    // 这里面的值就是 x y 运用到content Style上的偏移的值
    computePosition(triggerDOM, contentDOM, computePosition_Options.value).then(
      ({ x, y, placement, middlewareData }) => {
        Object.assign(contentDOM.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
        const { x: arrowX, y: arrowY } = middlewareData.arrow;
        const staticSide = {
          top: "bottom",
          right: "left",
          bottom: "top",
          left: "right",
        }[placement.split("-")[0]];
        // concreateOffset是end/start

        // 默认情况下 arrow是永远指向trigger的中间位置的 如果需要变化 那就要自定义
        // console.log(
        //   "arrow_offsetX",
        //   concreateOffset,
        //   triggerDOM.getBoundingClientRect().width/4
        // );
        Object.assign(arrowRef.value.style, {
          left: arrowX != null ? `${arrowX}px` : "",
          top: arrowY != null ? `${arrowY}px` : "",
          right: "",
          bottom: "",
          [staticSide]: "-4px",
        });
      }
    );
    //  const cleanup=autoUpdate(triggerDOM,contentDOM,()=>{
    //   computePosition(triggerDOM, contentDOM, computePosition_Options.value).then(
    //     ({ x, y, placement, middlewareData }) => {
    //       Object.assign(contentDOM.style, {
    //         left: `${x}px`,
    //         top: `${y}px`,
    //       });
    //       const { x: arrowX, y: arrowY } = middlewareData.arrow;
    //       const staticSide = {
    //         top: "bottom",
    //         right: "left",
    //         bottom: "top",
    //         left: "right",
    //       }[placement.split("-")[0]];

    //       Object.assign(arrowRef.value.style, {
    //         left: arrowX != null ? `${arrowX}px` : "",
    //         top: arrowY != null ? `${arrowY}px` : "",
    //         right: "",
    //         bottom: "",
    //         [staticSide]: "-4px",
    //       });
    //     }
    //   );
    //  })
  },{deep:true});
  function update() {
    computePosition(
      triggerRef.value,
      contentRef.value,
      computePosition_Options.value
    ).then(({ x, y, placement, middlewareData }) => {
      Object.assign(contentRef.value.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
      const { x: arrowX, y: arrowY } = middlewareData.arrow;
      const staticSide = {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right",
      }[placement.split("-")[0]];
      Object.assign(arrowRef.value.style, {
        left: arrowX != null ? `${arrowX}px` : "",
        top: arrowY != null ? `${arrowY}px` : "",
        right: "",
        bottom: "",
        [staticSide]: "-4px",
      });
    });
  }
  // 接收placement 作为computedPosition的第三个参数options
  const computePosition_Options = computed(() => {
    // console.log("computePosition",props.placement)
    if(Object.keys(props.popperOptions).length===0)
    return  {
      placement: props.placement,
      middleware: [
        flip(),
        shift(),
        offset(6),
        arrow({ element: arrowRef.value }),
      ],
    };
    else return {
      placement: props.placement,
      middleware: [
        flip(),
        shift(),
        offset(6),
        arrow({ element: arrowRef.value }),
        props.popperOptions
      ],
    };
  });
  // 使用属性选择器去找
  const contentClass = computed(() => {
    return [ns.b(), ns.is(props.effect), ns.is("pure", pure)];
  });
  defineExpose({
    update,
  });
</script>
<style lang="scss" scoped>
  @import url("./css/content.css");
</style>
