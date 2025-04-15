<template>
  <div :class="[ns.b('panel')]">
    <!-- 每一个级别的菜单都对应一个menu -->
    <IMenu v-for="subMenu in menus" :nodes="subMenu">
      <!-- 如何知道一共需要生成几级呢？ 根据options树最深的深度 n叉数遍历 每一棵树返回左右子树的最长长度+1 -->
      <!-- 如何实现展开效果？ 只需要获取点击的node 然后获取他的children push进menu即可
    因为vue是响应式的 menu是遍历menus生成一个div  所以push进来一个就会新增一个菜单页面
    1. 先给node添加一个点击事件 ---在IMenu新增点击事件
   然后就要考虑在已经展开了n级的时候，如果点击n-2级 那么后面的内容怎么处理 
   -->
    </IMenu>
    <!-- 问题出在了排版上 利用tooltip显示出一个弹框 然后在这个弹框里面 并排显示，每一次显示出的内容 也就是imenu应该加到后面去 而不是下面  用flex布局 -->
  </div>
</template>
<script>
  import IMenu from "./IMenu.vue";
  import { useNameSpace } from "@/utils/hooks/UseNameSpace/usenamespace";
  import { defineComponent, watch, ref, provide, computed } from "vue";
  import { CascaderProps, useCascaderConfig } from "../js/cascaderPanel";
  import Store from "../js/store";
  import Node from "../js/node";
  export default defineComponent({
    name: "Cascader",
    props: {
      // 这里写要接受的属性
      ...CascaderProps,
    },
    emits: ["change"],
    components: { IMenu },
    // setup有两个参数 第一个参数props 就是上面接受到的参数 第二个参数是上下文对象 有emit attrs slots
    setup(props, { emit, attrs, slots }) {
      const ns = useNameSpace("cascader");
      const config = useCascaderConfig(props.props); //config里面有expandTrigger的值
      //  console.log("config",config.value);
      const multiple = computed(() => config.value.multiple);
      const isHoverMenu = computed(
        () => config.value.expandTrigger === "hover"
      );
      // 然后将这个值传递给Node
      // 用来存储已经checked选中的Node,在单选模式下当选中其他Node 就会用到这个
      // 这个checked属性 是用来存储 最终被选中的那个Node 而不是一整个路径

      // checkedNodes在多选模式下应该是一个数组 所以这里不应该是null了
      const checkedNodes = ref([]);
      const checkedValue = ref(null);
      // 记录当前点击的要展开的节点
      // expandingNode在多选模式下应该是一个数组
      const expandingNode = ref(null);
      // menus的作用是 将每一级的菜单都以数组的形式存储在里面
      // menus=[[第一级数组]，[第二级数组]....]
      //  只有每次点击某一级数组开始扩展后 才会往menus中加入新的一级的数组
      const menus = ref([]);
      // 从props中解构除options
      let store = null;

      // initStore在最开始就应该调用 同时如果说options发生了变化也应该调用 所以说要用watch监听
      const initStore = async () => {
        const { options } = props;
        // console.log("options",options);

        // const cfg = config.value; //"value"
        store = new Store(options, config.value);
        // store.getNodes是获取到Node数组 可是Node数组里面只能知道有几个 不代表要渲染出几个div来吧
        // menus.value = [store.getNodes()];
        // console.log("initStore")
        // menu每次展开的时候都要根据 checkedNodes expandingNode渲染
        // 每次展开的时候都是重新渲染的 那uid是会变化的
        // expandingNode?.value&&ExpandNode(expandingNode.value)

        // -------------------------------------------
        // lazy懒加载：前提 使用懒加载的话 用户在最开始传递的options为空 只有在点击的时候才会加载
        // // 那如果要是一开始传递了一个默认值?在最开始不执行懒加载即可
        // if (config.value.lazy && options.length === 0) {
        //   // 首先lazyload使使用者自己定义然后传递进来的 我们要在里面使用这个lazyload
        //   // 要求lazyload方法要有两个参数 1.当前点击的node 以及then回调函数 就是说在lazyload方法中最好使用promise
        //   lazyLoad(undefined, (result) => {
        //     // promise执行完之后 会将结果提供给回调函数的参数中
        //     // 这里直接将获得到的nodes生成store
        //     store = new Store(result, config);
        //   });
        // }
        menus.value = [store?.getNodes()];

        // 在初始化时进行加载
        if (
          config.value.lazy &&
          (props.options.length === 0 || !!props.options)
        ) {
          // 如果当前要求是动态加载 但是用户提前定义传递了一个默认数据 有默认数据的情况下 不执行动态加载
          // 没必要 你都有默认数据了 干嘛还执行 所以options数组为空 或者options为undefined就不执行
          // 初始化的lazyLoad函数和点击node的lazyLoad是一个函数吗? 如果是我的话 会提供两个函数
          // 第一个函数是在初始化的时候调用的 所以没有node 第二个函数是点击node的时候调用的 所以会有参数node
          lazyLoad(null,()=>{
            // console.log("initial",store.getNodes());
            
            menus.value = [store?.getNodes()];
          });
          // 拿到dataList之后呢就对datalist进行处理 是一个对象数组 将其加入到store中去
          // store.appendNodes(initialDataList);
          // 更新menus
          // menus.value = [store?.getNodes()];
          // console.log("");
        }
      };
      // const initialLazyLoad = () => {
      //   const cfg = config.value;
      //   const resolve = (optionsData) => {
      //     // 将optionsData转变成node
      //     optionsData && store.appendNodes(optionsData);
      //     // store中就会有这些数据了 然后去更新menus
      //     menus.value = [store?.getNodes()];
      //   };
      //   cfg.initialLazyLoad(resolve);
      // };
      // 使用者创建的lazyLoad函数 实际上是要在组件中被调用的 同时 用户创建的lazyLoad有两个参数node 和 resolve回调函数
      // node是指当前用户点击的节点，而使用者是不可能通过代码指定node的，所以只能我们在内部 调用这个使用者创造的lazyLoad函数
      // 并将node传递给他
      // resolve是一个函数 该函数的作用是将获取到的options格式的数据转换成Node并且放到store中去
      // 也要同步其他expand checked的状态之类的

      // resolve是最小限度的更新 他的作用仅仅是见options加入到store中
      // 而视图中比如expanding checked等等的改变还需要另外操作 因此这个callback就是接收newOptionsList然后进行操作

      // 因为initialLoading和lazyLoading在获取完数据后对视图的修改不同 所以这里使用callback 让我们可以自定义对视图的修改
      // 在initaillazyloading中不需要node 而在点击Node后触发的lazyNode中是需要node的 所以在不需要node的情况下 生成一个空node 这样就不会报错
      const lazyLoad = (node, cb) => {
        // 这里的node是Node类型的节点 要将其传递给使用者的lazyload函数 我们会将node中包含的方法和属性提供在文档中
        const _config = config.value;
        const _node = node || new Node({}, _config, undefined,true);
        // const _lazyLoad = config.lazyLoad;
        // resolve的作用:将options_list保存在store中
        const resolve = (options_list) => {
          
          // options_list可以是一个对象 也可以是一个数组吧
          // 统一成数组
          // 当前点击的节点：可能为undefined
         
          // 思考问题: 懒加载的作用是什么？ 点击某一个节点 获取数据 把数据都加载点击节点的后面
          const parent = _node.root?null:_node;
          // console.log("OPTION",store);
          
          options_list && store?.appendNodes(options_list, parent);
          // 节流锁解开
          _node.loading = false;
          // 表明当前node可以直接点开 不用懒加载
          _node.loaded = true;
          // 这里为什么还要对当前点击的节点改变childrenData?
          // 意思是 在appendNode完毕之后_node.childrenData还是为空 那就设置他为空数组
          // _node.childrenData=_node.childrenData||[]
          // 更新视图
         
          (cb instanceof Function) && cb(node);
        };
        // 首先我们要在某一个地方去执行config.lazyload 将node传递给config.lazyload，然后执行第二个回调函数 得到options
        // 得到options后 就要执行我们内部定义的方法resolve 将options转换成Node并且更新视图
        // 在不同的地方这个resolve方法的执行内容可能是不一致的 要改变的东西不同
        // 所以为了实现各种地方都是自定义的 要在不同的地方创建不同的resolve方法
        // const resolve=(list)=>{}
        // const config.lazyload(props.node,resolve)
        // 为了调用方便 直接合成一个函数 const lazyload=(node,resolve)=>{config.lazyload(node,resolve)}
        _node.loading = true;
          
        _config.lazyLoad(node, resolve);
      };

      // 新增一个Expand方法只提供给node调用 接受node传递过来的信息 来控制之类的menus
      const ExpandNode = (node) => {
        //  首先要将当前点击的node level后面的所有menu都去掉
        //  怎么去掉呢？ 要知道当前node在第几级 给node新增一个level属性
        const { level } = node;
        // 然后对menus进行操作 把后面部分全删掉
        // 考虑到对menus直接操作 且多次操作会影响性能，所以将对menus的修改操作放到最后一次性进行
        const newMenus = menus.value.slice(0, level);
        // newExpandingNode 用于记录当前点击的展开的节点 因为expandingNode不保存叶子结点
        // 所以需要判断
        let newExpandingNode = null;

        // 这里要处理 expandingNode.value是一个数组而不是一个值 在单选模式下可以使用下面的方法
        // 但是在多选模式下就不一样了
        if (node.isLeaf) {
          // console.log("node.isLeaf");
          // 叶子结点不是expandingNode 所以记录叶子结点的上一个节点
          // 什么情况下 点击叶子结点也会触发expandNode？
          newExpandingNode = node.pathNodes[level - 2];
        } else {
          newExpandingNode = node;
        }
        if (expandingNode.value?.uid !== newExpandingNode?.uid) {
          // 如果当前展开的节点和之前展开的节点不同就更新
          // 为什么种类是直接等于node了？而不是等于newExpandingNode？
          // --------------------
          expandingNode.value = newExpandingNode;
        }
        // console.log("BeforeUpdate",newMenus);
        // 先获取到前面要保留的部分 然后再把要展开的部分的node加上去
        // 只有当前节点不是leaf 才会触发ExpandNode事件所以直接pushchildren

        newMenus.push(node.children);
        // 修改menus 视图就会自动更新了 利用数据控制视图
        menus.value = newMenus;
        // console.log("menus",menus.value.length,menus.value)
      };

      const getCheckedNodes = () => {
        return store.getFlattedNodes(true).filter((node) => node.checked);
        // 这里是在所有nodes中查找 checked=true的Node
      };

      // 这个函数是为了在新增节点或者删除节点后 还能保持原本的顺序
      // 但问题是 每次都从所有的leaf节点中查找checked=true的节点作为当前节点会不会耗费性能？
      // 1. 点击函数的时候可能会发生删除节点和新增节点的可能吗？
      // 2. 在多选模式下 选中非叶子节点时，会导致该Node的children中所有的叶子节点全被选中
      // 那这种情况下是如何触发checked方法？也是一个一个节点触发？还是另外有方法触发？
      // 因为是点击checkbox才出发的 而checkbox有一个点击方法handleSelectCheck =>然后直接触发handleCheck(check)方法
      // 传递checked(true/false)是为了判断是取消还是添加吧
      // 然后handleCheck函数会触发 doCheck和doExpand doExpand只会打开下一级的菜单 后续的菜单不可能全都打开
      // doCheck 会先判断当前节点有没有选中
      // 这里有个问题 非checkstrictly情况下 选中这个checkbox 要不要标checked？
      // 如果不用的话 那么该expandingNode.checked=false 此时选中checked为true
      // 两者不相等 就会触发后续函数
      // 但如果是再点击一次 取消掉的话 他俩相等 就不会触发后续函数了 那怎么去清空已经选中的值、？
      // 在multiple情况下的doCheck可能会走两个分支 第一个是直接this.checked=checked 当当前节点为叶子节点触发
      // 第二个是
      const sortByOriginalOrder = (oldNodes, newNodes) => {
        const newNodes_copy = newNodes.slice(0);
        const newIds = newNodes_copy.map((item) => item.uid);
        const res = oldNodes.reduce((acc, item) => {
          // 在newIds中找到
          const index = newIds.findIndex(item.uid);
          // 不是每一个原本的节点都能找到 当前可能是删除了某一个节点
          if (index > -1) {
            acc.push(item);
            newNodes_copy.splice(index, 1);
            newIds.splice(index, 1);
          }

          return acc;
        }, []);
        // 此时res中剩下的是原本的节点中 没有被取消选中的节点
        res.push(...newNodes_copy);
        return res;
      };
      const handleCheckedChange = (node, checked) => {
        // 这里要根据单选 多选以及checkstrictly进行修改
        // 首先在单元模式下会有一个值来保存已经选中的节点
        // 这里是针对单选情况下 只有一个元素
        const oldNode = checkedNodes.value[0];
        // 拿到这个节点后 要将该节点设置为false 在初始状态下oldNode是不存在的 因为没有任何Node被checked
        // 多选模式下也不能直接这样
        // console.log("multiple",multiple.value);

        !multiple.value && oldNode?.doCheck(false);
        // 当前选中的节点不管在什么模式下都要改变checked
        !multiple.value && node.doCheck(checked);
        // console.log("node.checked",oldNode?.checked,node.checked)
        // 新的问题 当完成点击后 在单选模式下 expandingNode和checkedNode不能同时出现在一个level的menu中
        // 所以当在视图中的这一棵树中点击了一个leaf后 要重新处理menus数据以及expand修改
        // expandingNode要变成checked.parent

        //传递node应该会触发node.isLeaf分支才对啊
        // ExpandNode(node)
        // 还要修改menu

        // 这里修改了ExpandNode
        // 再将当前节点保存为新的节点 单选模式下可以直接这样 多选模式下不行
        // 这里的话 针对两种情况 1.单选
        if (!multiple.value) checkedNodes.value = [node];
        else {
          // 多选情况
          // console.log("multiple");

          // 在多选情况下 如果反复点击同一个值 那么该值会被取消掉
          // 反正就是点击的时候不会看用户传递进来的参数 而是去看node.checked的值
          node.doCheck(!node.checked);

          const index = checkedNodes.value.findIndex(
            (item) => item.uid === node.uid
          );
          if (node.checked) {
            // console.log(1)
            // node.checked===false 原本没有被选中时天街节点
            // 如果当前是true说明是添加节点 重复点击会重复添加节点
            index === -1 && checkedNodes.value.push(node);
          } else {
            // console.log(2);

            index > -1 && checkedNodes.value.splice(index, 1);
          }
        }
        // 获取值 显示在input上
        // calculateCheckedValue();
        // 然后计算新的values
        szh_calculateCheckedValue();
      };
      const szh_calculateCheckedValue = () => {
        // 获取checkedValue
        const nodes_arr = checkedNodes.value;
        let FinalValues = "";
        if (nodes_arr.length === null) {
          checkedValue.value = FinalValues;
          return emit("change", checkedValue.value);
        }
        // 这里有问题 node.pathNodes不能直接使用node了
        // 直接用checkedNodes中的已有节点去重新计算一遍答案 然后放在一个数组中
        // const checkedNodePath = node.pathNodes;
        // 先不考虑checkedstrictly的情况 只考虑单选 去计算pathNodes组成的答案

        if (props.showAllLevels) {
          FinalValues = nodes_arr.map((node) => {
            return node.pathNodes.reduce((result, item, index) => {
              // 最后一个节点不需要加\
              if (index === node.pathNodes.length - 1) {
                result = result + item.value;
              } else result = result + item.value + "\\";
              return result;
            }, "");
          });

          // const res = checkedNodePath.reduce((res, node, index) => {
          //   if (index === checkedNodePath.length - 1) {
          //     res = res + node.value;
          //   } else res = res + node.value + "\\";
          //   return res;
          // }, "");
          // checkedValue.value = res;
        }
        // checkedValues是一个数组 单选模式下即使一个值
        else {
          FinalValues = nodes_arr.map((node) => {
            return node.value;
          });
        }
        checkedValue.value = FinalValues.reduce((result, string) => {
          return result + " " + string;
        }, "");

        emit("change", checkedValue.value);
      };
      const calculateCheckedValue = () => {
        // 有两种情况 1.只用显示leaf节点 2.显示整个路径(默认)
        // 显示整个路径 根据pathNodes
        // console.log("calculateCheckedValue");
        // -----------------------------------
        // const checkedNode = checkedNodes.value;
        // const checkedNodePath = checkedNode.pathNodes;
        // const res = checkedNodePath.reduce((res, node, index) => {
        //   if (index === checkedNodePath.length - 1) {
        //     res = res + node.value;
        //   } else res = res + node.value + "\\";
        //   return res;
        // }, "");
        // -----------------------------------
        // oldNodes是指原本选中的节点
        const oldNodes = checkedNodes.value;
        // newNodes是根据Node.checked在所有node中筛选出来的当前选中的节点
        const newNodes = getCheckedNodes();
        // 在最开始的时候oldNodes为空
        const nodes = sortByOriginalOrder(oldNodes, newNodes);
        checkedNodes.value = nodes;
        const values = nodes.map((node) => node.valueByOption);
        checkedValue.value = values;
        // ------------------------------------
        // emit("change", values);
        // res就是答案 然后显示出来 触发修改函数 使用emit
      };
      const clearCheckedNodes = () => {
        //  1. 清空checkedNodes
        checkedNodes.value.doCheck(false);
        checkedNodes.value = null;
        // 菜单栏不要全部展开  只剩下一个
        menus.value = menus.value.slice(0, 1);
        expandingNode.value = null;
        szh_calculateCheckedValue();
      };
      provide("CASCADERINDEX_INJECTION_KEY", {
        ExpandNode,
        expandingNode,
        handleCheckedChange,
        isHoverMenu,
        checkedNodes,
        config,
        lazyLoad,
      });
      watch(() => props.options, initStore, {
        immediate: true,
        deep: true,
      });
      return {
        ns,
        menus,
        clearCheckedNodes,
      };
    },
  });
</script>
<style lang="scss" scoped>
  @import "../css/Index.css";
</style>
