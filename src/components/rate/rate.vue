<template>
  <div :class="[ns.b(), ns.is('disabled', disabled)]" role="slider">
    <span
      v-for="(item, index) in max"
      ref="RateIcon"
      :class="ns.e('item')"
      :style="rateStyle"
      @mousemove="setCurrentValue(item, $event)"
      @mouseleave="resetCurrentValue(item)"
      @click="selectValue(item)"
    >
      <div :class="ns.e('icon')">
        <!-- <label :class="[ns.is('active', currentValue)]"> -->
        <template v-if="!showDecimalIcon(item)">
          <!-- {{showDecimalIcon(item)}} -->
          <Icon
            name="undecimalicon"
            :type="item <= currentValue ? activeIcon : voidIcon"
            :class="[
              { hover: item === hoverIndex },
              ns.is('active', item <= currentValue),
            ]"
          ></Icon>
        </template>
        <template v-else>
          <!-- {{ showDecimalIcon(item) }} -->
          <!-- 新增dsiabled小数模式 实现voidIcon和DecimalActiveIcon重叠在一起 -->

          <Icon
            name="voidIcon"
            :type="voidIcon"
            :class="[ns.em('decimal', 'box'), { hover: item === hoverIndex }]"
          >
            <!-- 禁用模式下当前Icon的样式和平常的样式一样即可 但是没有hover和active -->
          </Icon>
          <Icon
            name="DecimalIcon"
            :style="DecimalStyle"
            :class="[
              { hover: item === hoverIndex },
              ,
              ns.e('decimal'),
              ns.is('active'),
            ]"
            :type="activeIcon"
          >
            <!-- 首先如何实现小数的样式？--利用width和overflow：hidden实现 不能使用flex 否则宽度是从两边同时扩张或者缩减 -->
            <!-- 同时DecimalIcon也是属于activeIcon的 颜色也要跟随activeColor一起变化
         -->
          </Icon>
          <!-- 考虑allowHalf样式 首先allowHalf和disabled一样都是使用小数Icon 
        但是不能直接在showDecimalIcon上用allowHalf来决定使用小数Icon，因为真正决定当前Icon是否使用小数样式是根据currentValue的值决定的 
        -->
        </template>
      </div>
    </span>
    <!-- {{ item<=currentValue }} -->

    <span v-if="showText || showScore" :class="ns.e('text')">{{ text }}</span>
  </div>
