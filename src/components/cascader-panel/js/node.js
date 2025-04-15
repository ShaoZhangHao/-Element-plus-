// 首先使用者会按照格式传递一个options数据进来
// {value: children: label:} 最基本的就是这三个内容 而children又是一个数组 数组里面的每一个也是这样的对象

export const isEmpty = (val) =>
  // 这里!val是为了判断val是否为null或者undefined 但是!0也会被判断为true但是0是一个合法的值
  // 所以这里val!==0是为了排除掉0
  (!val && val !== 0) ||
  (Array.isArray(val) && val.length === 0) ||
  (val instanceof Object && !Object.keys(val).length);

const calculatePathNodes = (node) => {
  const nodes = [node];
  //  利用parent节点和unshift方法创造路径
  let { parent } = node;
  while (parent) {
    // console.log("parent",parent.value);
    nodes.unshift(parent);
    parent = parent.parent;
  }
  // console.log("calculatePathNodes", node.value, nodes.length);

  return nodes;
};
// 这里有一个公共变量 每创建一个Node这里都会++保证变量不会重复
let uid = 0;
export default class Node {
  // 这里在Node的prototype上定义了一个loaded 没有赋值之前他一直都是undefined
  loaded;
  // 节流lock 表明当前节点正在加载中
  loading = false;
  constructor(data, config, parent, root = false) {
    // 每一个Node的唯一标识 用于判断两个Node是否相等 不能直接用Node=Node
    this.uid = uid++;
    // value 和label属性有可能使用者没有绑定 包括children也一样 可能没有chidren属性
    this.data = data;
    this.root = root;
    this.config = config;
    this.value = data.value ? data.value : "";
    this.label = data.label ? data.label : "";
    this.children = [];
    this.childrenData = data["children"];
    this.parent = parent;
    // console.log("constructor loaded",this.loaded
    this.level = this.root ? 0 : parent ? parent.level + 1 : 1;
    this.pathNodes = calculatePathNodes(this);
    // console.log(this.pathNodes.length);
    this.pathValues = this.pathNodes.map((data) => data.value);
    if (data.hasOwnProperty("children") && Array.isArray(data.children)) {
      // children有两种可能 一个是数组 一个是Object 要求只能是数组
      //   尽量不要对原本的数据进行操作，而是copy一份 使用forEach 然后往里面推
      this.childrenData = data.children;
      data.children.forEach((child) => {
        this.children.push(new Node(child, config, this));
      });
    }

    // loaded属性的意思并不是能否加载 而是能不能使用动态加载 根据handleExpand方法
    // 可以看到 点击节点时 要根据当前节点的 loaded属性去决定是直接展开 还是使用动态加载方法
    // loaded为true表示不使用动态加载 为false表示使用动态加载
    // 然而 如果是叶子结点的话 根本无法加载 所以此时也不能使用动态加载
    // 判断是否是叶子结点的条件有两个 1.使用者直接声明了leaf 2.子节点为空
    // isEmpty的判断是判断当前节点是否有传递children
    // 能到最后一步判断说明前面都是false
    // 在动态加载下
    //  isLeaf为false有两种情况 1.用户真的不打算使用leaf属性并且children为空 谁也不知道接下来有没有内容
    // 2.用户规范使用leaf属性 当前节点真的不是leaf节点
    //  在情况1之下 isLeaf是不会去判断children是否为空的 lazy?false:.. 只要lazy为true就无脑返回false判断他不是叶子结点
    // 因为也没有传递leaf属性 如果在获取数据的时候 这部分数据的children是一起获取到的 那他就是有children的
    // 此时该节点的loaded在初始化时就得设置为true 因为children已经获得了 虽然他不是叶子结点 但是已经获得了数据 所以不能用动态加载
    // console.log("config",this.data);

    this.loaded = !config.lazy || this.isLeaf || !isEmpty(this.childrenData);
    //  checked属性 只有当该节点是最终的答案节点才会为true
    // 比如单选模式下的叶子结点被选中了 这个叶子结点才会为true，而前面每一级被选中的Node的checked都是false
    // 在checkedStrictly模式下 某一级的Node被选中 那么该Node.checked为true 而之前的都不会为true
    // 默认情况下为false 但是用户可以指定某个Node在初始化的时候为true 默认展开 先不管
    this.checked = false;
    // this.checked在单选模式下是只有叶子节点可以为true
    // 但是在多选以及非checkstritly模式下 非叶子节点也可以为true但是要搭配isleaf以及intermediate
    // 只有当该节点所有的孩子节点都被选中了 他才为true否则就是false
    // 那为什么要在多选情况下设置expandingnode.checked=true?而不是只设置叶子node.checked为true？

    // 在node.vue页面中有一个doCheck函数 他执行的条件就是根据使用者当前是删除还是添加 然后与当前点击的节点的checked是否相同来决定是否执行接下来的函数
    // 在单选模式下 可以不用考虑这个因为只有叶子节点会执行docheck
    // 问题：什么情况下会发生 node.checked=true时 同时点击他还是代表true？ 叶子结点已经被选中再点一次
    // 就是重复点击的情况下不执行后续函数 节省性能
    // 那么在多选模式情况下 这个判断有什么用？在多选模式下 checked===node.checked这个判断其实没多大用
    // 而设置expandingNode.checked=true是为了不被这个判断影响
    // 因为如果expandingNode.checked不设置为true 会发生一件事 node.checked一直为false 如果当前node被选中那么checked=true 此时会正常执行后面的函数
    // 但是再点击一次 checked=false 就会和node.checked相同 此时就不会执行后续函数 也就不会改变value了
    // 但是这个方法又是需要的所以只能这样绕过去

    // 我会怎么做,来绕过这个方法 我大概会单独再写一系列方法 根据expandable/isLeaf来判断是不是叶子结点
    // 如果当前点击的不是叶子节点就跳过这个判断 isLeaf&&.....
    //

    // 用来记录 从根节点到该节点的路径上的所有节点 1.用于返回答案 2.用于将该路径上的所有Node都添加active样式

    // 1.为什么checked只能在答案节点上为true而路径Node.checked都为false？
    // 默认情况下为false
    this.loading = false;
  }

