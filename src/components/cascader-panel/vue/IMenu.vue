<template>
  <!-- menu就是包裹住某一级选项的div v-for会根据有几级生成几个div
 menu不是每一个选项 -->
  <div :class="[ns.b('menu')]">
    <!-- menu是一个级别的菜单 他只需要渲染当前这个级别的内容即可 -->
    <node v-for="node in nodes" :node="node" >
      <!-- 为什么不在这里新增click方法 而是传递给子组件呢？ 首先要知道点击的是哪一个内容 最好的方法就是在node节点通过props获取 -->

      <!-- 对于每一个node来说 正常来讲应该都可以点击 除非他不是叶子结点
    那么接下来要判断当前node是不是叶子结点 如果不是叶子节点的话 那他就应该有一个方法
     直接在click方法当中判断是不是叶子结点 是的话执行展开 不是的话不展开 
-->
      <!-- 如何实现展开效果 其 -->
    </node>
  </div>
</template>
<script>
  import { defineComponent ,ref} from "vue";
  import node from "./node.vue";
  import { CascaderMenuProps } from "../js/menu";
  import { useNameSpace } from "@/utils/hooks/UseNameSpace/usenamespace";
  export default defineComponent({
    name: "IMenu",
    components: { node },
    props: { ...CascaderMenuProps },
    setup(props, { attrs, slots, emit }) {
      const ns = useNameSpace("cascader");
      return { ns };
    },
  });
</script>
<style lang="scss" scoped>
  @import "../css/Index.css";
</style>
