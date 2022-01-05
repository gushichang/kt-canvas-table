<template>
  <transition name="el-fade-in-linear">
    <div
      :style="customStyle"
      @click.stop
      class="kt-canvas-table-tooltip"
      ref="tooltip"
      v-show="show">
      <slot>
        <div v-html="content"></div>
      </slot>
      <div class="kt-canvas-table-tooltip-arrow" data-popper-arrow v-if="arrow"></div>
    </div>
  </transition>
</template>

<script>
import { createPopper } from '../utils/popper.min.js'
export default {
  props: {
    customStyle: [String, Object],
    getBoundingClientRect: Function,
    show: Boolean,
    content: [String, Number],
    arrow: {
      default: true,
      stype: Boolean
    },
    placement: {
      default: 'bottom',
      stype: String
    },
    modifiers: {
      default: () => [
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ],
      stype: Array
    },
  },
  data() {
    return {
      tooltip: null,
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.hideTooltip()
        this.showTooltip()
      } else {
        setTimeout(() => {
          if (!this.show) {
            this.hideTooltip()
          }
        }, 300)
      }
    },
    getBoundingClientRect() {
      this.hideTooltip()
      this.showTooltip()
    }
  },
  mounted() {
    this.$refs.tooltip && document.body.appendChild(this.$refs.tooltip)
  },
  beforeDestroy() {
    this.$refs.tooltip && document.body.removeChild(this.$refs.tooltip)
  },
  methods: {
    showTooltip() {
      this.tooltip = createPopper({
        getBoundingClientRect: this.getBoundingClientRect
      }, this.$refs.tooltip, {
        strategy: 'fixed',
        placement: this.placement,
        modifiers: this.modifiers
      })
    },
    hideTooltip() {
      this.tooltip && this.tooltip.destroy()
    }
  }
}
</script>