  // 问题来了 isLeaf为什么要有这么多判断条件？ 直接根据显式声明的leaf属性以及 children为空不就说明了是叶子结点无法展开了吗
  get isLeaf() {
    // 判断当前节点是否为子节点 判断children的长度
    const { data, config, childrenData, loaded } = this;
    const { lazy, leaf } = config;

    const isLeaf = data["leaf"];
    //  先判断用户有没有显示声明当前节点为leaf
    return isLeaf === undefined
      ? //  为true的话说明用户没有直接声明 这个时候就要去判断了
        // 为什么要通过动态加载以及 loaded进行判断 ？lazy是用户希望启用动态加载
        // 因为在支持动态加载的情况下 节点的信息是按需获取的 只有点击了节点 才会向服务器发起请求
        // 才会获取到chlidrenData 在此之前children一直为空 所以不能直接判断
        // 在初始化loaded时候 如果用户开启了动态加载
        // loaded是根据当前的节点情况判断能否使用动态加载

        // loaded在用户使用完动态加载后会修改为true的
        lazy && !loaded
        ? // 如果用户希望使用动态加载 且当前节点允许使用动态加载
          // 那么 isLeaf返回false 说明当前不是叶子结点
          false
        : // 如果用户不使用动态加载 或者 当前节点的条件不能使用动态加载
          // 判断当前节点的children的长度是否为空
          !(Array.isArray(childrenData) && childrenData.length)
      : // 如果用户显示声明了当前节点的leaf 就直接使用显式声明即可
        !!isLeaf;

    // if (this.children.length === 0) return true;
    // // 在没有初始化的时候loaded为undefined 但为什么还要用loaded去判断呢？
    // return false;
  }

  doCheck(checked) {
    if (this.checked === checked) return;
    // 不用考虑如何取消之前被选中的项 使用单选框即可
    const { multiple } = this.config;
    if (!multiple) this.checked = checked;
    else {
      // 1.多选模式下 要让所有的孩子节点都去计算自己的interminate和check
      // boradcast
      // 2.设置自己的checked和interminate
      // setCheckedState
      this.checked = checked;
    }
  }
  get isDisabled() {
    // 判断当前节点是否为disabled 1. 通过options中当前节点的数据是否包含disabled:true
    // 2. 在props中可以传递一个disabled函数 将当前节点和数据传递进去 然后进行计算看看是否要disable

    // 1、从data中得到disabled属性
    const { data, config } = this;
    const { disabled } = config;
    // console.log("disabled",typeof disabled)
    // 以config.disabled函数优先 当然他也可能没有传递
    const isDisabled =
      typeof disabled === "string"
        ? // 如果config.disabled为string说明表示key值
          data[disabled]
        : disabled(data, this);
    return isDisabled;
  }
  valueByOption() {
    return this.pathValues;
  }
  // 要求 childOptionData是一个节点的数据

  // 为什么yiwei
  appendChild(childOptionData) {
    const { childrenData, children } = this;
    const node = new Node(childOptionData, this.config, this);
    // 为什么要判断他是不是数组?    this.childrenData=data['children']
    // this.childrenData会因为 当前节点本身没有children属性而为undefined
    // 比如lazy动态加载时，最后一个节点如果没有标注为leaf 那么children基本都是空
    if (Array.isArray(childrenData)) {
      childrenData.push(childOptionData);
    } else {
      this.childrenData = [childOptionData];
    }
    children.push(node);
    return node;
  }
}
