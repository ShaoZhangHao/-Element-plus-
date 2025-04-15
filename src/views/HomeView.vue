<template>
  <!-- <RadioGroup v-model="rad" name="hello"> -->
  <!-- <Radio v-model="rad" actual-value="1" name="hello">option1</Radio>
    <Radio v-model="rad" actual-value="2" name="hello">option2</Radio> -->
  <!-- </RadioGroup> -->

  <!-- <div style="position:relative">
    <div><button>222</button></div>
    <div>200</div>
    <div>300</div>
    <div ref="divRef" style="position: absolute; "><button>222</button></div>
  </div> -->
  <!-- <div>
<div class="try">11</div>
<div class="try2">22</div>
</div> -->
  <!-- <button ref="triggerRef">virtual Trigger</button> -->
  <!-- <Button ref="ButtonRef">虚拟触发器</Button> -->
  <!-- <div style="position: relative; left: 50px; top: 50px">
    <tooltip
      enterable
      teleported
      append-to="body"
      placement="top"
      :trigger-ref="triggerREF"
    >
      <template #content>multiple lines<br />second line</template>
      <Button>test</Button>
    </tooltip>
  </div> -->
  <!-- <button @click="ToggleEvent1">click</button> -->
  <!-- <div>
    <cascader :show-all-levels="false"  :props="props" clearable>
      <button>cascader</button>
    </cascader>
  </div> -->
  <!-- <Input v-demo></Input> -->
  <!-- <div
    ref="div1"

    style="width: 200px; border: 1px solid black; height: 30px"
  ></div> -->

  <!-- <button ref="referenceRef" id="button" @click="toggle">Button</button>
  <Transition

    ><div v-show="open" ref="floatingRef" id="tooltip" role="tooltip">
      Tooltip
    </div></Transition
  > -->
  <!-- <Form
    ref="ruleFormRef"
    :inline="true"
    :model="model"
    :rules="rules"
    status-icon
  >
    <FromItem :label="'测试'" prop="name" :label-position="'left'">
      <Input v-model="model.name" style="width: max-Content"></Input>
    </FromItem>
    
    <FromItem :label="'单选'" prop="checkedValue" :label-position="'left'">
      <RadioGroup name="radio" v-model="model.checkedValue">
        <Radio :actual-value="1">1</Radio>
        <Radio :actual-value="2">2</Radio>
        <Radio :actual-value="3">3</Radio>
        <Radio :actual-value="4">4</Radio>
      </RadioGroup>
    </FromItem>
    <FromItem>
      <Button type="success" @click.prevent="handleCheck(ruleFormRef)"
        >验证</Button
      >
      <Button plain :native-type="'reset'">重置</Button>
      <Button plain @click.prevent="handleReset(ruleFormRef)">重置</Button> -->
  <!-- </FromItem>
  </Form> -->
  <!-- <button-group type="primary" size="small">
    <Button>default</Button>
    <Button type="primary" >default </Button>
    <Button type="success" >success</Button>
    <Button type="danger"> danger</Button>
    </button-group
  >
  <button-group type="primary" size="large">
    <Button>default</Button>
    <Button type="primary" >default </Button>
    <Button type="success" >success</Button>
    <Button type="danger"> danger</Button>
    </button-group
  > -->
  <!-- <Rate
    v-model="degree"
    :icons="['ios-checkmark', 'ios-loading', 'ios-close']"
  ></Rate> -->
  <!-- <Switch v-model="bool"> -->
  <!-- <div style="width: 10px">
    <Icon type="ios-star"></Icon>
  </div> -->
  <!-- <div style="width: 20px;border: 1px solid black;">
  <div></div>
