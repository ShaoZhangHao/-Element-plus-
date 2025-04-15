<template>
  <div
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    :class="containerKls"
  >
    <!-- 前缀插槽 -->
    <div v-if="$slots.prepend" :class="nsInput.be('group', 'prepend')">
      <slot name="prepend"></slot>
    </div>
    <div ref="wrapperRef" name="wrapper" :class="wrapperKls">
      <!-- 可以通过两方面实现前缀icon 第一个是通过父组件绑定prefix-icon属性传值 第二个是通过插槽传值 -->
      <div v-if="$slots.prefix || prefixIcon">
        <!-- 这部分用于用户自定义插槽图标 -->
        <slot name="prefix"> </slot>
        <!-- 这部分用于接受父组件传递的值来渲染样式 -->
        <Icon v-if="prefixIcon" :type="prefixIcon"></Icon>
        <!-- 这两个只能显示其中一个 并且用户使用的prefix插槽的优先更高 -->
      </div>
      <!-- 为什么需要div:因为需要再input前面或者后面添加图标 比如x和搜索图标 -->
      <!-- .el-input__inner -->
      <input
        ref="RefInput"
        :type="showPassword ? (_showPwdVisible ? 'password' : 'text') : 'text'"
        :class="nsInput.e('inner')"
        :disabled="disabled"
        :maxlength="inputMaxLength"
        :minlength="minlength"
        :placeholder="placeholder"
        :autofocus="autofocus"
        :readonly="_readonly"
        @input="handleInput"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
        @blur="handleblur"
        @focus="handleFocus"
        @change="handleChange"
      />
      <!-- input原生的maxlength属性会受到formatter的影响 没有满的时候就不让输入了，但如果我一定要输入呢？
          首先 formatter将value格式化后会多出n个字符 而nativeInputValue只有x个字符
           所以n-x就是多出来的字符 所以要在input的maxlength的基础上 + n-x 并且动态变化即可 10+7-x 而且得是动态变化的 
         -->
      <!-- 使用clearable 只有当用户使用了clearable属性的时候才出现 -->
      <!-- clearable出现有两种情况 用户使用了clearable且用户在input中输入了内容才会出现 -->
      <!-- 需要一个盒子来显示长度  -->
      <div v-if="showWordLimit">
        <!-- 只显示maxlength不显示minlength -->
        <span>{{ `${nativeValueLength}/${maxlength}` }}</span>
      </div>
      <span v-if="SuffixVisible">
        <span v-if="$slots.suffix">
          <!-- 用于放后缀内容 -->
          <slot name="suffix"></slot>
        </span>
        <span v-if="showClear">
          <Icon
            @click="clear"
            :class="(nsInput.e('icon'), nsInput.e('clear'))"
            type="md-close"
          ></Icon>
        </span>
        <span v-if="showPwdVisible" @click="SwitchPwdVisible_fn">
          <!-- 除了前面两个条件 还需要有第三个条件来配合使用 -->
          <!-- 只有当 使用了type=password 且有内容的时候才为true -->
          <Icon :type="_showPwdVisible ? 'md-eye' : 'md-eye-off'"></Icon>
          <!-- {{ showPwdVisible }}
         <Icon type="md-eye"></Icon> -->
        </span>
        <span :class="nsInput.e('validateIcon')" v-if="showValidateIcon">
          <!-- 用于显示表单验证状态 -->
          <Icon :type="validateIcon"></Icon>
        </span>
      </span>
    </div>
    <div v-if="$slots.append" :class="nsInput.be('group', 'append')">
      <slot name="append"></slot>
    </div>
  </div>
