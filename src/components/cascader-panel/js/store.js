import Node from "./node";
// import { config } from "./config";
// 不应该是这里接收config

// 1. 在使用的过程中options的数据发生了变化 是否会触发initStore？会---index.vue中有监听
// 2. 既然触发了initStore说明整个store中所有的Node都是新的 uid也是在原本的基础上往上加
// 3. 但是在数据量很大的情况下 重新生成整个Node会不会很耗费时间? 数据量很大的情况下 一般是要使用动态加载的
// 在动态加载的情况下 options其实也是一直在变化 但这样就要重新生成整个store不也是很耗费性能？
// 动态加载的前提为什么不能直接往expandingNode.children中添加数据 但是外面的value不变化也不行
// 先不管动态加载 为什么这个傻逼地方要去遍历当前所有叶子结点 然后找到checked为true的内容
// 而不是直接将点击的Node加入到checkedValues然后再一一遍历
// 多选模式下还可以取消 然后根据uid是否相同来去删掉checkedNodes并重新计算？ 这不是很方便吗

const flatNodes = (nodes) => {
  return nodes.reduce((acc, item) => {
    if (item.isLeaf) {
      // 如果当前节点是叶子结点就push
      acc.push(item);
    } else {
      // 如果不是叶子结点 就去children中看看有没有叶子结点 会返回一个数组
      acc = acc.concat(flatNodes(item.children));
    }
    return acc;
  }, []);
};
export default class Store {
  //   因为Node类只能存储一棵树，而在cascader options中 options是一个对象数组，有多棵树
  // 所以Store的作用是用来存储所有的option 并调用Node类将对象转换成Node结构
  constructor(data, config) {
    // data 是options
    // console.log("data",data);

    const nodes = (data || []).map((obj) => {
      // 如果用户没有传递data以防万一 用[] 然后obj表示其中一棵树 然后将其转换成Node
      return new Node(obj, config);
    });
    this.config=config
    this.nodes = nodes;
    this.leafNodes = flatNodes(nodes);
  }
  getNodes() {
    return this.nodes;
  }
  // 获取已经平展开的节点
  getFlattedNodes(leafOnly_bool) {
    return leafOnly_bool ? this.leafNodes : null;
  }
  // appednNode 接收options和parentNode
  // 什么时候要接受parentNode？
  // appendNode有两种使用方法：1. 提供parentNode 就是将options加入到parent的children中
  // 2. 没有parentNode 说明options自成一棵树，将其加入到store数组中

  // optionsData是一个节点的optionObject而不是一个数组
  appendNode(optionData, parentNode) {
    
    // 1.将optionsData转换成Node
    // console.log("appendNode",!!parentNode);
    
    const node = new Node(optionData, this.config, parentNode);
    // console.log("appendNode",parentNode);
    
    // 2.判断有没有parentNode 如果不存在 直接把optionsData push进nodes中
    if (!parentNode) {
      this.nodes.push(node);
    } else {
      // 如果存在 作为他的孩子节点 optionsData也是只能一棵树
      parentNode.appendChild(optionData);
    }

    // 添加了node之后 要考虑到其他非响应式的内容是否需要更新
    // 1.leafNode
    node.isLeaf && this.leafNodes.push(node);
    // console.log("appendNode",this.nodes);
    
  }
  appendNodes(optionList, parentNode = undefined) {
    // 这里是批量将optionList增加到parentNode的children中或者单独成为一列
    if (Array.isArray(optionList)) {
      optionList.forEach((option) => {
        this.appendNode(option, parentNode);
      });
    } else if (optionList instanceof Object) {
      this.appendNode(optionList, parentNode);
    }
  }
}
