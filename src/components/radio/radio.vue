<template>
  <label
    :class="[
      ns.b(),
      // 禁用
      ns.is('disabled', disabled),
      ns.is('checked', modelValue == actualValue),
      // 这里使用label应该是方便控制文字的样式
    ]"
  >
    <!-- input的type有一个radio的属性 可以变成一个单选按钮 被渲染成一个小圆圈  -->
    <!-- 多个单选按钮通过设置相同的name值 来实现只能点击其中一个的效果 所以要记得设置value值-->
    <!-- 同时input属性在提交的时候会将value值一起提交上去 所以要记得设置value值 否则只会提交一个name:on的键值对-->
    <!-- input要有三种状态 默认情况下 禁用情况下和被选中的情况下 -->
    <!-- 原本我的想法是 点击inputradio 然后视图上就变了 同时再利用change事件将选中的值发送出去给modelValue
           但是这里直接将v-modelValue绑定了 可以吗？不是不能改变props的值吗
        -->
    <span
      :class="[
        ns.e('input'),
        ns.is('disabled', disabled),
        ns.is('checked', modelValue === actualValue),
      ]"
    >
      <input
        :class="ns.e('original')"
        v-model="modelValue"
        :value="actualValue"
        :checked="modelValue === actualValue"
        :name="name"
        :disabled="disabled"
        type="radio"
        @click.stop
        @change="handleChange"
      />

      <span :class="ns.e('inner')"></span>
    </span>
 
    <!-- 这里的modelValue是改过的 改成了get set完整计算属性 -->
    <!-- 当modelValue=checkValue的时候 表示当前按钮被选中，通过修改v-model的值来决定选中那个
             但是用户是通过视图直接点击input函数的 点击input的时候 也应该去修改modelValue吧 -->
    <!-- radio选中一个后无法取消 checkbox是可以取消的 -->
    <!-- input type=radio 只会渲染出一个小圆圈 想要文字还要有对应的label -->
    <span>
      <label :class="ns.e('label')"><slot>{{ "默认值" }}<</slot></label>
    </span>
  </label>
</template>
<script setup>
  import { nextTick, watch, computed, inject } from "vue";
  import { radioGroupKey } from "./constants.js";
  import { props, emitEvent } from "./radio.js";
  import { useNameSpace } from "@/utils/hooks/UseNameSpace/usenamespace";
  const prop = defineProps(props);
  const emit = defineEmits(emitEvent);
  // 拿到之后要渲染样式 只有一种默认样式
  const ns = useNameSpace("radio");
  const radioGroup = inject(radioGroupKey, undefined);
  // console.log("radioGroup", radioGroup.name.value);
  const name=computed(()=> radioGroup?.name?.value|| prop.name )
  const modelValue = computed({
    get() {
      // 这里可以是prop的modelValue 也可以是group传递进来的value 所以要先用inject接受
      // 这里应该是radioGroup
 
      return radioGroup?.modelValue.value || prop.modelValue;
    },
    set(val) {
      // 这里改变有两种方向 第一种是当前modelValue是来自radioGroup的 第二种是直接来自radio的
      // console.log("set", val);
      if (!!radioGroup) {
        radioGroup.changeModelValue(val)
      }
      // 这里要改变的事件也不应该是update了 父组件应该传递一个修改modelValue的函数进来
      else emit && emit("update:modelValue", val);
    },
  });
  const handleChange = () => {
    // 触发改变事件 返回前一个选中的值和现在选中的值

    nextTick(() => {   
      emit("change", modelValue.value);
    });
    // modelValue.value 是外面传递进来的值  那里面change了之后 外面也不会改变吗？
  };

</script>
<style scoped>
  @import url("../css/radio.css");
</style>
