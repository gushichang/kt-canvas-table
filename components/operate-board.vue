<template>
  <div
    :style="{ cursor: cursor }"
    :title="title"
    @mouseleave="onMouseleave"
    @click="onEvents"
    @contextmenu="onContextmenu"
    @dblclick="onEvents"
    ref="board">
    <slot/>
    <!-- 纵向滚动条 -->
    <div
      :style="{
        height: bodyHeight + 'px',
      }"
      v-show="maxScrollHeight > 0"
      class="kt-canvas-table-scrolly-box"
    >
      <div
        ref="scrollY"
        @click.stop
        @mousedown.stop="yMousedown"
        class="kt-canvas-table-scrolly-bar"
        :class="{ moving: yIsDown }"
        :style="{ height: scrollyBarHeight + 'px' }"></div>
    </div>
    <!-- 横向滚动条 -->
    <div class="kt-canvas-table-scrollx-box" v-show="maxScrollWidth > 0">
      <div
        ref="scrollX"
        @click.stop
        @mousedown.stop="xMousedown"
        :style="{ width: scrollxBarWidth + 'px' }"
        :class="{ moving: xIsDown }"
        class="kt-canvas-table-scrollx-bar"></div>
      </div>
    <div
      @mousedown.stop="colMousedown"
      @click.stop
      v-show="currentResizeCol && mouseInfo"
      :style="resizeColStyle"
      class="kt-canvas-table-col-resize-handler"></div>
    <div
      v-show="colIsDown"
      :style="{ left: parseInt(resizeColStyle.left) + colResizeHandlerWidth + 'px' }"
      class="kt-canvas-table-col-resize-line"
    ></div>
    <!-- 鼠标移入的气泡 -->
    <tooltip
      :placement="tooltipPlacement"
      :getBoundingClientRect="getTooltipRect"
      :show.sync="showTooltip"
      :content="tooltipContent"
    />
    <!-- 通用气泡 -->
    <tooltip
      customStyle="pointer-events: initial;"
      :placement="popoverPlacement"
      :getBoundingClientRect="getPopoverRect"
      :show.sync="showPopover"
    >
      <keep-alive>
        <component
          v-model="queryValue[popoverInfo.queryField]"
          @cancel="showPopover = false"
          v-if="popoverInfo.component"
          :is="popoverInfo.component"
          @confirm="onPopoverConfirm"
          v-on="popoverInfo.events"
          v-bind="popoverInfo.attrs"></component>
      </keep-alive>
    </tooltip>
    <input
      :style="selectInputStyle"
      type="text"
      @blur="showSelectInput = false"
      v-show="showSelectInput"
      ref="selectInput"
      readonly
      class="kt-canvas-table-select-input">
  </div>
</template>

