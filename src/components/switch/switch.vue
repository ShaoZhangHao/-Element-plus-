<template>
  <!-- <input type="text" :value="_value" > -->
  <div :class="switchKls" @click.prevent="switchValue">
    <!-- 首先先弄出来switch -->
    <!-- core是那个圆形 -->
    <span v-if="!inlinePrompt" :class="LabelLeftKls">
      <!-- 也可以使用icon -->
      <Icon v-if="activeIcon" :type="activeIcon"></Icon>
      <span v-else-if="activeText">{{ activeText }}</span>
      <slot></slot>
    </span>
    <span ref="core" :class="ns.e('core')">
      <!-- 在药丸的内部添加文字 -->
      <div :class="ns.e('inner')" v-if="inlinePrompt">
        <!-- 他的特效就是左右移动 根据checked判断显示哪个文字-->
        <span v-if="checked" :class="ns.is('text')">
          <Icon v-if="activeIcon" :type="activeIcon"></Icon>
          <span v-else-if="activeText">{{ activeText }}</span>
        </span>
        <span v-else :class="ns.is('text')">
          <Icon v-if="inactiveIcon" :type="inactiveIcon"></Icon>
          <span v-else-if="inactiveText">{{ inactiveText }}</span>
        </span>
      </div>
      <div :class="ns.e('action')">
        <span v-if="loading">
          <Icon type="ios-refresh"></Icon>
        </span>
        <slot>
        <!-- <span v-else-if="activeActionIcon || inactiveActionIcon">
          <Icon :type="checked ? activeActionIcon : inactiveActionIcon"></Icon>
        </span> -->
      </slot>
      </div>
    </span>
    <span v-if="!inlinePrompt" :class="LabelRightKls">
      <!-- 也可以使用icon -->
      <Icon v-if="inactiveIcon" :type="inactiveIcon"></Icon>
      <span v-else-if="inactiveText">{{ inactiveText }}</span>
      <slot></slot>
    </span>
  </div>
</template>
<script setup>
  import { useNameSpace } from "@/utils/hooks/UseNameSpace/usenamespace";
  import { switchProps, switchEmits } from "@/components/switch/switch";
  import { computed, watch, ref } from "vue";
  import { Icon } from "view-ui-plus";
  const ns = useNameSpace("switch");
  const props = defineProps(switchProps);
  const emits = defineEmits(switchEmits);
  const switchKls = computed(() => {
    return [
      ns.b(),
      // ns.m(props.size),
      ns.is("checked", checked.value),
      ns.is("loading", props.loading),
      ns.is("disabled", disabled.value),
    ];
  });
  // console.log("switchKls", switchKls);
  const disabled = computed(() => {
    return props.loading || props.disabled;
  });
  // const _value="sss"
  // 是否为受控组件:modelValue使用的是false且props.modelValue一直没有改变 说明没有在父组件使用v-model 因此他就不是受控组件
  // 只能通过ref去获取里面的状态了
  const isControlled = ref(props.modelValue !== false);
  const LabelLeftKls = computed(() => {
    return [
      ns.e("label"),
      ns.em("label", "left"),
      // 当checked为false的时候才要挂载该属性
      ns.is("active", !checked.value),
    ];
  });
  const LabelRightKls = computed(() => {
    return [
      ns.e("label"),
      // label--right和label--left的作用是要在label和switch之间有个padding 并且方向不同 为了方便灵活控制 所以分开写 而不是直接给switch添加padding 以防影响按钮的移动效果
      ns.em("label", "right"),
      // 当checked为false的时候才要挂载该属性
      ns.is("active", checked.value),
    ];
  });
  // 非受控组件的值必然是false啊 然后判断checked的时候 根据isControlled来判断当前值是什么
  // 那如果是非受控组件 isControlled返回的是false 所以actualValue也是false 那checked不就永远都不会被选中了吗？
  watch(
    () => props.modelValue,
    () => {
      isControlled.value = true;
    }
  );
  const checked = computed(() => {
    return props.modelValue === props.activeValue;
  });

  // 点击的时候要去改变外面绑定的值 改成activeValue或者inactiveValue 由checked决定
  const switchValue = async () => {
    if (disabled.value) return;
    const val = checked.value ? props.inactiveValue : props.activeValue;
    if (!props.beforeChange) return emits("update:modelValue", val);
    let beforeChange_result = props.beforeChange();
    // 先拿到函数的返回结果 判断是否合法 因为里面如果是异步函数 是要等所有同步函数都执行完了才会执行
    let is_beforeChange_legal = is_PromiseOrBoolean(beforeChange_result);
    if (!is_beforeChange_legal) {
      throw Error("beforeChange返回结果有误 请重新检查");
    }
    // 如果返回的是Bool
    if (beforeChange_result instanceof Boolean) {
      // 如果是bool值 直接根据bool值来决定
      if (beforeChange_result) {
        emits("update:modelValue", val);
      } else return;
    } else {
      // 返回的是一个promise 要等这个promise执行完毕
      // p.then的作用是给then函数添加一个回调函数去执行
      // console.log("beforeChange的Promise执行")
      await beforeChange_result;
      // console.log("beforeChange的Promise执行完毕")
      await beforeChange_result.catch(() => {
        return;
      });
      await beforeChange_result.then(() => {
        emits("update:modelValue", val);
      });
    }

    // 非受控模式的前提就是没有绑定modelValue 所以非受控下的modelValue一直是false 也就一直关闭
    // const val = checked.value ? props.inactiveValue : props.activeValue;
    // console.log("switchVal", checked.value, val);
    //  如果没有的话直接

    // 但问题是我要改变值 所以应该返回相反的值吧
  };

  const is_PromiseOrBoolean = (result) => {
    if (result === undefined) {
      console.log("beforeChange函数的返回值不能为空");
      return false;
    }
    if (result instanceof Boolean || result instanceof Promise) return true;
    else return false;
  };
   watch(checked,()=>{
    emits('change')
   })
</script>
<style lang="scss" scoped>
  @import url("../css/switch.css");
</style>
