export const ToolTipContentProps = {
  disabled: Boolean,
  placement: {
    type: String,
    default: "bottom",
  },
  effect: {
    type: String,
    default: "dark",
  },
  rawContent: Boolean,
  content: {
    type: String,
    default: "",
  },
  showArrow: {
    type: Boolean,
    default: true,
  },
  enterable: Boolean,
  teleported: Boolean,
  appendTo: {
    type: [String, Object],
  },
  transition: {
    type: String,
    default: "fade-in-linear",
  },
  pure: Boolean,
  teleported: {
    type: Boolean,
    default: true,
  },
  persistent: Boolean,
  popperOptions: { type: Object, default: {} },
};
