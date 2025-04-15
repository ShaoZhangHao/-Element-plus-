<template>
  <!-- node就是一个li 然后将内容显示出来 -->
  <li
    :class="nodeClass"
    :tabindex="-1"
    @mouseenter="handleHoverExpand"
    @click="handleClick"
  >
    <!-- 给每个li增加hover样式 -->
    <span>{{ node.label ? node.label : "" }}</span>
    <!-- <template > -->
    <!-- 当对象或者数组使用ref变成响应式的时候 其内部的数据也会变成深层次响应的，
      内部的引用类型元素也会被Proxy包裹 但是不用使用.value去访问 
      -->
    <template v-if="!isLeaf">
      <Icon
        v-if="node.loading"
        :class="ns.is('loading')"
        type="ios-loading"
      ></Icon
    ></template>
    <!-- 添加一个动画 让他转起来 使用animation 只能使用animation 因为他不需要触发 而且可以一直循环 -->

    <!-- </template> -->
    <!-- <button @click="_try">button</button>{{ node.loading }} -->
  </li>
</template>
<script>
  import { defineComponent, computed, inject } from "vue";
  import Radio from "@/components/radio/radio.vue";
  import Node from "../js/node";
  import { useNameSpace } from "@/utils/hooks/UseNameSpace/usenamespace";
  import { Icon } from "view-ui-plus";
  export default defineComponent({
    props: {
      //接收一个node
      node: Node,
    },
    components: { Icon },
    setup(props, { attrs, slots, emit }) {
      // console.log("Node.vue", props.node);
      const isLeaf = computed(() => props.node.isLeaf);
      const isDisabled = computed(() => props.node.isDisabled);
      // 为什么这里还要一个expandable呢？
      // 非叶子结点或者没有显式禁用 expandable=true 表示可以展开

      const {
        ExpandNode,
        expandingNode,
        handleCheckedChange,
        isHoverMenu,
        checkedNodes,
        config,
        lazyLoad,
      } = inject("CASCADERINDEX_INJECTION_KEY");
      const ns = useNameSpace("cascader-node");
      const loading = computed(() => node.loading);
      const nodeClass = computed(() => {
        return [
          ns.b(),
          ns.is("checked", props.node.checked),
          ns.is("disabled", !expandable.value),
          isInExpandingPath.value && "in-active-path",
          isInCheckedPath.value && "in-checked-path",
        ];
      });
      const expandable = computed(() => !isDisabled.value);
      const doCheck = (checked) => {
        const { node } = props;
        handleCheckedChange(node, checked);
      };
      const doExpand = () => {
        // 进行判断 如果禁用的话 不会执行
        ExpandNode(props.node);
      };
      const doLoad = () => {
        // console.log(Object.prototype.toString.call(lazyLoad));
        // console.log("doLoad");

        lazyLoad(props.node,(node)=>{
          ExpandNode(node)
        });
      };
      const handleClick = () => {
        // console.log("leaf",!isLeaf.value&&
        // !config.value.checkStrictly);

        // 不能使用的前提是非叶子结点 checkstrictly的前提下 所有节点都是叶子结点可以触发该函数
        //  为什么要添加一个hovermenu判断？在触发方式为hover时 因为本来就有一个hover函数会展开节点了
        // 如果同时再出发click函数会造成重复

        // 但是在lazy模式下 且是hover模式下 点击最后一个节点
        if (isHoverMenu.value && !isLeaf.value) return;
        // console.log("node click",isLeaf.value)
        // 首先要判断有没有孩子节点 使用者可能使用了children属性但是不一定有传递内容
        // 1.没有children肯定是子节点 判断是否是子节点在Node class中写
        if (!isLeaf.value && !config.value.checkStrictly) {
          // console.log("leaf",props.node.loaded);
          // 当checkstrictly为false时 非叶子结点只会执行expand

          //非叶子结点 利用当前节点的信息 去触发expand事件
          // expand就是根据点击的node的children 添加/替换掉menus对应level的数据并把后面的所有内容全都清空掉
          props.node.loaded ? handleExpand() : doLoad();
        } else {
          // console.log("checkstrictly");

          // 如果是叶子结点 要去改变node.checked 如果其他leaf节点已经被选中了 还要取消那个节点的checked值
          // 现在这里的 叶子结点 或者 checkStrictly都会执行这里
          handleCheck(true);
        }
      };
      const handleHoverExpand = () => {
        // 如果触发方式不是hover isHoverMenu=false
        // 叶子结点不能通过hover展开
        if (!isHoverMenu.value || isLeaf.value) return;
        handleExpand();
      };
      const handleCheck = (checked) => {
        // 如果当前checked和node.checked相同就不要管
        if (checked === props.node.checked && !config.value.multiple) return;
        doCheck(checked);
        // 当展开到n+1 level的menu时 点击了n-1 level menu中的leaf节点 要将后面的已经展开的menu全部关闭
        doExpand();
      };
      const handleExpand = () => {
        // 如果禁用的话 不允许展开
        if (!expandable.value) return;
        // 将当前节点传送出去 node和index中间差了一个menu 所以用provide和inject来对menus进行操作最方便
        doExpand();
      };
      // 参数node要么是checkedNode要么是ExpandingNode 都是从index.vue父组件中传递进来的
      // 然后判断当前节点是否在上面两种节点的路径上
      const isInPath = (ExpandingNode) => {
        // 查看当前节点是否在答案节点的路径上
        // console.log("isInpath Expandingnode",node?.pathNodes.length);
        // console.log("isInPath props.node",props.node)
        // 展开的节点可能为空
        const { level, uid } = props.node;
        // 在最开始展开的时候是没有expandingnode 为null
        // 当前点击的节点是第一个面板的 pathNodes中 1-1的话就是它本身
        // console.log("isInPath",node?.pathNodes.length,node?.value);
        // node->expandingnode 在最开始没有点击任何node时为null所以不会有pathNOdes
        // 当点击了第n level node的时候会展开孩子节点n+1level 而判断是根据前n个level中判断 所以childrenNode.level-1会不存在于expandingnode.pathnodes中
        // 所以也要用？ 如果为空 直接返回undefined不会报错
        return ExpandingNode?.pathNodes[level - 1]?.uid === uid;
      };
      // expandingNode会在点击展开的时候去更新
      const isInExpandingPath = computed(() => {
        // 在最开始没有点击的时候 expandingNode为空
        // console.log("isinexpandingpath",expandingNode.value);

        return isInPath(expandingNode?.value);
      });
      const isInCheckedPath = computed(() => {
        return checkedNodes.value.some(isInPath);
      });
      // 设置active样式 Node还需要一个属性checked 用来记录自己本身是否被选中了
      // 或者通过数据驱动 给每一个node加上一个active样式 并通过记录数字判断是否生效 只要popperVisible变为false 就清空数组
      // 或者在Expand方法中 根据Expand添加子节点的方法去修改点击数组

      return {
        handleClick,
        nodeClass,
        handleHoverExpand,
        loading,
        isLeaf,
        ns,
      };
    },
  });
</script>
<style lang="scss" scoped>
  @import "../css/cascader.css";
</style>