</template>
<script setup>
  import {
    computed,
    inject,
    nextTick,
    onMounted,
    ref,
    shallowRef,
    useSlots,
    watch,
  } from "vue";
  import { inputProps, InputEmits } from "./input";
  import { useNameSpace } from "@/utils/hooks/UseNameSpace/usenamespace";
  import { useCompositionLock } from "@/utils/hooks/useCompositionLock";
  import { Icon } from "view-ui-plus";
  import { useEventListener } from "@vueuse/core";

  const props = defineProps(inputProps);
  // console.log("readonly", typeof props.readonly);
  // 只读的情况下 鼠标样式不应该是输入状态 并且当前input框可以被选中 针对是否被选中应该还要有对应的边框样式
  const emits = defineEmits(InputEmits);
  const nsInput = useNameSpace("input");
  const RefInput = ref("");
  const formContext = inject("formContextKey", undefined);
  const formItemContext = inject("formItemContextKey", undefined);
  // 判断是否需要返回clear标签 因为当有内容的时候需要展示 没有内容的时候就不需要展示
  // 这需要去监听input的content的内容 当然 input的内容会动态绑定到一个便来那个上 只需要去监听这个变量有没有值即可
  const validateIcon = computed(() => {
    // 监听validateState的变化 可能为空 来自inject
    const validationState = formItemContext?.validationState?.value;
    // console.log("validateIcon");
    // 首先不用管validationState='' 只要设置这个时候不渲染即可 只要考虑 error和success
    if (validationState === "error") {
      return "ios-close-circle-outline";
    } else if (validationState === "success") {
      return "ios-checkmark-circil-outline";
    } else return "";
  });
  const showValidateIcon = computed(() => {
    // 1. 当validateState为''的时候不会显示 2.使用者在form中使用了status-icon
    // console.log(!!formItemContext.validationState.value);

    return (
      formItemContext?.validationState?.value && formContext.statusIcon.value
    );
  });
  const nativeInputValue = computed(() => {
    if (props.modelValue === null || props.modelValue === undefined) {
      return "";
    } else {
      return String(props.modelValue);
    }
  });

  // ---------------div元素默认是无法聚焦的 但是设置tabindex后就可以通过点击触发聚焦事件
  // focus input选项框在聚焦和非聚焦的时候 边框颜色是不一样的 并且是要求点击边框内的任意地方 都相当于聚焦
  // 然后点击其他地方就不是聚焦
  // 所以利用input的focus是不行的 要另外写一个变量isFocus来判断当前是否被选中了
  // 初始值可以是被选中 也可以是没被选中 如果被选中的话 那么input也要聚焦
  // 没被选中的话就不要聚焦input 相当于受控模式 用一个值来决定视图 视图反过来决定isFocus

  // target 是input元素 当点击wrapper的时候要让他聚焦
  // useFocusController主要是处理对wrapper的点击和聚焦事件的

  // 现在有个问题 点击wrapper的时候会获得焦点 但是点击wrapper中的其他元素不会获得焦点
  // 所以现在要求input被选中的时候 isFocused也会改变
  const useFocusController = (target, { JudgebeforeFocus, afterBlur }) => {
    // 在函数内使用ref绑定组件也是会生效的
    const wrapperRef = ref();
    const isFocused = ref(false);
    // 因为wrapperRef一开始是空 然后才绑定的DOM或者组件 所以这个watch一定会触发
    // 为什么watch没有变化？
    watch(wrapperRef, (el) => {
      // 然后给wrapper元素的tabindex设置为-1 这样就可以通过点击触发wrapperRef的focus事件
      el.setAttribute("tabindex", -1);
    });
    // 实现点击函数 当点击wrapper时 让内部的input被聚焦
    // 当点击wrapperRef元素的时候 让input获得焦点
    // 为了节省防止被事件冒泡所影响 这里要判断一下点击事件的触发点
    // 因为el-input的template中 wrapper内部 只有input是可以被聚焦的 所以如果input已经被聚焦了 那就不用管了 直接return

    const handleClick = () => {
      if (
        wrapperRef.value !== document.activeElement ||
        wrapperRef.value.contains(document.activeElement)
      )
        return;
      // 如果聚焦的元素不是wrapper 就不理
      target.value?.focus();
    };
    // 还有实现focus的样式
    // 当wrapper被聚焦的时候
    // 还要加一个是否聚焦的判断 如果是在disabled情况下是无法被聚焦的
    // 为什么这里聚焦还要用一个isFocused呢 首先div通过点击就可以实现聚焦
    // 但是是否聚焦的核心在于内部的input 如果内部的input是禁用状态的话 那么这个时候还是直接通过div:focus来
    // 控制聚焦的样式的话就会出问题 所以要用isFocused来控制聚焦样式
    const handleFocus = (event) => {
      if (JudgebeforeFocus(event)) return;
      isFocused.value = true;
    };
    const handleblur = (event) => {
      isFocused.value = false;
      // console.log("blur");

      afterBlur();
    };
    useEventListener(wrapperRef, "focus", handleFocus);
    useEventListener(wrapperRef, "click", handleClick);
    useEventListener(wrapperRef, "blur", handleblur);
    return { wrapperRef, isFocused, handleFocus, handleblur };
  };
  // 这里拿到isFocused 给wrapper新增样式
  // 注意 在函数中创建ref是无法和组件绑定的 必须要return到函数外才会和组件绑定
  const { wrapperRef, isFocused, handleFocus, handleblur } = useFocusController(
    RefInput,
    {
      JudgebeforeFocus() {
        return props.disabled;
      },
      // 在blur后触发的函数
      afterBlur() {
        // 默认为true表示是否开启验证
        if (props.validateEvent) {
          // FormItem组件中传递过来的是一个reatcive
          formItemContext?.validate?.();
        }
      },
    }
  );

  const wrapperKls = computed(() => {
    return [nsInput.e("wrapper"), nsInput.is("focus", isFocused.value)];
  });

  const SuffixVisible = computed(() => {
    const slots = useSlots();
    // return !!slots.suffix || showClear || showPwdVisible;
    return true;
  });

  const handleChange = (e) => {
    emits("change", e.target.value);
  };
  const _ref = computed(() => RefInput.value);
  const showClear = computed(() => {
    // 显示出clear符号的前提 用户使用了clearable 且 有内容
    return props.clearable && nativeInputValue.value;
  });
  // _ref是计算属性，当input的内容变化的时候 _ref.value就会跟着变化

  // 这个用于切换 眼睛的样式和内容
  let _showPwdVisible = ref(true);
  const SwitchPwdVisible_fn = () => {
    _showPwdVisible.value = !_showPwdVisible.value;
  };
  const showPwdVisible = computed(() => {
    // console.log("showPwdVisible", !!nativeInputValue.value);
    return !!nativeInputValue.value && props.showPassword;
  });

  // 设置value的长度 不能是input元素里的value 因为里面格式化后包含, 必须得是modelValue
  const nativeValueLength = computed(() => {
    return nativeInputValue.value.length;
  });

  // 长度发生变化 如果是clear和input的话 直接在对应的时间里面去更新

  const inputMaxLength = computed(() => {
    const input = RefInput.value;
    const length = input.value ? input.value.length : 0;
    // console.log("inputmaxlength", parseInt(props.maxlength), Actual_inputValueLength.value, nativeInputValue.value)
    return parseInt(props.maxlength) + length - nativeInputValue.value.length;
  });

  // ||运算有返回值 返回的并不全是true和false 而是返回为真的那一部分的值
  // 这里是一个计算属性 接收父组件的值
  // 首先 用户输入是在input上输入的 要将输入的内容传递给父组件使用updatev-model绑定的变量上
  // 父组件绑定的变量是modelValue 父子通讯 子组件用emit触发父组件触发的Update:modelValue事件
  // 然后update:modelvalue就会自动修改modelvalue
  // 所以在子组件中 必须要去接收input输入的内容
  // 在input上使用v-model的话 :modelvalue是用于将js中的值传递到视图上
  // update是用来将视图上的内容传递给绑定的变量的
  // 那么 我在视图上改变内容 会传递给js 那为什么js不会触发更新视图？只需要判断一下是否相等即可
  const handleInput = (e) => {
    // @input事件监听 input表单元素的输入 去监听内容
    // 从e中获取输入的值
    if (
      (!props.formatter && props.parser) ||
      (props.formatter && !props.parser)
    ) {
      console.log("必须要同时设置formatter和parser");
      return;
    }
    let value = e.target.value;
    // 如果当前正在使用中文输入法 input就会触发compositionstart和end事件 改变isComposing 直到输入完毕
    if (isComposing.value) return;
    // formatter 格式化
    // composition
    // 在父组件中 可以通过v-model给传递一个初始值或者其他值给该组件
    // 该组件通过props.modelValue接收 然后modelvalue变成nativeInputType.value
    if (props.parser) value = props.parser(value);
    if (value === nativeInputValue.value) {
      // 但是input事件是每输入一个字都会触发的 如果nativeInputTypeValue有很多字的话
      // 那么即使最终结果相同 那也一定不同
      // 我的做法是添加一个防抖函数
      return;
    }
    // 输入键盘的时候会触发handleInput事件 然后触发emits更新外面的modelValue绑定的变量 然后props就会接受到新的modelValue值 然后就会触发计算属性nativeValue
    // 然后watch就会监听到nativeValue发生变化 就会触发setnativeValue函数去将input内部的元素全部重新格式化一遍 然后赋给input
    // 赋给input会触发handleInput事件，啊？
    // 父组件可以使用v-model绑定一个变量 然后把el-input当做一个普通的input表单元素
    // 那么v-model绑定的变量X 在用户在视图上输入内容后 X也应当改变 所以还要触发父组件的update:modelValue事件
    // 他这里有个问题 就是使用中文输入法的时候 在输入法中输入的文字也会触发input事件
    emits("update:modelValue", value);
    // 然后要输入的值返回到父组件上绑定的值 要触发父组件的input事件
    // 父组件肯定会给子组件绑定一个@input事件 把当前组件当做一个普通的input表单元素 然后监听输入事件 根据输入的内容执行一些操作
    // 所以我们要做的就是将内容返回回去
    emits("input", value);
  };
  const { isComposing, handleCompositionStart, handleCompositionEnd } =
    useCompositionLock(handleInput, emits);
  const containerKls = computed(() => {
    return [
      // 生成一个.el-input
      nsInput.b(),
      nsInput.is("disabled", props.disabled),
    ];
  });
  const clear = function () {
    //   console.log("clear")
    // 只需要触发父组件的update:modelValue 就可以将外面v-model绑定的变量值设为null
    // 那么里面的内容要怎么变成null？
    emits("update:modelValue", "");
    // 原本的clear方法究竟是怎么将内容也清空掉的？
    // input元素的内容也应该删除
    // console.log(RefInput.value)
    // RefInput.value.value=""
    emits("clear", "");
    //  inputRef.value.value=""
  };
  // formatter是将输入的内容格式化
  // 首先用户可以通过v-model绑定一个变量X 变量X可以有值
  // 然后Input组件通过modelValue接收到X后将modelValue的内容赋值给nativeValue
  // setNativeInputValue的作用是将nativeValue也就是modelValue的值显示在input上也就是视图上
  // 然后这里获取到一个formatter函数 对

  const setNativeInputValue = () => {
    const input = _ref.value;
    // 问题应该出在这里 props.formatter() 会重复对格式化过的内容再次格式化 所以说 第一次格式化后已经有$了 再次格式化后又有一个$生成
    // 问题就在于 不应该对格式化过的内容再次格式化 而是对输入的最原始的那个数据进行格式化
    // 也就是说不能使用input.value 因为input.value一定是格式化过的内容 而nativeValue 也就是要保证外面modelValue的值不是格式化过的 所以在handleInput中要使用parser来解决该问题
    // 只有type是text的时候才能工作 非text的时候不会工作
    const formatterValue =
      props.formatter && props.type === "text"
        ? props.formatter(nativeInputValue.value)
        : nativeInputValue.value;
    // 拿到了input元素实例
    // 然后将内容改变
    // console.log("input",_ref.value)
    if (!input || input.value === formatterValue) return;
    input.value = formatterValue;
  };
  // 监听nativeInputValue的变化 只要props传递进来的modelValue变化了就会去重新设置input中显示的元素
  watch(
    nativeInputValue,
    () => {
      setNativeInputValue();
    },
  );
  onMounted(()=>{
    setNativeInputValue()
  })
  // 监听nativeInputValue有变化的话就触发setNativeInputValue 去修改内容 这样可以省去clear和赋初始值

  // 接收父组件传递的

  const blur = () => RefInput.value?.blur();
  const focus = async () => {
    await nextTick();
    RefInput.value?.focus();
  };
  defineExpose({
    // 供用户使用的一些方法 因为用户无法使用原生方法
    // 将input DOM元素返回出去
    RefInput,
    blur,
    focus,
    // 是否是使用中文输入法的composing状态
    isComposing,
  });
</script>
<style scoped>
  @import url("../css/input.css");
</style>
<!--  首先 clear触发update:modelValue事件 将父组件给子组件绑定的v-model绑定的变量清空
  然后v-model绑定的变量X 会通过props 属性modelValue传递到子组件内部
  计算属性nativeInputValue会监听modelValue变量 并且返回空字符串或者modelValue的值 
 到这里 modelValue已经改了一个名了 叫做nativeInputType 同时因为clear的关系 所以nativeType.value=""
  -->
<!-- 也只有这个函数会修改input表单元素的value -->
<!-- 那什么时候会触发这个函数？ 主动清空input会触发 -->
<!-- const setNativeInputValue = () => {
  const input = _ref.value
  _ref.value得到的是input表单元素实例 这个函数将input的内容设置为nativeInputValue.value
  const formatterValue = props.formatter
    ? props.formatter(nativeInputValue.value)
    : nativeInputValue.value
  if (!input || input.value === formatterValue) return
  input.value = formatterValue
} -->
