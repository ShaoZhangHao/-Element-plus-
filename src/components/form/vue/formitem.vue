<template>
  <div :class="formItemClasses">
    <!-- formItem 分成两部分 
        1. label 
        -->
    <div >
      <component :class="ns.e('label')" :is="'label'">
        <slot name="label">
          {{ currentLabel }}
        </slot>
      </component>
    </div>
    <!-- 2. Input表单组件 + Error错误提示 -->
    <div>
      <slot></slot>
      <TransitionGroup>
        <!-- 用户可以自定义Error样式 -->
        <slot v-if="shouldShowError" name="error">
          <div :class="validateClasses" name="Error">
            <!-- 默认情况下就是只显示字符串 -->
            {{ "errorMessage:" + validateMessage }}
          </div>
        </slot>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
  import {
    computed,
    inject,
    TransitionGroup,
    ref,
    provide,
    reactive,
    onMounted,
    toRefs,
  } from "vue";
  import { castArray } from "lodash";
  import { formItemProps } from "../js/formitem";
  import { useNameSpace } from "@/utils/hooks/UseNameSpace/usenamespace";
  // async-validator 在实例化时就要传递验证规则进去 验证规则可能会发生改变 所以用computed或者在使用的时候再new
  import AsyncValidator from "async-validator";
  // 实例化时接受一个对象descriptor 其中每一个key对应一个验证规则 key名要和 被验证的数据对象的key名相同
  // 那prop的作用是什么？prop的作用是在FormContext.rules中找到该规则 并且必须要和FormContext.model中的 也就是被验证的数据的名称相同
  // 因为 要将rules直接传递给validator 所以rules的key名=被验证的数据名 这个规矩不能变 所以prop只能与被验证的名称一样
  const props = defineProps(formItemProps);
  const ns = useNameSpace("form-item");
  const validateClasses = computed(() => [ns.e("error")]);

  const formContext = inject("formContextKey", undefined);
  // const validator=new AsyncValidator()
  const labelPosition = computed(
    () => props.labelPosition || formContext.labelPosition
  );
  const formItemClasses = computed(() => [
    //formitem的默认样式 el-form-item
    ns.b(),
    ns.is("error", validationState.value === "error"),
    {
      [ns.m(`label-${labelPosition.value}`)]: !!labelPosition.value,
    },
  ]);
  const validationState = ref("");
  // validateMessage的值是validator 验证错误的时候 将rules中的message传递给validateMessage
  const validateMessage = ref("");
  const shouldShowError = computed(() => {
    // 先默认当前是必须要显示error
    return validationState.value === "error";
  });
  // state的值只有四个 '' || 'validating' || 'error' || 'success'
  const currentLabel = computed(() => {
    // 接收一个字符串 作为label的值
    return props.label;
  });
  // 指的该FormItem内包裹的Input组件绑定的值
  const fieldValue = computed(() => {
    const model = formContext?.model.value;
    // 如果props.prop不存在 那FormItem就不知道内部的Input组件对应的数据是哪个了
    // 如果是我的话 我估计会直接给formItem设置一个fieldName属性 然后传递到内部组件作为name
    if (!model || !props.prop) return;
    return model[props.prop];
  });

  // FormItem会从Form.rules中 根据props.prop(规则名)在Form.rules中找到对应的rule
  // 然后将validate函数添加到Form组件中去 在click或者其他什么时候触发

  // 1. 只考虑当前组件 根据trigger触发方式触发
  // (1)表单校验规则获取 先从父组件获取

  // (2)然后得到当前formitem的rule
  const normalizedRules = computed(() => {
    const rules = [];
    // 从formContext.rules中 根据prop找到名称
    const formRules = formContext.rules.value;
    // console.log("formrules", formContext.rules.value);

    // formRules可能为undefined
    if (formRules && props.prop) {
      // 只有两者都存在的时候 才会从form.rules中根据prop找到对应的规则
      const _rules = formRules[props.prop];
      // 即使formRules和prop存在 但是使用者没有给prop设定rule 所以_rules会为undefined
      if (_rules) {
        // 假设_rules可以是数组 也可以是一个对象 解决办法： 将其转换成数组再解构
        rules.push(...castArray(_rules));
      }
    }
    return rules;
  });
  // (3)利用这个规则以及async-validator去编写一个调用async-validator的validate函数
  const validate = () => {
    // 根据验证的结果去做不同的事情
    return doValidate();
  };
  const propString = computed(() => {
    //默认props.prop为字符串
    return props.prop ? props.prop : "";
  });
  const doValidate = () => {
    // 创建validator 根据rules进行验证 并将验证的结果promise返回出去
    // 1. 获取当前FormItem对应的数据名---prop 如果要求验证prop是必须的
    const modelValue = propString.value;
    // 然后创建一个modelValue:rules的对象
    const descriptor = {
      [modelValue]: normalizedRules.value,
    };
    const validator = new AsyncValidator(descriptor);
 
    return validator
      .validate({ [modelValue]: fieldValue.value })
      .then(() => {
        // console.log("验证成功", normalizedRules.value);

        onValidateSuccessed();
      })
      .catch((err) => {
        // console.log("验证失败");
        onValidateFailed(err);
      });
  };
  const setValidationState = (state) => {
    validationState.value = state;
  };
  const onValidateFailed = ({ errors, fields }) => {
    setValidationState("error");

    validateMessage.value = errors
      ? errors?.[0]?.message ?? `${props.prop} is required`
      : "";
  };
  const onValidateSuccessed = () => {
    setValidationState("success");
  };
  const clearValidate = () => {
    // 清空验证消息
    // 1.validation状态修改为''
    setValidationState("");
    validateMessage.value = "";
  };
  const context = {
    ...toRefs(props), //prop
    validate,
    clearValidate,
    validationState,
  };
  onMounted(() => {
    // 将当前formItem下的validate函数全都交给Form组件 由Form组件统一去触发
    if (props.prop) {
      // 生成prop:rules对象
      formContext.addField(context);
    }
  });

  // validate是触发函数 应该传递给Input组件去触发
  provide("formItemContextKey", context);
</script>

<style lang="scss" scoped>
  @import "../css/formitem.css";
</style>
