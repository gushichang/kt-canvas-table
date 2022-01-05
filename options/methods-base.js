
export default {
  hidePopover() {
    this.$refs.operate.hidePopover()
  },
  createPopover(...e) {
    this.$refs.operate.createPopover(...e)
  },
  onQueryChange(key, val) {
    this.$set(this.currentQueryValue, key, val)
    this.$emit('update:queryValue', this.currentQueryValue)
    this.$emit('query-change', key, val, this.currentQueryValue)
    this.draw()
  },
  onCheckboxClick({ row, index }) {
    const disabled = this.disabledSelection && this.disabledSelection(row, index)
    if (!disabled) {
      const val = row[this.selectionKey] || index
      const i = this.currentSelection.indexOf(val)
      if (i >= 0) this.currentSelection.splice(i, 1)
      else this.currentSelection.push(val)
      this.draw()
      this.$emit('update:selection', this.currentSelection)
      this.$emit('selection-change', this.currentSelection)
    }
  },
  onCheckboxAllClick() {
    if (this.allChecked) {
      this.currentSelection = []
    } else {
      this.currentSelection = this.data.map((row, index) => row[this.selectionKey] || index)
    }
    this.draw()
    this.$emit('update:selection', this.currentSelection)
    this.$emit('selection-change', this.currentSelection)
  },
  onColResize(e) {
    this.widthConfig[e.key] = e.width
    this.initConfigByColumns()
    this.getWrapperWidth()
    this.draw()
  },
  onSortClick(e) {
    let field = typeof e.col.sortable === 'string' ? e.col.sortable : e.col.key
    this.currentOrder = {
      field: field,
      orderByMode: field === this.currentOrder.field ? ((this.currentOrder.orderByMode + 1) % 2) : 1
    }
    this.draw()
    this.$emit('sort', this.currentOrder, e)
  },
  onRowClick(e) {
    this.activeIndex = e.index
    this.draw(false)
  },
  getDefaultSlot() {
    return [ // 自定义插槽
      {
        type: 'head',
        list: [
          { type: 'left', list: [], width: () => this.fixedLeftWidth, height: () => this.headerHeight },
          { type: 'center', list: [], width: () => this.wrapperWidth - this.fixedLeftWidth - this.fixedRightWidth, height: () => this.headerHeight },
          { type: 'right', list: [], width: () => this.fixedRightWidth, height: () => this.headerHeight },
        ]
      },
      {
        type: 'body',
        list: [
          { type: 'left', list: [], width: () => this.fixedLeftWidth, height: () => this.bodyHeight },
          { type: 'center', list: [], width: () => this.wrapperWidth - this.fixedLeftWidth - this.fixedRightWidth, height: () => this.bodyHeight },
          { type: 'right', list: [], width: () => this.fixedRightWidth, height: () => this.bodyHeight },
        ]
      },
      {
        type: 'sum',
        list: [
          { type: 'left', list: [], width: () => this.fixedLeftWidth, height: () => this.summaryHeight },
          { type: 'center', list: [], width: () => this.wrapperWidth - this.fixedLeftWidth - this.fixedRightWidth, height: () => this.summaryHeight },
          { type: 'right', list: [], width: () => this.fixedRightWidth, height: () => this.summaryHeight },
        ]
      }
    ]
  },
  initEvents() {
    this.handleResize = () => {
      this.getWrapperWidth()
    }
    this.onload = () => {
      if (this.$refs.box && this.$refs.box.offsetWidth) {
        this.draw(false)
      }
    }
    // this.$refs.table.addEventListener('wheel', this.onWheel, { passive: false })
    window.addEventListener('load', this.onload)
    window.addEventListener('resize', this.handleResize)
  },
  removeEvents() {
    // this.$refs.table.removeEventListener('wheel', this.onWheel, { passive: false })
    document.removeEventListener('load', this.onload)
    window.addEventListener('resize', this.handleResize)
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
      this.setScroll({ x: scrollX })
    } else if (
      !isHScroll &&
      ((deltaY > 0 && this.scrollY < this.maxScrollHeight) ||
        (deltaY < 0 && this.scrollY > 0)
      )
    ) {
      e.preventDefault()
      let scrollY = this.scrollY + deltaY
      scrollY = scrollY < 0 ? 0 : (scrollY > this.maxScrollHeight ? this.maxScrollHeight : scrollY)
      this.setScroll({ y: scrollY })
    }
  },
  init() {
    this.widthConfig = {}
    this.boxWidth = this.$refs.box.offsetWidth
    this.initConfigByColumns()
    this.ctx = this.$refs.canvas.getContext('2d')
    this.scaleRatio = window.devicePixelRatio
    this.scaleRatio = this.scaleRatio < 1 ? 1 : this.scaleRatio
    this.setCanvasHeight()
    this.getWrapperWidth()
    this.draw()
    this.initEvents()
    this.isInit = true
  },
  getWrapperWidth() {
    if (this.$refs.box && this.$refs.box.offsetWidth) {
      const oldBoxWidth = this.boxWidth
      this.boxWidth = this.$refs.box.offsetWidth
      if (this.minWidthTotal) {
        if (this.boxWidth !== oldBoxWidth && this.init) {
          if (this.defaultWidthTotal < this.boxWidth) {
            this.initConfigByColumns()
          } else if (this.defaultWidthTotal < oldBoxWidth) {
            this.initConfigByColumns()
          }
        }
        this.wrapperWidth = this.boxWidth
      } else {
        this.wrapperWidth = this.boxWidth > this.contentWidth ? this.contentWidth : this.boxWidth
      }
    }
  },
  setCanvasHeight() {
    this.ctx.canvas.height = this.wrapperHeight * this.scaleRatio
    this.ctx.translate(0.5, 0.5)
    this.ctx.scale(this.scaleRatio, this.scaleRatio)
  },
  // 获取单元格的宽度
  getCellWidth(item) {
    let total = 0
    if (item.children && item.children.length) {
      let t = 0
      item.children.forEach(child => {
        t += this.getCellWidth(child)
      })
      total += t
    } else {
      let w = this.widthConfig[item.key] || parseInt(item.width)
      if (!w && item.minWidth) {
        const diff = this.boxWidth - this.defaultWidthTotal
        const minW = parseInt(item.minWidth)
        if (diff > 0) {
          w = minW + minW / this.minWidthTotal * diff
        } else {
          w = minW
        }
      }
      total += w || 50
    }
    return total
  },
  /**
   * 获取根据 columns 计算出:
   * headerHeight,
   * currentColumns,
   * bodyColumns,
   * fixedLeftWidth,
   * fixedRightWidth,
   * contentWidth,
   * slotList
   */
  initConfigByColumns(columns = this.columns) {
    const currentColumns = []
    const bodyColumns = []
    let fixedLeftWidth = 0
    let fixedRightWidth = 0
    let contentWidth = 0
    let headerRowHeights = []
    const { floor, minWidthTotal, widthTotal } = this.getColumnsWidthAndFloor(columns)

    this.slotList = this.getDefaultSlot()
    this.minWidthTotal = minWidthTotal
    this.defaultWidthTotal = widthTotal

    if (typeof this.headerRowHeight === 'number') {
      headerRowHeights = Array(floor).fill(this.headerRowHeight)
    } else {
      headerRowHeights = this.headerRowHeight.slice(0, floor)
    }
    this.headerHeight = headerRowHeights.reduce((t, v) => t + v, 0)

    let each = (data, level = 1, parent = null) => {
      let _left = parent ? parent._left : 0
      data.forEach(item => {
        let _top = 0
        for (let i = 0; i < level - 1; i++) {
          _top += headerRowHeights[i]
        }
        const val = {
          ...item,
          fixed: parent ? parent.fixed : item.fixed,
          width: this.getCellWidth(item),
          _left,
          _top,
        }
        if (item.children && item.children.length) {
          val._height = headerRowHeights[level - 1]
          val.children = []
          each(item.children, level + 1, val)
        } else {
          val._height = this.headerHeight - _top
          if (val.type === 'selection') {
            this.fillSelectionFormatter(val)
          }
          contentWidth += val.width
          if (val.fixed === 'left') fixedLeftWidth += val.width
          else if (val.fixed === 'right') fixedRightWidth += val.width
          bodyColumns.push(val)
        }
        this.pushSlot(val)
        _left += val.width
        if (parent) {
          parent.children.push(val)
        } else {
          currentColumns.push(val)
        }
      })
    }
    each(columns)
    each = null
    this.currentColumns = currentColumns
    this.bodyColumns = bodyColumns
    this.fixedLeftWidth = fixedLeftWidth
    this.fixedRightWidth = fixedRightWidth
    this.contentWidth = contentWidth
    if (this.hideHeader) this.headerHeight = 0
  },
  // 填充选择列的Formatter
  fillSelectionFormatter(val) {
    val.disabledRightClick = true
    val.formatter = (row, col, index) => {
      const disabled = this.disabledSelection && this.disabledSelection(row, index)
      const checked = this.currentSelection.includes(row[this.selectionKey] || index)
      return {
        style: {
          color: disabled ? '#f5f5f5' : (checked ? this.style.primary : '#d9d9d9'),
          cursor: disabled ? '' : 'pointer',
          fontSize: 16
        },
        icon: {
          text: checked ? '&#xe8b6;' : '&#xe8b5;',
          style: { fontFamily: 'kt-iconfont' }
        },
        on: {
          'click.stop': this.onCheckboxClick
        }
      }
    }
    val.headerFormatter = () => ({
      style: {
        color: (this.allChecked ? this.style.primary : '#d9d9d9'),
        cursor: 'pointer',
        fontSize: 16
      },
      icon: {
        text: this.allChecked ? '&#xe8b6;' : '&#xe8b5;',
        style: { fontFamily: 'kt-iconfont' }
      },
      on: {
        'click.stop': this.onCheckboxAllClick
      }
    })
  },
  // 获取层级、总最小宽、默认总表格宽
  getColumnsWidthAndFloor(columns) {
    let floor = 0
    let minWidthTotal = 0
    let widthTotal = 0
    let each = (list, l = 1) => {
      floor = Math.max(floor, l)
      list.forEach(item => {
        if (item.children && item.children.length) {
          each(item.children, l + 1)
        } else {
          const width = this.widthConfig[item.key] || parseInt(item.width)
          if (width) {
            widthTotal += width
          } else if (item.minWidth) {
            widthTotal += parseInt(item.minWidth)
            minWidthTotal += parseInt(item.minWidth)
          } else {
            widthTotal += 50
          }
        }
      })
    }
    each(columns)
    each = null
    return { floor, minWidthTotal, widthTotal }
  },
  setScroll(scroll = {}) {
    scroll = {
      x: this.scrollX,
      y: this.scrollY,
      ...scroll
    }
    this.scrollX = scroll.x > this.maxScrollWidth ? this.maxScrollWidth : scroll.x
    this.scrollY = scroll.y > this.maxScrollHeight ? this.maxScrollHeight : scroll.y
    this.$emit('scroll', { x: this.scrollX, y: this.scroll })
    this.draw(false)
  },
  pushSlot(val) {
    const isParentCell = Boolean(val.children)
    let i = { 'left': 0, 'right': 2 }[val.fixed] || 1
    if (val.headerCustomRender) {
      this.slotList[0].list[i].list.push(val)
    }
    if (val.customRender && !isParentCell) {
      this.slotList[1].list[i].list.push(val)
    }
    if (val.summaryCustomRender && !isParentCell) {
      this.slotList[2].list[i].list.push(val)
    }
  },
  getSlotStyle(content, fixed, cell, index) {
    let left = cell._left
    let top = cell._top
    let height = cell._height

    if (fixed === 'center') {
      left -= (this.scrollX + this.fixedLeftWidth)
    } else if (fixed === 'right') {
      left = left - (this.wrapperWidth - this.fixedRightWidth) - this.maxScrollWidth
    }

    if (content === 'body') {
      top = index * this.rowHeight - this.scrollY
      height = this.rowHeight
    } else if (content === 'sum') {
      top = 0
      height = this.summaryHeight
    }

    return {
      paddingLeft: this.style.padding + 'px',
      paddingRight: this.style.padding + 'px',
      width: cell.width + 'px',
      textAlign: cell.children && cell.children.length ? 'center' : (cell.align || 'left'),
      left: left + 'px',
      top: top + 'px',
      height: height + 'px'
    }
  },
  getSlotColStyle(fixed, cell) {
    let left = cell._left
    if (fixed === 'center') {
      left -= (this.scrollX + this.fixedLeftWidth)
    } else if (fixed === 'right') {
      left = left - (this.wrapperWidth - this.fixedRightWidth) - this.maxScrollWidth
    }
    // let index = parseInt(this.scrollY / this.rowHeight)
    let top = this.scrollY % this.rowHeight
    return {
      position: 'absolute',
      width: cell.width + 'px',
      textAlign: cell.align || 'left',
      left: left + 'px',
      top: -top + 'px',
    }
  },
  getSlotCellStyle() {
    return {
      paddingLeft: this.style.padding + 'px',
      paddingRight: this.style.padding + 'px',
      width: '100%',
      position: 'initial',
      height: this.rowHeight + 'px'
    }
  },
  getSlotColumns(list, fixed) {
    if (fixed === 'center') {
      return list.filter(col => {
        let _left = col._left - this.scrollX
        return _left + col.width >= this.fixedLeftWidth && _left <= this.wrapperWidth - this.fixedRightWidth
      })
    } else {
      return list
    }
  },
  displayRowCount() {
    let index = parseInt(this.scrollY / this.rowHeight)
    let endIndex = index + parseInt(this.bodyHeight / this.rowHeight) + 2
    endIndex = Math.min(endIndex, this.data.length)
    return endIndex - index
  },
  currentIndex(n) {
    return parseInt(this.scrollY / this.rowHeight) + n - 1
  }
}