</div> -->
  <!-- </Switch> -->
  <!-- <Switch v-model="unbool" active-action-icon="ios-checkmark" inactive-action-icon="ios-close"></Switch> -->
  <!-- <Switch v-model="bool" inline-prompt active-text="close" inactive-text="open"></Switch> -->
  <!-- 
  <Input
  ref="inputref"
    v-model="val"
    style="width: 240px; margin-left: 20px"
    :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
    placeholder="Please Input"
  ></Input> -->
  <div class="KG" style="border:1px solid black;padding: 10px;">
    <p>请输入文本：</p>
    <textarea
      name=""
      id=""
      style="width: 250px; margin-right: 10px; margin-left: 20px"
    ></textarea>
    <p>
      ------------------------------------------------------------------------
    </p>
    <p>请选择文件：</p>
    <input type="file" />
    <Button>知识图谱生成</Button>
  </div>

    <div class="KG" style="display:inline-flex; height: 50px;align-items: center; margin-top: 30px; border:1px solid black;padding: 10px">
      <p>请选择知识图谱:</p>
      <cascader></cascader>
      <Button>知识图谱补全</Button>
    </div>
    <!-- <Button>知识图谱补全</Button> -->
 
  <!-- <Button text type="success">按钮</Button>
  <div
    tabindex="-1"
    :class="['el-div', { 'el-div-focus': isFocused }]"
    @focus="isFocused = true"
    @blur="isFocused = false"
  >
  <div style="border:1px solid black;height: 20px;" >我是内部方块 </div>
    <input type="text" class="el-div__input" />
  </div> -->
  <!-- <input type="checkbox" ref="iinput" /> -->
  <!-- <button ref="iibtn" @click="changechecked">修改checked</button> -->
  <!-- <Radio v-model="boolsss" actual-value="2">False</Radio> -->
</template>
<script setup>
  import buttonGroup from "@/components/button-group/button-group.vue";
  import FromItem from "@/components/form/vue/formitem.vue";
  import Form from "@/components/form/vue/form.vue";
  import cascader from "@/components/cascader/cascader.vue";
  // @ is an alias to /src
  // import HelloWorld from '@/components/HelloWorld.vue'
  import tooltip from "@/components/tooltip/tooltip.vue";
  import RadioGroup from "@/components/radio/radioGroup.vue";
  import Switch from "@/components/switch/switch.vue";
  import Radio from "@/components/radio/radio.vue";
  import Button from "@/components/button/button.vue";
  import Input from "@/components/input/input.vue";
  import { Icon } from "view-ui-plus";
  import Rate from "@/components/rate/rate.vue";
  import { ref, watch, onMounted, nextTick, computed, unref } from "vue";
  const rad = ref();
  const boolsss = ref(false);
  const iinput = ref();
  const iibtn = ref();
  const bools = ref(true);
  const changechecked = () => {
    iinput.value.checked = bools.value;
    bools.value = !bools.value;
  };
  watch(
    rad,
    (newVal) => {
      console.log("rad", newVal);
    },
    { immediate: true }
  );
  const isFocused = ref(true);
  const rad2 = ref(2);
  // import { createPopper } from "@popperjs/core";
  // import
  const vDemo = {
    mounted(el, binding) {
      console.log("binding", binding.instance);
    },
  };
  const position = ref({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  });
  const triggerRef = ref({
    getBoundingClientRect() {
      return position.value;
    },
  });
  const visible = ref(false);

  const mousemoveHandler = (e) => {
    position.value = DOMRect.fromRect({
      width: 0,
      height: 0,
      x: e.clientX,
      y: e.clientY,
    });
  };
  onMounted(() => {
    document.addEventListener("mousemove", mousemoveHandler);
  });
  const val = ref("321");
  const degree = ref(2);
  const bool = ref(true);
  const unbool = ref(false);
  // const inputvalue = ref("")
  // const handleFocus = () => {
  //   console.log("div focus");
  // };
  // const div1 = ref();
  // watch(div1,(el)=>{
  //   el.setAttribute("tabindex",-1)
  //   console.log("watchdiv1focus");

  // })
  // onMounted(() => {
  //   nextTick(()=>{
  //     div1.value.addEventListener("focus", handleFocus);
  //   })

  // });
  import { useFloating } from "@floating-ui/vue";
  import { unrefElement } from "@vueuse/core";
  const referenceRef = ref();
  const ruleFormRef = ref();
  const floatingRef = ref();
  const open = ref(false);
  const options = [
    {
      label: 1,
      value: 1,
      // disabled:true,
      children: [
        { value: "child1", label: "child1" },
        { value: "child2", label: "child2" },
      ],
    },
    {
      label: 2,
      value: 2,
      children: [
        {
          value: "child3",
          label: "child3",
          children: [
            { value: "child6", label: "child6" },
            { value: "child7", label: "child7" },
          ],
        },
        { value: "child4", label: "child4" },
      ],
    },
  ];
  const fo = () => {
    console.log("focus");
  };
  const handleCheck = async (formEl) => {
    // console.log("1");
    if (!formEl) return;
    await formEl.validate();
  };

  const handleReset = (formEl) => {
    formEl?.clearValidate?.();
    console.log("model", model.value);
  };
  const model = ref({
    name: "",
    checkedValue: "",
  });
  const rules = {
    name: { required: true, message: "该信息不能为空" },
    checkedValue: { required: true, message: "请必须勾选一个" },
  };
  const initialLazyLoad = (resolve) => {
    setTimeout(() => {
      // console.log("options",options);
      resolve(options);
    }, 500);
  };
  const loading1 = ref(false);
  const loading2 = ref(false);
  const beforeChange1 = () => {
    loading1.value = true;
    return new Promise((resolve) => {
      setTimeout(() => {
        loading1.value = false;

        return resolve(true);
      }, 1000);
    });
  };

  const beforeChange2 = () => {
    loading2.value = true;
    return new Promise((_, reject) => {
      setTimeout(() => {
        loading2.value = false;
        return reject(new Error("Error"));
      }, 1000);
    });
  };
  const lazyLoad = (node, resolve) => {
    // 这里有问题 initialLazyLoad和LazyLoad应该是共用一个内容的
    // console.log("config.lazyload",node);
    if (!node) {
      // 如果node不存在
      setTimeout(() => {
        // console.log("options",options);
        resolve(options);
      }, 500);
    }
    // 利用setTimeout 根据node.value +"child"
    else
      setTimeout(() => {
        const _options = {
          label: node.label + ".child",
          value: node.label + ".child",
        };
        resolve(_options);
      }, 1000);
  };
  const props = {
    expandTrigger: "click",
    lazy: true,

    // disabled(data,node){
    //   if(data.value===2)return true
    //   return false
    // }
    initialLazyLoad,
    lazyLoad,
  };
  const divRef = ref();

  const handleInput = (value) => {
    console.log("在input中输入文字触发input事件返回的value", value);
    console.log("v-model绑定内容", inputvalue.value);
  };
