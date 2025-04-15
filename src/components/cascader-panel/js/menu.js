import Node from "../js/node.js"
export const CascaderMenuProps = {
    // 因为是渲染出一个菜单的内容，所以这里要接收一堆节点nodes
    nodes: {
      type: Array,
      default: [],
      validator(nodes) {
        // 这里需要对Array的内容进行一个判断 判断其是否都是Node节点
        for (let node of nodes) {
          if (!(node instanceof Node)) return false;
        }
        return true;
      },
    },
  };
  