import { listSort } from '../utils'

export default {
  border: 'redraw',
  stripe: 'redraw',
  rowHeight: 'redraw',
  customStyle: {
    deep: true,
    handler: 'redraw'
  },
  headerRowHeight() {
    this.initConfigByColumns()
    this.redraw()
  },
  queryValue: {
    handler(val) {
      if (val !== this.currentQueryValue) {
        this.currentQueryValue = val ? { ...val } : {}
        this.redraw()
      }
    },
    immediate: true
  },
  data(val) {
    if (this.autoSort && val !== this.currentData) {
      this.currentData = listSort(this.data, this.currentData.field, this.currentData.orderByMode, this.currentData.sortType)
      this.$emit('update:data', this.currentData)
    }
    this.redraw()
  },
  wrapperHeight() {
    this.setCanvasHeight()
    this.redraw()
  },
  summary() {
    this.redraw()
  },
  columns() {
    this.initConfigByColumns()
    this.getWrapperWidth()
    this.redraw()
  },
  sort: {
    handler(val) {
      if (val.field !== this.currentOrder.orderByMode || val.orderByMode !== this.currentOrder.orderByMode) {
        this.currentOrder = {
          ...this.currentOrder, ...val
        }
        this.redraw()
      }
    },
    deep: true,
    immediate: true
  },
  currentOrder: {
    handler(val) {
      if (this.autoSort) {
        this.currentData = listSort(this.data, val.field, val.orderByMode, val.sortType)
        this.$emit('update:data', this.currentData)
      }
    },
    deep: true,
    immediate: true
  },
  wrapperWidth() {
    this.ctx.canvas.width = this.wrapperWidth * this.scaleRatio
    this.ctx.translate(0.5, 0.5)
    this.ctx.scale(this.scaleRatio, this.scaleRatio)
    this.redraw()
  }
}
