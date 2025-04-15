<template>
  <tooltip
    ref="tooltipRef"
    :visible="popperVisible"
    effect="light"
    :persistent="true"
    :popper-options="popperOptions"
    placement="bottom-start"
    pure
  >
    <!-- 级联选择器是否用到了单例模式？ 首先接收options后要怎么将其渲染成指定的样式-->
    <!-- 这里使用之前封装好的input表单元素 -->
    <!-- 只读的 -->
    <!-- 当点击触发器外面的时候 也应该触发toggle 将isFocused变回去 -->
    <div
      v-clickoutside:[contentRef]="() => togglePopperVisible(false)"
      style="width: max-content"
      :class="[nsCascader.b()]"
      @mouseenter="inputHover = true"
      @mouseleave="inputHover = false"
      @click="togglePopperVisible(undefined)"
    >
      <elInput
        v-model="inputValue"
        :class="InputClass"
        style="width: 200px"
        :_readonly="_readonly"
      >
        <template #suffix>
          <!-- 需要一个后缀ICON 就是一个上下箭头 用来表示是否展开了级联选择器 -->
          <Icon
            v-if="clearIconVisible"
            type="ios-close-circle-outline"
            @click.stop="handleClear"
          >
            <!-- 点击这个ICON的时候不应该触发togglePpper -->
          </Icon>
          <Icon v-else-if="!popperVisible" type="ios-arrow-up"> </Icon>
          <Icon v-else type="ios-arrow-down"> </Icon>

          <!-- clearable icon -->
        </template>
      </elInput>
    </div>
    <!-- cascader只需要接收一个插槽给tooltip作为触发器即可 因为他的content是已经设定好的 不能自定义的 -->
    <template #content>
      <!--要给他传输options   -->
      <CascaderPanel
        ref="cascaderPanelRef"
        :options="options"
        :props="_props"
        :showAllLevels="showAllLevels"
        @change="changeInputValue"
        @click.stop="() => togglePopperVisible(true)"
      ></CascaderPanel>
    </template>
  </tooltip>
</template>
<script setup>
  import { Icon } from "view-ui-plus";
  import tooltip from "../tooltip/tooltip.vue";
  import CascaderPanel from "../cascader-panel/vue/index.vue";
  import elInput from "@/components/input/input.vue";
  import { cascaderProps } from "./cascader";
  // import { vOnClickOutside } from '@vueuse/components'
  import { ClickOutside as vClickoutside } from "@/directives/click-outside";
  import { ref, computed, onMounted, nextTick, watch, unref } from "vue";
  import { useNameSpace } from "@/utils/hooks/UseNameSpace/usenamespace";
  const props = defineProps(cascaderProps);
  const _props = props.props;
  const nsCascader = useNameSpace("Cascader");
  const tooltipRef = ref();
  const inputValue = ref();
  const inputHover = ref(false);
  const cascaderPanelRef = ref(null);
  const _readonly=computed(()=>!props.filterable)
  const clearIconVisible = computed(() => {
    // 要显示出来有两个条件 1.使用者明确了可以清空 2.当前鼠标hover在了上面 3.有内容
    return (
      props.clearable &&
      inputHover.value &&
      !!unref(inputValue) &&
      unref(inputValue).length !== 0
    );
  });
  const handleClear = () => {
    // 清空input的内容 1.清空inputValue 2.清空checked和expandingNode
    // checked和expandingNode去监听value 如果为空那么将自己也设置为空
    // 只有当value变化的时候才会触发
    cascaderPanelRef.value.clearCheckedNodes();
  };
  const popperOptions = ref({
    name: "arrowPosition",
    fn(args) {
      const { placement, middlewareData, elements } = args;
      // 在arrow定位后执行该中间件
      // 不能返回空对象这里必须要返回 并且返回的值可以通过middlewareData被之后的中间件访问
      if (["bottom", "top", "left", "right"].includes(placement)) return {};
      // 直接修改某个中间件返回的数据
      middlewareData.arrow.x = 35;
      return {};
    },
  });
  const changeInputValue = (newVal) => {
    inputValue.value = newVal;
  };
  const contentRef = computed(() => {
    return tooltipRef.value?.popperRef.contentRef;
  });
  // 使用tooltip的受控模式 用popperVisible数据来控制显示和隐藏 同时要调和本来的控制方法
  const popperVisible = ref(false);

  const togglePopperVisible = (visible = undefined) => {
    // 切换的时候也要去修改input的focus情况

    if (visible === undefined) {
      popperVisible.value = !popperVisible.value;
    } else {
      popperVisible.value = visible;
    }
  };
  // inputClass是由popperVisible控制的 现在要求是点击content内部也会保持popperVisible为true
  const InputClass = computed(() => {
    return nsCascader.is("focus", popperVisible.value);
  });
  // 默认情况下都是关闭的
  // const toggleArrowDirection = (visible = undefined) => {
  //   // 1. popperVisible在初始时应该控制arrow的方向 ,最开始没有点击outside 所以visible为undefined
  //   visible = visible ?? !popperVisible.value;

  //   // 要求反复点击内部可以实现显示和隐藏---因为默认内部的点击事件是一直保持开启
  //   // 所以要通过visible来实现变化
  //   // popperVisible=!popperVisible
  //   // 每次点击内部的时候触发该函数 就会导致popperVisible变化

  //   // 点击外部的时候强制关闭 如果visible有传递数据 那就让popperVisible变成false
  //   // arrow也根据PopperVisible变化
  //   // 要求点击外面的时候强制隐藏

  //   console.log("visible", visible);
  //   // 再次点击的时候 popperRef应该也一起变化才对
  //   // 当clickoutside的时候 visible为false 此时应该去控制popperVisible也变成为false
  //   // 首先根据visible强制让图标变化
  //   if (visible !== popperVisible.value) {
  //     popperVisible.value = visible;
  //   }
  //   // popperVisible.value = visible;
  //   // 这样就会保持一致然后关上  但是popperVisible一开始就设置为false 然后点击是不会改变popperVisible的
  //   // 然后如果等我点击outside 他不会自动关闭 要将popperVisible也设置为false,但是他本来就是false
  //   // 所以不会触发watch就不会关闭了
  //   if (visible) {
  //     // 为true说明打开
  //     arrow.value = "ios-arrow-down";
  //   } else {
  //     arrow.value = "ios-arrow-up";
  //   }

  //   // 如果用户没有传递visible 那就根据上一次的结果变化 那还需要一个值来保存上一次的结果
  // };

  // input的样式应该和popperVisible是同步的 所以才出发toggle的时候也要去修改input的is-focus
  // 如何修改呢？ input会暴露出一个focus和blur函数 根据poppervisible去调用对应的值
</script>
<style lang="scss" scoped>
  @import "../css/cascader.css";
</style>