<script>
import QueryCheckbox from './query-checkbox'
import QueryRadio from './query-radio'
import Tooltip from './tooltip.vue'
export default {
  props: [
    'wrapperWidth',
    'contentWidth',
    'maxScrollWidth',
    'maxScrollHeight',
    'contentHeight',
    'maxContentHeight',
    'bodyHeight'
  ],
  components: { QueryCheckbox, QueryRadio, Tooltip },
  data() {
    return {
      xIsDown: false,
      yIsDown: false,
      colIsDown: false,
      currentX: 0,
      currentY: 0,
      moveDistance: 0, //  记录拖动距离
      barMinLength: 50,
      mouseInfo: null,
      colResizeHandlerWidth: 4,
      currentResizeCol: null,
      resizeColStyle: {},
      cursor: '',
      title: '',
      showTooltip: false,
      showPopover: false, // 查询过滤气泡
      popoverInfo: {
        component: '',
        queryField: '',
        attrs: {}
      },
      queryValue: {},
      tooltipContent: '',
      showSelectInput: false,
      selectInputStyle: {},
      getTooltipRect: () => {},
      tooltipPlacement: '',
      getPopoverRect: () => {},
      popoverPlacement: '',
    }
  },
  computed: {
    scrollX() { return this.$parent.scrollX },
    scrollY() { return this.$parent.scrollY },
    scrollxBarWidth() {
      return Math.max(this.wrapperWidth / this.contentWidth * this.wrapperWidth, this.barMinLength)
    },
    scrollxBarLeft() {
      return (this.wrapperWidth - this.scrollxBarWidth) / this.maxScrollWidth * this.currentX
    },
    scrollyBarHeight() {
      return Math.max(this.bodyHeight / this.contentHeight * this.bodyHeight, this.barMinLength)
    },
    scrollyBarTop() {
      return (this.bodyHeight - this.scrollyBarHeight) / this.maxScrollHeight * this.currentY
    }
  },
  /*
    (bodyHeight - scrollyBarHeight) / maxScrollHeight =  scrollyBarTop / this.currentY
    this.currentY = scrollyBarTop * maxScrollHeight / (bodyHeight - scrollyBarHeight)
  */
  watch: {
    scrollxBarLeft(val) {
      this.$refs.scrollX.style.left = val + 'px'
    },
    scrollyBarTop(val) {
      this.$refs.scrollY.style.top = val + 'px'
    },
    scrollX(val) {
      if (val !== this.currentX) {
        this.currentX = val
      }
      if (this.mouseInfo) {
        const layout = this.getBoxAndFixed()
        if (layout && layout.fixed === 'center') {
          this.currentResizeCol = null
          this.currentCellInfo = this.getCellInfoByMouse()
          if (this.currentCellInfo) {
            this.$emit('mousemove', this.currentCellInfo, this.mouseInfo)
          }
          this.setCursorAndTitle()
        }
      }
    },
    scrollY(val) {
      if (val !== this.currentY) {
        this.currentY = val
      }
      if (this.mouseInfo) {
        const layout = this.getBoxAndFixed()
        if (layout && layout.box === 'body') {
          this.currentCellInfo = this.getCellInfoByMouse()
          if (this.currentCellInfo) {
            this.$emit('mousemove', this.currentCellInfo, this.mouseInfo)
          }
          this.setCursorAndTitle()
        }
      }
    }
  },
  methods: {
    onMouseleave() {
      this.hideTooltip()
      this.mouseInfo = null
      this.$emit('mouseleave')
    },
    onContextmenu(e) {
      if (this.currentCellInfo && !this.currentCellInfo.col.disabledRightClick) {
        const { bodyCellInfo, summaryCellInfo } = this.$parent
        const { index, col: { key, disabledRightClick, align }, box, rect } = this.currentCellInfo
        let texts = ''
        if (box === 'body') {
          if (bodyCellInfo[index] && bodyCellInfo[index][key]) {
            texts = bodyCellInfo[index][key].reduce((t, v) => {
              return t + ' ' + (v.text || '')
            }, '')
          }
        } else if (box === 'sum') {
          if (summaryCellInfo[key]) {
            texts = summaryCellInfo[key].reduce((t, v) => {
              return t + ' ' + (v.text || '')
            }, '')
          }
        }
        if (!disabledRightClick && texts.trim()) {
          e.preventDefault()
          this.selectInputStyle = {
            height: rect.height - 1 + 'px',
            width: rect.width + 'px',
            top: rect.y + 'px',
            left: rect.x + 'px',
            textAlign: align
          }
          this.showSelectInput = true
          this.$refs.selectInput.value = texts.trim()
          setTimeout(() => {
            this.$refs.selectInput.focus()
            this.$refs.selectInput.select()
          })
        }
      }
    },
    onPopoverConfirm() {
      this.hidePopover()
      this.$emit('query-change', this.popoverInfo.queryField, this.queryValue[this.popoverInfo.queryField])
    },
    colMousedown({ pageX }) {
      this.colIsDown = true
      this.moveDistance = pageX
    },
    xMousedown({ pageX }) {
      this.xIsDown = true
      this.moveDistance = pageX
    },
    yMousedown({ pageY }) {
      this.yIsDown = true
      this.moveDistance = pageY
    },
    // 计算鼠标位置在哪个大的位置上
    getBoxAndFixed() {
      const { x, y } = this.mouseInfo
      const {
        bodyHeight,
        summaryHeight,
        wrapperWidth,
        headerHeight,
        fixedLeftWidth,
        fixedRightWidth,
      } = this.$parent
      let box = ''
      let fixed = ''
      if (y <= headerHeight) {
        box = 'head'
      } else if (y <= headerHeight + bodyHeight) {
        box = 'body'
      } else if (y <= headerHeight + bodyHeight + summaryHeight) {
        box = 'sum'
      } else {
        return null
      }
      if (x <= fixedLeftWidth) {
        fixed = 'left'
      } else if (x <= wrapperWidth - fixedRightWidth) {
        fixed = 'center'
      } else {
        fixed = 'right'
      }
      return { fixed, box }
    },
    // 获取所在单元格
    getCellInfoByMouse() {
      const { x, y } = this.mouseInfo
      const {
        headerColumnsByFixed,
        bodyColumnsByFixed,
        wrapperWidth,
        headerHeight,
        summaryHeight,
        fixedLeftWidth,
        fixedRightWidth,
        maxScrollWidth,
        scrollX,
        scrollY,
        rowHeight,
        bodyCellInfo,
        headerCellInfo,
        summaryCellInfo,
        summary,
        data,
        style
      } = this.$parent
      const layout = this.getBoxAndFixed()
      if (layout) {
        const { box, fixed } = layout
        const fns = {
          head: () => {
            const each = (list) => {
              for (let i = 0; i < list.length; i++) {
                const item = list[i]
                let _left = 0
                if (item.fixed === 'left') {
                  _left = item._left
                } else if (item.fixed === 'right') {
                  _left = item._left - maxScrollWidth
                } else {
                  _left = item._left - scrollX
                  if (_left + item.width < fixedLeftWidth) continue
                  if (_left > wrapperWidth - fixedRightWidth) return
                }
                if (_left < x && x <= _left + item.width) {
                  if (item._top < y && y <= item._top + item._height) {
                    const rect = {
                      x: _left,
                      y: item._top,
                      width: item.width,
                      height: item._height
                    }
                    let target = headerCellInfo[item.key] && headerCellInfo[item.key].find(v => {
                      return rect.x + v.x + style.padding < x && x <= rect.x + v.x + style.padding + v.width &&
                            rect.y + v.y < y && y <= rect.y + v.y + v.height
                    })
                    if (target) {
                      target = {
                        ...target,
                        x: rect.x + target.x + style.padding,
                        y: rect.y + target.y,
                      }
                    }
                    return {
                      col: item,
                      box,
                      rect,
                      target
                    }
                  } else if (item.children && item.children.length) {
                    return each(item.children)
                  }
                }
              }
            }
            return each(headerColumnsByFixed[fixed])
          },
          body: () => {
            if (!data || data.length === 0) return null
            const rowIndex = parseInt((y - headerHeight + scrollY) / rowHeight)
            for (let i = 0; i < bodyColumnsByFixed[fixed].length; i++) {
              const col = bodyColumnsByFixed[fixed][i]
              let _left = 0
              if (fixed === 'left') {
                _left = col._left
              } else if (fixed === 'right') {
                _left = col._left - maxScrollWidth
              } else {
                _left = col._left - scrollX
                if (_left + col.width < fixedLeftWidth) continue
                if (_left > wrapperWidth - fixedRightWidth) break
              }
              if (_left < x && x <= _left + col.width) {
                const rect = {
                  x: _left,
                  y: headerHeight + rowIndex * rowHeight - scrollY,
                  width: col.width,
                  height: rowHeight
                }
                let target = bodyCellInfo[rowIndex] && bodyCellInfo[rowIndex][col.key] && bodyCellInfo[rowIndex][col.key].find(v => {
                  return rect.x + v.x + style.padding < x && x <= rect.x + v.x + style.padding + v.width &&
                        rect.y + v.y < y && y <= rect.y + v.y + v.height
                })
                if (target) {
                  target = {
                    ...target,
                    x: rect.x + target.x + style.padding,
                    y: rect.y + target.y,
                  }
                }
                return {
                  row: data[rowIndex],
                  col: col,
                  index: rowIndex,
                  box,
                  rect,
                  target
                }
              }
            }
          },
          sum: () => {
            const list = bodyColumnsByFixed[fixed]
            for (let i = 0; i < list.length; i++) {
              const col = list[i]
              let width = col.width
              if (col.summarySpan > 1) {
                const endSpan = col.summarySpan - 1 + i
                while (i < endSpan && i < list.length) {
                  i++
                  width += list[i].width
                }
              }
              let _left = 0
              if (fixed === 'left') {
                _left = col._left
              } else if (fixed === 'right') {
                _left = col._left - maxScrollWidth
              } else {
                _left = col._left - scrollX
                if (_left + width < fixedLeftWidth) continue
                if (_left > wrapperWidth - fixedRightWidth) break
              }
              if (_left < x && x <= _left + width) {
                const rect = {
                  x: _left,
                  y: headerHeight + this.bodyHeight,
                  width: width,
                  height: summaryHeight
                }
                let target = summaryCellInfo[col.key] && summaryCellInfo[col.key].find(v => {
                  return rect.x + v.x + style.padding < x && x <= rect.x + v.x + style.padding + v.width &&
                        rect.y + v.y < y && y <= rect.y + v.y + v.height
                })
                if (target) {
                  target = {
                    ...target,
                    x: rect.x + target.x + style.padding,
                    y: rect.y + target.y,
                  }
                }
                return {
                  row: summary,
                  col: col,
                  box,
                  rect,
                  target
                }
              }
            }
          }
        }
        return fns[box]()
      } else {
        return null
      }
    },
    onMousemove(e) {
      if (this.colIsDown) return
      const { left, top } = this.$refs.board.getBoundingClientRect()
      const x = e.clientX - left
      const y = e.clientY - top
      this.mouseInfo = {x, y}
      this.currentCellInfo = this.getCellInfoByMouse()
      if (this.currentCellInfo) {
        this.$emit('mousemove', this.currentCellInfo, this.mouseInfo)
      }
      this.showColResize(x)
      this.setCursorAndTitle()
      this.setTooltip()
    },
    onEvents(e) {
      if (this.currentCellInfo && !this.colIsDown) {
        const { box, target, col } = this.currentCellInfo
        if (target && target.on) {
          if (target.on[e.type]) {
            target.on[e.type](this.currentCellInfo, e, this.showPopover)
          } else if (target.on[e.type + '.stop']) {
            target.on[e.type + '.stop'](this.currentCellInfo, e, this.showPopover)
            return
          }
        }
        if (box === `body`) {
          this.$emit(`row-${e.type}`, this.currentCellInfo)
          this.$emit(`cell-${e.type}`, this.currentCellInfo)
        } else if (box === `head`) {
          this.$emit(`header-cell-${e.type}`, this.currentCellInfo)
          if (target && target.id === `$query`) {
            this.$emit(`query-${e.type}`, col)
            if (col.queryComponent && (!this.showPopover || this.popoverInfo.queryField !== col.queryField)) {
              e.stopPropagation()
              this.createPopover(target, {
                component: col.queryComponent,
                queryField: col.queryField,
                attrs: col.queryAttrs
              })
            }
          } else if (col.sortable) {
            this.$emit(`sort-${e.type}`, this.currentCellInfo)
          }
        } else {
          this.$emit(`summary-row-${e.type}`, this.currentCellInfo)
          this.$emit(`summary-cell-${e.type}`, this.currentCellInfo)
        }
      }
    },
    initEvents() {
      // this.debounceMousemove = debounce(this.onMousemove, 16.67)
      this.onDocumentClick = () => {
        this.hideTooltip()
        this.hidePopover()
      }
      this.debounceMousemove = this.onMousemove
      document.addEventListener('mousemove', this.onDocumentMove)
      document.addEventListener('click', this.onDocumentClick)
      document.addEventListener('mouseup', this.onDocumentMouseup)
      this.$refs.board.addEventListener('wheel', this.onWheel, { passive: false })
      this.$refs.board.addEventListener('mousemove', this.debounceMousemove)
      this.$on('scroll', () => {
        this.hidePopover()
        this.showSelectInput = false
      })
    },
    removeEvents() {
      this.$refs.board.removeEventListener('wheel', this.onWheel, { passive: false })
      this.$refs.board.removeEventListener('mousemove', this.debounceMousemove)
      document.removeEventListener('mousemove', this.onDocumentMove)
      document.removeEventListener('mouseup', this.onDocumentMouseup)
      document.removeEventListener('click', this.onDocumentClick)
    },
    onWheel(e) {
      const { deltaX, deltaY } = e
      // 判断是横向滚动还是纵向滚动
      let isHScroll = Math.abs(deltaX) > Math.abs(deltaY)
      if (isHScroll &&
          ((deltaX > 0 && this.scrollX < this.maxScrollWidth) ||
            (deltaX < 0 && this.scrollX > 0)
          )
        ) {
        e.preventDefault()
        let scrollX = this.scrollX + deltaX
        scrollX = scrollX < 0 ? 0 : (scrollX > this.maxScrollWidth ? this.maxScrollWidth : scrollX)
        this.$emit('scroll', { x: scrollX })
      } else if (
        !isHScroll &&
        ((deltaY > 0 && this.scrollY < this.maxScrollHeight) ||
          (deltaY < 0 && this.scrollY > 0)
        )
      ) {
        e.preventDefault()
        let scrollY = this.scrollY + deltaY
        scrollY = scrollY < 0 ? 0 : (scrollY > this.maxScrollHeight ? this.maxScrollHeight : scrollY)
        this.$emit('scroll', { y: scrollY })
      }
    },
    onDocumentMove(e) {
      if (this.xIsDown) {
        // 拖动横向滚动条
        e.stopPropagation()
        e.preventDefault()
        let x = e.pageX - this.moveDistance
        let left = this.scrollxBarLeft + x
        let scrollX = left * this.maxScrollWidth / (this.wrapperWidth - this.scrollxBarWidth)
        scrollX = scrollX < 0 ? 0 : (scrollX > this.maxScrollWidth ? this.maxScrollWidth : scrollX)
        this.currentX = scrollX
        this.$emit('scroll', { x: scrollX })
        this.moveDistance = e.pageX
      } else if (this.yIsDown) {
        // 拖动纵向滚动条
        e.stopPropagation()
        e.preventDefault()
        let y = e.pageY - this.moveDistance
        let top = this.scrollyBarTop + y
        let scrollY = top * this.maxScrollHeight / (this.bodyHeight - this.scrollyBarHeight)
        scrollY = scrollY < 0 ? 0 : (scrollY > this.maxScrollHeight ? this.maxScrollHeight : scrollY)
        this.currentY = scrollY
        this.$emit('scroll', { y: scrollY })
        this.moveDistance = e.pageY
      } else if (this.colIsDown) {
        // 拖动列宽
        e.stopPropagation()
        e.preventDefault()
        let y = e.pageX - this.moveDistance
        let oldWidth = this.currentResizeCol.width
        let width = oldWidth + y
        width = Math.max(width, 40)
        this.currentResizeCol.width = width
        this.resizeColStyle.left = parseInt(this.resizeColStyle.left) + (width - oldWidth) + 'px'
        this.moveDistance = e.pageX
      }
    },
    // 设置光标样式与文字隐藏的提示
    setCursorAndTitle() {
      this.cursor = ''
      this.title = ''
      if (this.currentCellInfo) {
        const { col: { cellStyle }, target } = this.currentCellInfo
        if (target && target.style && target.style.cursor) {
          this.cursor = target.style.cursor
        } else if (cellStyle && cellStyle.cursor) {
          this.cursor = cellStyle.cursor
        }

        if (target && target.isOver) {
          this.title = target.text
        }
      }
    },
    // 设置气泡
    setTooltip() {
      if (this.currentCellInfo) {
        const { box, rect, col, row, index, target } = this.currentCellInfo
        if (target && target.tooltip && target.tooltip.content && this.oldTarget !== target) {
          this.oldTarget = target
          this.tooltipContent = target.tooltip.content
          this.createTooltip(target, target.tooltip.placement || 'top', 'center')
          return
        } else if (this.oldCellInfo && col === this.oldCellInfo.col && index === this.oldCellInfo.index && this.showTooltip) {
          return
        }
        let tipText = ''
        if (box === 'head') {
          tipText = typeof col.headerTooltip === 'function' ? col.headerTooltip(col) : col.headerTooltip
        } else if (box === 'body') {
          tipText = typeof col.tooltip === 'function' ? col.tooltip(row, col, index) : col.tooltip
        } else if (box === 'sum') {
          tipText = typeof col.summaryTooltip === 'function' ? col.summaryTooltip(row, col) : col.summaryTooltip
        }
        if (tipText) {
          this.oldCellInfo = this.currentCellInfo
          this.tooltipContent = tipText
          const placementX = {
            'right': '-end',
            'center': '',
            'left': '-start',
          }[col.algin || 'left']
          this.createTooltip(rect, (box === 'head' ? 'bottom' : 'top') + placementX, col.algin || 'left')
        } else {
          this.hideTooltip()
        }
      } else {
        this.hideTooltip()
      }
    },
    createTooltip(rect, placement, algin) {
      let offsetLeft = 0
      let offsetRight = 0
      if (algin === 'left') {
        offsetRight = 50 - rect.width
      } else if (algin === 'center') {
        offsetLeft = (rect.width - 50) / 2
        offsetRight = -offsetLeft
      } else {
        offsetLeft = rect.width - 50
      }
      this.tooltipPlacement = placement
      this.getTooltipRect = () => {
        const { left, top } = this.$refs.board && this.$refs.board.getBoundingClientRect()
        return {
          width: 50,
          height: rect.height,
          top: rect.y + top,
          right: rect.x + left + rect.width + offsetRight,
          bottom: rect.y + top + rect.height,
          left: rect.x + left + offsetLeft,
        }
      }
      this.showTooltip = true
    },
    hideTooltip() {
      this.showTooltip = false
    },
    hidePopover() {
      this.showPopover = false
    },
    createPopover(rect, { component, queryField, attrs, events }, placement = 'bottom-end') {
      this.getPopoverRect = () => {
        const { left, top } = this.$refs.board && this.$refs.board.getBoundingClientRect()
        return {
          width: rect.width,
          height: rect.height,
          top: rect.y + top,
          right: rect.x + left + rect.width,
          bottom: rect.y + top + rect.height,
          left: rect.x + left,
        }
      }
      this.popoverInfo = {
        component,
        queryField: queryField,
        events,
        attrs
      }
      this.popoverPlacement = placement
      if (queryField) {
        this.$set(this.queryValue, queryField, this.$parent.currentQueryValue[queryField])
      }
      this.showPopover = true
    },
    // 显示拖动列
    showColResize(x) {
      if (this.currentCellInfo) {
        if (this.colIsDown) return
        const { box, col, rect } = this.currentCellInfo
        if (
          box === 'head' &&
          (!col.children || !col.children.length) &&
          col.colResize !== false &&
          x - (rect.x + rect.width - this.colResizeHandlerWidth) >= 0
        ) {
          this.currentResizeCol = { ...col }
          this.resizeColStyle = {
            width: this.colResizeHandlerWidth + 'px',
            height: rect.height + 'px',
            top: rect.y + 'px',
            left: rect.x + rect.width - this.colResizeHandlerWidth + 'px'
          }
        } else {
          this.currentResizeCol = null
        }
      } else {
        this.currentResizeCol = null
      }
    },
    onDocumentMouseup() {
      this.xIsDown = false
      this.yIsDown = false
      if (this.colIsDown) {
        setTimeout(() => {
          this.$emit('col-resize', this.currentResizeCol)
          this.currentResizeCol = null
          this.colIsDown = false
        })
      }
    }
  },
  mounted() {
    this.initEvents()
  },
  beforeDestroy() {
    this.removeEvents()
  }
}
</script>

<style>

</style>