</script>
<style lang="scss">
  .el-div {
    border: 1px solid black;
    padding: 10px;
    display: inline-block;

    // .el-div__input{
    //   border:none
    // }
  }
  .el-div-focus {
    border: 1px solid red;
  }
  .KG {
    width: 500px;
    margin-left: 30px;
  }
  // @import "../css/global_var.css";
  .el-popper-content.is-customized {
    /* Set padding to ensure the height is 32px */
    --el-popper-content-bg-color: linear-gradient(
      90deg,
      rgb(159, 229, 151),
      rgb(204, 229, 129)
    );
  }

  // .el-popper.is-customized .el-popper__arrow::before {
  //   background: linear-gradient(45deg, #b2e68d, #bce689);
  //   right: 0;
  // }
  .el-button .custom-loading .circular {
    margin-right: 6px;
    width: 18px;
    height: 18px;
    animation: loading-rotate 2s linear infinite;
  }
  #button {
    position: relative;
    left: 150px;
  }
  #tooltip {
    background: #333;
    color: white;
    font-weight: bold;
    padding: 4px 8px;
    font-size: 13px;
    border-radius: 4px;
    width: max-content;
  }
  #arrow,
  #arrow::before {
    position: absolute;
    width: 8px;
    height: 8px;
    background: inherit;
  }

  #arrow {
    visibility: hidden;
  }

  #arrow::before {
    visibility: visible;
    content: "";
    transform: rotate(45deg);
  }
  #tooltip[data-popper-placement^="top"] > #arrow {
    bottom: -4px;
  }

  #tooltip[data-popper-placement^="bottom"] > #arrow {
    top: -4px;
  }

  #tooltip[data-popper-placement^="left"] > #arrow {
    right: -4px;
  }

  #tooltip[data-popper-placement^="right"] > #arrow {
    left: -4px;
  }

  .el-button .custom-loading .circular .path {
    animation: loading-dash 1.5s ease-in-out infinite;
    stroke-dasharray: 90, 150;
    stroke-dashoffset: 0;
    stroke-width: 2;
    stroke: var(--el-button-text-color);
    stroke-linecap: round;
  }

  .v-enter-active,
  .v-leave-active {
    transition: opacity 0.5s ease;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  }
</style>
