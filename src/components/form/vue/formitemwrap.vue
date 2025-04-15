<script>
  import { defineComponent } from "vue";

  export default defineComponent({
    props: {},
    // 没有template的情况下 要求setup返回一个虚拟节点或者是一个可以返回虚拟DOM的函数
    setup(props, { emit, attrs }) {
      return () => {
        reutrn(
          <div>
            {slots.default?.()}
          </div>
        );
      };
    },
  });
</script>

<style lang="scss" scoped></style>
