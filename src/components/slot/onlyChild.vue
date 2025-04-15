<script>
  import { useNameSpace } from "@/utils/hooks/UseNameSpace/usenamespace";
  import {
    inject,
    cloneVNode,
    defineComponent,
    Fragment,
    getCurrentInstance,
    withDirectives,
  } from "vue";
  function wrapTextContent(text) {
    const ns = useNameSpace("only-child");
    return `<span class={${ns.e("content")}>${text}</span>`;
  }
  function findFirstLegitChild(vnode) {
    if (!vnode) return null;
    const children = vnode;
    // vnode会是一个数组吗？ d
    for (const child of children) {
      if (child instanceof Object) {
        switch (child.type) {
          case Comment:
            continue;
          case Text:
          case "svg":
            return wrapTextContent(child);
          case Fragment:
            return findFirstLegitChild(child.children);
          default:
            return child;
        }
      }
      return wrapTextContent(child);
    }
    return null;
  }

  export default defineComponent({
    name: "OnlyChild",

    methods: {},
    setup(_, { slots, attrs }) {
      const setForwardRef = inject("FORWARD_INJECTION_KEY");
      const _directives = {
        mounted(el) {
          setForwardRef(el);
        },
      };
      // 首先从父组件那边拿到绑定triggerRef的函数 setForwardRef 这里需要return一个函数 该函数的返回值是虚拟DOM
      return () => {
        const defaultSlot = slots.default?.(attrs);

        // 判断是否用户使用child的时候是否传递的是默认插槽 如果不是就不渲染
        if (!defaultSlot) return null;

        if (defaultSlot.length > 1) {
          console.log("要求只能包含一个根元素");

          return null;
        }
        const firstLegitChild = findFirstLegitChild(defaultSlot);
        if (!firstLegitChild) {
          console.log("在根元素中没有找到有效的child");

          return null;
        }
        // 写一个绑定vnode的自定义指令，然后返回出去 withDirectives
        return withDirectives(cloneVNode(firstLegitChild, attrs), [
          // 每一个数组都是一个指令
          [_directives],
        ]);
      };
    },
  });
</script>