</template>
<script setup>
  import { ref, computed, nextTick, onMounted, watch } from "vue";
  import { Icon } from "view-ui-plus";
  import { rateEmits, rateProps } from "./rate";
  import { useNameSpace } from "@/utils/hooks/UseNameSpace/usenamespace";
  import { isObject } from "@vue/shared";
  // import { is } from "core-js/core/object";

  const props = defineProps(rateProps);
  // console.log("color", props.colors);
  const emits = defineEmits(rateEmits);
  const ns = useNameSpace("rate");
  const text = computed(() => {
    let result = "";
    if (props.showScore) {
      result = props.scoreTemplate.replace(
        /\{\s*value\s*\}/,
        currentValue.value
      );
    }else if(props.showText){
      // 如果要求展示文本
      result=props.texts[currentValue.value-1]
    }
    return result;
  });
  const RateIcon = ref();
  //  根据currentValue的值小于等于lowthreshold时候 小于highthreshold的时候是一个颜色 大于highthreshold的时候是最后一个颜色
  // 首先根据item<=currentValue来判断是否激活 然后根据highthreshole
  // onMounted(() => {
  //   let rateIcons = RateIcon.value;
  //   // 拿到数组 然后遍历
  //   watch(currentValue, () => {
  //     for (let num = 0; num < props.max; num++) {
  //       if (num <= currentValue.value) {
  //         // console.log(num,rateIcons[num])
  //         // rateIcons[num].classes.push("is-active");
  //         nextTick(()=>{
  //           console.log("---", RateIcon.value[4].children);
  //         })

  //       }
  //     }
  //   },{deep:true});
  // });
  /* 生成一个Icon数组 数组的长度为max 然后每一个元素都是{"is-active"}*/
  // const _in = ref(1);
  const cursorAtLeft = ref(false);
  const currentValue = ref(props.modelValue);
  const hoverIndex = ref(-1);
  // hoverIndex是必须要的 因为如果用currentValue===item去代替hoverindex挂载hover样式
  // 当用户点击了一个icon之后 currentValue会永远等于该item 所以即使鼠标没有hover在icon上，这个icon也会有hover样式
  // const selectedValue=ref(-1)
  // currentValue是指鼠标当前悬浮的样式
  // 如果点击了一个图标之后 就要记录下这个index 当鼠标不在上面的时候 就使用这个index来渲染
  // 当鼠标上去之后就覆盖掉这个样式
  const is_Half = computed(() => {
    // computed是有缓存的 如果最终值不变是不会去计算的，首先在移动过程中cursorAtleft会变
    // 且两个判断条件在移动过程中是等价的，只有在默认情况下不等价
    // console.log("is_half",cursorAtLeft.value ||
    //   (currentValue.value - Math.floor(currentValue.value) <= 0.5 &&
    //     currentValue.value !== Math.floor(currentValue.value)))
    let ishalf =
      cursorAtLeft.value ||
      (currentValue.value - Math.floor(currentValue.value) <= 0.5 &&
        currentValue.value !== Math.floor(currentValue.value));
    return ishalf;
    // 在鼠标移动过程中 cursorAtLeft会优先生效，且在allowHalf的模式下 mousemove的时候currentValue只有0.5和整数两种
    // 且cursorAtLeft和currentValue是同步变化的,如果在left 那么后面这个判断条件就会生效 在左边的话后面这个判断条件就不会生效
    // 当鼠标不在ICON上的时候 会将currentValue赋予初始值 这样is_half就有生效了
  });
  // is_half用来记录当前鼠标是否位于Icon的前面一半
  // watch(()=>props.modelValue,(newVal)=>{
  //   console.log("props.modelValue",newVal);
  // })
  // watch(is_Half,(newVal)=>{
  //   console.log("is_Half",newVal);

  // })
  const setCurrentValue = (index, event = null) => {
    // console.log("span",event)
    if (props.disabled) return;
    if (props.allowHalf && event) {
      // allowHalf的情况下
      // 当前Icon是否为小数 要根据鼠标的位置来判断
      let target = event.target;
      if (event.target.classList.contains(`${ns.e("item")}`))
        target = target.querySelector(`.${ns.e("icon")}`);
      if (event.target.classList.contains(`${ns.e("decimal")}`))
        target = target.parentNode;
      cursorAtLeft.value = event.offsetX * 2 < target.clientWidth;
      // console.log(event.target.tagName,target,cursorAtLeft.value);

      // console.log("cursor",cursorAtLeft.value)
    }
    nextTick(() => {
      // currentValue是否要修改呢？ currentValue会影响到showDecimalIcon函数的值 所以要一起修改
      // 否则 如果currentValue不改变的话，那就在mousemove的过程中一直为正数 showDecimalIcon也就一直为false了
      currentValue.value = cursorAtLeft.value ? index - 0.5 : index;
      // console.log("mousemove", currentValue.value);
      hoverIndex.value = index;
    });
  };
  const selectValue = (index) => {
    if (props.disabled) return;

    let val = cursorAtLeft.value ? index - 0.5 : index;
    // console.log("clearable", props.clearable, val);
    if (props.clearable) {
      val = val === props.modelValue ? 0 : val;
      val === 0 ? (currentValue.value = 0) : undefined;
      // console.log("val",val)
      // 将activeIcon换成voidIcon
    }
    if (props.modelValue !== val) emits("change", val);
    emits("update:modelValue", val);
  };
  const resetCurrentValue = (index) => {
    if (props.disabled) return;
    // 离开的时候 重新将currentValue赋值为小数
    currentValue.value = props.modelValue;
    cursorAtLeft.value = false;
    hoverIndex.value = -1;
  };

  // const getValueFromMap = (value, map) => {
  //   // 首先value必须得是数字类型的
  //   if (value instanceof Number || value instanceof String) {
  //     value = +value;
  //     const isExcludedObject = isObject(map);
  //     // 将value转换成数字 然后检查map是否是一个可以包含excluded属性的对象还是一个普通的字符串
  //     const matchedKeys = Object.keys(map)
  //       .map(() => (key = +key))
  //       .filter((key) => {
  //         const val = map[key];
  //         // exclude的作用是决定当前阈值下标的Icon是否为该颜色
  //         const excluded = isExcludedObject(val) ? val.excluded : false;
  //         return excluded ? value < key : value <= key;
  //       }).sort((a,b),a-b);
  //       // 获得map中的所有阈值，咋混换成数字 然后过滤 返回value<key的key 或者valeu<=key的key 具体根据exclude决定
  //       // 可以不使用exclude
  //       const matchedValue=map[matchedKeys[0]]
  //       // 然后只要匹配上的第一个key？
  //       return (isExcludedObject(matchedValue) && matchedValue.value) || matchedValue

  //   }
  // };
  const getValueFromMap = (value, map) => {
    // 1. 首先判断Map是不是一个对象 如果只有一个颜色的话就没必要了可以直接返回
    if (!isObject(map)) return map;
    else {
      // 判断currentValue是不是一个数字 因为用户使用v-model绑定的时候可能传错了
      if (+value instanceof Number) {
        throwError("value不能为非数字或者不能转换成数字的字符串");
      } else {
        // 根据currentValue和threshold的大小判断 返回对应的颜色 和key进行对比
        const matchedkeys = Object.keys(map)
          .map((key) => +key)
          .filter((key) => {
            // Object.keys会将key转换成字符串 所以还要转换回去
            // 然后一个一个key进行对比 看看当前key是否小于等于currentValue 然后倒序排序 获取最大的那个值
            // 首先当前key可能会有exclude属性
            let is_object = isObject(map[key]);
            // 判断当前key对应的值是一个颜色字符串 还是一个对象 如果是对象就要从value属性中获取值
            // 如果是对象 就要看有没有exclude属性 然后根据这个属性改变当前的判断条件
            let has_exclude = is_object ? map[key].exclude : false;

            // 当然即使是object 用户也可能没有填写exclude
            // 如果没有has_exclude的话 那就是
            return has_exclude ? value < key : value <= key;
          })
          .sort((a, b) => {
            a - b;
          });
        // console.log("in get value", value, matchedkeys);

        // console.log("1111",colorMap.value[2])
        return isObject(map[matchedkeys[0]])
          ? map[matchedkeys[0]].value
          : map[matchedkeys[0]];
      }
    }
  };

  const colorMap = computed(() => {
    // 用户使用的时候如果没有传递三个值的话 只有两个值的话 或者一个值的话怎么办
    return Array.isArray(props.colors)
      ? {
          [props.lowThreshold]: props.colors[0],
          [props.highThreshold]: { value: props.colors[1], exclude: true },
          [props.max]: props.colors[2],
        }
      : props.colors;
    // 如果不是数组说明只有一个颜色 那么icon只要在active的时候挂载_color就可以了
  });
  // elementUI为了实现边界的开闭 就是当currentValue.value=threshold的时候 究竟是否要选择该阈值对应的颜色 还是等currentValue>threshold时才能选择该颜色
  // 因此引入了exclude属性
  const activeColor = computed(() => {
    // 阈值的作用就是根据currentValue是否大于阈值来决定是否要使用该阈值对应的颜色作为当前所有activeIcon的颜色
    // 比如 当前currentValue<=lowthreshold 那么就从用户传入的color数组中获取到对应的color 然后赋给Icon
    //  已经有了colorMap了 现在要根据currentValue的值来判断使用colorMap中的哪一个颜色
    const color = getValueFromMap(currentValue.value, colorMap.value);
    // console.log("active_color", currentValue.value, color);
    return color;
  });
  const rateStyle = computed(() => {
    // 主要就只有颜色变化 所以只需要挂载--el-rate-fill-color：color即可
    return { "--el-rate-fill-color": activeColor.value };
  });
  // DecimalValue直接用在宽度上 因为小数部分放大了100倍 所以可以直接用%
  const DecimalValue = computed(() => {
    // console.log(
    //   "---",
    //   props.modelValue * 100,
    //   Math.floor(props.modelValue * 100)
    // );
    return props.modelValue * 100 - Math.floor(props.modelValue) * 100;
  });
  // console.log(DecimalValue);

  const DecimalStyle = computed(() => {
    // DecimalIcon触发的时候
    let width = "100%";
    let color = activeColor.value;
    if (props.disabled) width = `${DecimalValue.value}%`;
    else if (is_Half.value) width = "50%";

    return {
      width,
      color,
    };
  });

  const showDecimalIcon = (item) => {
    // showDecimalIcon方法是针对每一个Icon单独判断的
    // 当前Icon是否要显示为小数状态 要根据modelValue的值是否小于当前Icon的index且大于上一个index
    // 只有在只读的情况下才行
    if (props.disabled) {
      let is_decimal = props.modelValue < item && props.modelValue > item - 1;
      // console.log(
      //   "is_decimal",
      //   props.modelValue < item,
      //   props.modelValue > item - 1
      // );
      return is_decimal;
    } else if (props.allowHalf) {
      // 那么如何知道当前Icon是不是需要显示小数样式的Icon呢？ currentValue是0 0.5 1
      //
      return currentValue.value <= item - 0.5 && currentValue.value > item - 1;
    } else return false;
  };
  // 允许半选择应该和禁用时允许小数一起用showDecimalIcon，在禁用的情况下允许半选没有用
  // 因为半选是用在非禁用时的

  // 最后一个activeIcon是否要使用decimal样式 是由is_half决定的
  // 在默认情况下 通过currentValue的小数部分在0-0.5之间还是0.5-1之间来决定是否显示完整的样式
  // 那么在一开始进入的时候就要进行判断了 currentValue.value-Math.floor(currentValue.value)<=0.5
  // 这里可以使用watch或者使用computed计算属性监听 但是不能一开始就设置默认值
  // 然后在鼠标移动过程中 会现根据currentValue指向哪个index决定最后的activeIcon，
  // 然后再在这个Icon上 根据鼠标的位置决定是否要使用decimal样式 还是使用完整的样式 最后一个activeIcon只有两种样式 0或者100%
  // 一个是通过鼠标的位置来决定是否使用且鼠标的位置只能在mouse事件中获取，

  // voidIcon 用户可以输入一个Icon字符串 在选择不同阈值的时候将activeIcon换成对应的样式
  // voidIcon如果是String直接拿来用，如果是数组就根据currentValue的不同以及是否超过阈值来选择使用对应的Icon作为activeIcon
  const icons = computed(() => {
    if (Array.isArray(props.icons)) {
      return props.icons[0];
    } else return props.icons;
  });

  const iconsMap = computed(() =>
    Array.isArray(props.icons)
      ? {
          [props.lowThreshold]: props.icons[0],
          [props.highThreshold]: { value: props.icons[1], exclude: false },
          [props.max]: props.icons[2],
        }
      : props.icons
  );
  const activeIcon = computed(() => {
    if (Array.isArray(props.icons)) {
      // 就要根据阈值选择了
      return getValueFromMap(currentValue.value, iconsMap.value);
    } else return props.activeIcon;
  });
  defineExpose({
    setCurrentValue,
    resetCurrentValue,
  });
</script>
<style lang="scss" scoped>
  @import url("../css/rate.css");
</style>
