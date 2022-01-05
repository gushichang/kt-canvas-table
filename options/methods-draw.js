import {
  getOffsetXByAlign,
  getIconWidth,
  getNodesInfoByFormatter,
  textOverflow,
  isNull
} from '../utils'
const borderTypes = {
  border: 'all',
  borderTop: 'top',
  borderBottom: 'bottom',
  borderRight: 'right',
  borderLeft: 'left',
}
// 绘制相关方法
export default {
  // 获取表头单元格的背景颜色
  getHeaderBackground(col) {
    if (col.labelStyle && col.labelStyle.background) {
      return col.labelStyle.background
    } else if (col.sortable && this.currentOrder.field === (col.sortable === true ? col.key : col.sortable)) {
      return this.style.activeRowBackground
    } else {
      return null
    }
  },
  // 获取表体单元格的背景颜色
  getBodyBackground(row, col, index) {
    const cellStyle = typeof col.cellStyle === 'function'
                        ? col.cellStyle(row, col, index)
                        : col.cellStyle
    if (cellStyle && cellStyle.background) {
      return cellStyle.background
    } else if (col.sortable && this.currentOrder.field === (col.sortable === true ? col.key : col.sortable)) {
      return this.style.activeRowBackground
    }
  },
  // 获取每行的背景颜色
  getRowBackground(row, index) {
    const highlightRow = this.highlightRow && this.highlightRow(row, index)
    if (highlightRow) {
      return highlightRow
    } else if (this.activeIndex === index) {
      return this.style.activeColBackground
    } else if (this.stripe && index % 2 !== 0) {
      return this.style.stripeRowBackground
    } else {
      return null
    }
  },
  redraw() {
    this.isInit && this.draw()
  },
  draw(clearCache = true) {
    if (clearCache) {
      this.bodyCellInfo = {}
      this.headerCellInfo = {}
      this.summaryCellInfo = {}
    }
    if (this.scrollX > this.maxScrollWidth) this.scrollX = this.maxScrollWidth
    if (this.scrollY > this.maxScrollHeight) this.scrollY = this.maxScrollHeight
    requestAnimationFrame(() => {
      this.ctx.clearRect(-1, -1, this.wrapperWidth + 1, this.wrapperHeight + 1)
      this.ctx.textBaseline = 'middle'
      this.drawBody('center')
      this.drawHeader('center')
      this.drawSummary('center')

      if (this.maxScrollWidth > 0) {
        if (this.scrollX > 0) {
          this.drawShadow(this.ctx, this.fixedLeftWidth, 'left')
        }
        if (this.scrollX < this.maxScrollWidth) {
          this.drawShadow(this.ctx, this.fixedRightWidth, 'right')
        }
      }

      this.ctx.clearRect(-1, 0, this.fixedLeftWidth, this.wrapperHeight)
      this.ctx.clearRect(this.wrapperWidth - this.fixedRightWidth, 0, this.fixedRightWidth, this.wrapperHeight + 1)

      this.drawBody('left')
      this.drawBody('right')

      this.drawNoData()

      this.drawSummary('left')
      this.drawSummary('right')

      this.drawHeader('left')
      this.drawHeader('right')
      if (this.border) {
        this.drawBorder(0, 0, this.wrapperWidth - 1, this.wrapperHeight - 1)
      } else if (!this.hideHeader) {
        this.drawBorder(0, 0, this.wrapperWidth - 1, this.wrapperHeight - 1, { direction: 'bottom' })
      }
    })
  },
  drawHeader(fixed) {
    if (this.hideHeader) return
    this.drawBackground(this.fixedPlateInfo[fixed].x, 0,
      this.fixedPlateInfo[fixed].width,
      this.headerHeight,
      this.style.headerBackground
    )

    let each = (list) => {
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        let _left = 0
        if (fixed === 'left') {
          _left = item._left
        } else if (fixed === 'right') {
          _left = item._left - this.maxScrollWidth
        } else {
          _left = item._left - this.scrollX
          if (_left + item.width < this.fixedLeftWidth) continue
          if (_left > this.wrapperWidth - this.fixedRightWidth) return
        }
        // 画背景边框
        this.drawCellRect(_left, item._top, {
          width: item.width,
          height: item._height,
          background: this.getHeaderBackground(item),
          ...(this.border ? {
            border: [1, this.style.borderColor]
          } : {}),
        })
        // 绘制列之间的小分割线
        if (!this.border && (!item.children || !item.children.length)) {
          const borderHeight = 22
          this.drawBorder(
            _left,
            item._top + (item._height - borderHeight) / 2,
            item.width,
            borderHeight,
            { direction: 'right' }
          )
        }
        if (item.headerCustomRender) continue
        if (!this.headerCellInfo[item.key]) {
          this.headerCellInfo[item.key] = this.getHeaderCellInfo(
            this.ctx,
            item.width - this.style.padding * 2,
            item._height,
            item,
            {
              color: this.style.headerColor,
              fontSize: this.style.fontSize,
              fontWeight: this.style.headerFontWeight,
              fontFamily: 'sans-serif',
            },
            item.children && item.children.length ? 'center' : item.align || 'left'
          )
        }
        this.headerCellInfo[item.key].forEach(val => {
          this.drawCellText({
            ...val,
            x: val.x + _left + this.style.padding,
            y: val.y + item._top,
            text: val._text,
            textWidth: val._textWidth || 0,
            col: item
          })
        })
        if (item.children && item.children.length) {
          each(item.children)
        }
      }
    }
    each(this.headerColumnsByFixed[fixed])
    each = null
    if (!this.border) {
      this.drawBorder(this.fixedPlateInfo[fixed].x, 0,
        this.fixedPlateInfo[fixed].width,
        this.headerHeight, {
        direction: 'bottom'
      })
    }
  },
  drawBody(fixed) {
    const list = this.bodyColumnsByFixed[fixed]
    let index = parseInt(this.scrollY / this.rowHeight)
    let endIndex = index + parseInt(this.bodyHeight / this.rowHeight) + 2
    endIndex = Math.min(endIndex, this.data.length)

    while (index < endIndex) {
      const row = this.data[index]
      const _top = this.headerHeight + index * this.rowHeight - this.scrollY
      this.drawBackground(this.fixedPlateInfo[fixed].x, _top,
        this.fixedPlateInfo[fixed].width,
        this.rowHeight,
        this.getRowBackground(row, index)
      )
      for (let i = 0; i < list.length; i++) {
        const col = list[i]
        let _left = 0
        if (fixed === 'left') {
          _left = col._left
        } else if (fixed === 'right') {
          _left = col._left - this.maxScrollWidth
        } else {
          _left = col._left - this.scrollX
          if (_left + col.width < this.fixedLeftWidth) continue
          if (_left > this.wrapperWidth - this.fixedRightWidth) break
        }
        // 画背景边框
        this.drawCellRect(_left, _top, {
          width: col.width,
          height: this.rowHeight,
          background: this.getBodyBackground(row, col, index)
        })
        // 画纵向线
        if (this.border && index === endIndex - 1) {
          this.drawBorder(_left, this.headerHeight, col.width, this.bodyHeight, {
            direction: fixed === 'right' ? 'left' : 'right'
          })
        }
        if (col.customRender) continue

        if (!this.bodyCellInfo[index]) this.bodyCellInfo[index] = {}
        if (!this.bodyCellInfo[index][col.key]) {
          this.bodyCellInfo[index][col.key] = this.getCellInfo(
            this.ctx,
            col.width - this.style.padding * 2, this.rowHeight,
            row, col,
            {
              color: this.style.color,
              fontSize: this.style.fontSize,
              fontFamily: 'sans-serif',
            },
            col.align || 'left',
            index
          )
        }
        this.bodyCellInfo[index][col.key].forEach(item => this.drawCellText({
          ...item,
          x: item.x + _left + this.style.padding,
          y: item.y + _top,
          text: item._text,
          textWidth: item._textWidth || 0
        }))
      }
      if (index !== endIndex - 1) {
        this.drawBorder(this.fixedPlateInfo[fixed].x, _top - 1, this.fixedPlateInfo[fixed].width, this.rowHeight, {
          direction: 'bottom'
        })
      }
      index++
    }
  },
  drawSummary(fixed) {
    if (!this.summary) return
    const list = this.bodyColumnsByFixed[fixed]
    const row = this.summary
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
      if (col.fixed === 'left') {
        _left = col._left
      } else if (col.fixed === 'right') {
        _left = col._left - this.maxScrollWidth
      } else {
        _left = col._left - this.scrollX
        if (_left + width < this.fixedLeftWidth) continue
        if (_left > this.wrapperWidth - this.fixedRightWidth) return
      }
      const _top = this.headerHeight + this.bodyHeight
      // 画背景边框
      this.drawCellRect(_left, _top, {
        width,
        height: this.summaryHeight,
        background: this.style.summaryBackground,
        [this.border ? 'border' : 'borderTop']: [1, this.style.borderColor]
      })
      if (col.summarySlot) continue

      if (!this.summaryCellInfo[col.key]) {
        this.summaryCellInfo[col.key] = this.getCellInfo(
          this.ctx,
          width - this.style.padding * 2, this.summaryHeight,
          row,
          {
            ...col,
            type: null,
            formatter: col.summaryFormatter || col.formatter
          },
          {
            color: this.style.color,
            fontSize: this.style.fontSize,
            fontFamily: 'sans-serif',
          },
          col.summaryAlign || col.align || 'left',
          0
        )
      }
      this.summaryCellInfo[col.key].forEach(item => this.drawCellText({
        ...item,
        x: item.x + _left + this.style.padding,
        y: item.y + _top,
        text: item._text,
        textWidth: item._textWidth || 0
      }))
    }
  },
  drawNoData() {
    if (!this.data || this.data.length === 0) {
      this.drawCellText({
        x: 0,
        y: this.headerHeight,
        width: this.wrapperWidth,
        height: this.rowHeight,
        style: { textAlign: 'center' },
        text: this.noDataText,
        textWidth: this.ctx.measureText(this.noDataText).width
      })
    }
  },
  drawCellRect(x, y, style) {
    this.drawBackground(x, y, style.width, style.height, style.background)
    // border
    Object.entries(borderTypes).forEach(([key, value]) => {
      if (style[key]) {
        this.drawBorder(x, y, style.width, style.height, {
          lineWidth: style[key][0],
          color: style[key][1],
          direction: value
        })
      }
    })
  },
  drawCellText({ x, y, height, width, text, textWidth, icon, style, id, col }) {
    if (id === '$sortable') {
      this.drawSortIcon(x, y, height, width, col)
      return
    }
    if (style.background) {
      this.drawBackground(x, y, width, height, style.background, style.borderRadius)
    }
    // border
    Object.entries(borderTypes).forEach(([key, value]) => {
      if (style[key]) {
        this.drawBorder(x, y, width, height, {
          lineWidth: style[key][0],
          color: style[key][1],
          direction: value,
          borderRadius: style.borderRadius
        })
      }
    })

    style = {
      fontSize: 13,
      color: '#666666',
      fontWeight: 'normal',
      fontFamily: 'sans-serif',
      textAlign: 'left',
      padding: [0, 0, 0, 0],
      ...style
    }
    const iconWidth = getIconWidth(icon, style.fontSize)
    let offsetX = getOffsetXByAlign(textWidth + iconWidth, width - style.padding[1] - style.padding[3], style.textAlign)
    let startX = x + style.padding[3] + offsetX
    if (icon) {
      const iconStyle = {
        fontSize: style.fontSize,
        fontFamily: this.style.iconFamily,
        fontWeight: 'normal',
        color: style.color,
        margin: 0,
        ...icon.style,
      }
      this.ctx.font = `${iconStyle.fontWeight} ${iconStyle.fontSize}px ${iconStyle.fontFamily}`
      this.ctx.fillStyle = iconStyle.color
      this.ctx.fillText(String.fromCharCode(parseInt(icon.text.replace('&#x', ''), 16)),
        icon.direction === 'right' ? (startX + textWidth + iconStyle.margin) : startX,
        y + height / 2 + (iconStyle.offsetY || 0)
      )
      startX = icon.direction === 'right' ? startX : (startX + iconWidth)
    }
    if (text) {
      this.ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`
      this.ctx.fillStyle = style.color
      this.ctx.fillText(text, startX, y + height / 2 + 1)
    }
  },
  drawRadius(x, y, w, h, r) {
    const maxR = Math.min(w, y) / 2
    r = r.map(v => Math.min(maxR, v))
    this.ctx.beginPath()
    this.ctx.moveTo(x + r[0], y)
    this.ctx.arcTo(x + w, y, x + w, y + h, r[1])
    this.ctx.arcTo(x + w, y + h, x, y + h, r[2])
    this.ctx.arcTo(x, y + h, x, y, r[3])
    this.ctx.arcTo(x, y, x + w, y, r[1])
    this.ctx.closePath()
  },
  drawBackground(x, y, width, height, color, radius) {
    if (!color) return
    this.ctx.fillStyle = color
    if (radius) {
      this.drawRadius(x, y, width, height, radius)
      this.ctx.fill()
    } else {
      this.ctx.fillRect(x, y, width, height)
    }
  },
  drawBorder(x, y, width, height, style) {
    style = {
      lineWidth: 1,
      color: this.style.borderColor,
      borderRadius: 0,
      direction: 'all',
      ...style
    }
    this.ctx.lineWidth = style.lineWidth
    this.ctx.beginPath()
    this.ctx.strokeStyle = style.color
    switch (style.direction) {
      case 'all':
        if (style.borderRadius) this.drawRadius(x, y, width, height, style.borderRadius)
        else this.ctx.strokeRect(x, y, width, height)
        break
      case 'top':
        this.ctx.moveTo(x, y)
        this.ctx.lineTo(x + width, y)
        break
      case 'right':
        this.ctx.moveTo(x + width, y)
        this.ctx.lineTo(x + width, y + height)
        break
      case 'bottom':
        this.ctx.moveTo(x + width, y + height)
        this.ctx.lineTo(x, y + height)
        break
      case 'left':
        this.ctx.moveTo(x, y + height)
        this.ctx.lineTo(x, y)
        break
    }
    this.ctx.stroke()
  },
  drawShadow(ctx, width, direction, style = { shadowBlur: 20, shadowColor: 'rgba(0, 0, 0, 0.2)' }) {
    ctx.shadowBlur = style.shadowBlur
    ctx.shadowColor = style.shadowColor
    ctx.fillStyle = '#fff'
    ctx.fillRect(
      direction === 'left' ? 0 : (this.wrapperWidth - width),
      0,
      width,
      ctx.canvas.height
    )
    ctx.shadowBlur = 0
    ctx.shadowColor = 'rgba(0, 0, 0, 0)'
  },
  drawSortIcon(x, y, height, width, col) {
    let sortWidth = 9
    let centerY = y + height / 2
    x = (width - sortWidth) / 2 + x
    const isCheck = this.currentOrder.field === (typeof col.sortable === 'string' ? col.sortable : col.key)
    // 三角形之间的间距
    const iconMargin = 2
    // 上三角
    this.ctx.beginPath()
    this.ctx.moveTo(x, centerY - iconMargin / 2)
    this.ctx.lineTo(x + sortWidth, centerY - iconMargin / 2)
    this.ctx.lineTo(x + sortWidth / 2, centerY - iconMargin / 2 - sortWidth / 2)
    this.ctx.closePath()
    this.ctx.fillStyle = isCheck && this.currentOrder.orderByMode === 0 ? this.style.primary : this.style.iconColor
    this.ctx.fill()
    // 下三角
    this.ctx.beginPath()
    this.ctx.moveTo(x, centerY + iconMargin / 2)
    this.ctx.lineTo(x + sortWidth, centerY + iconMargin / 2)
    this.ctx.lineTo(x + sortWidth / 2, centerY + iconMargin / 2 + sortWidth / 2)
    this.ctx.closePath()
    this.ctx.fillStyle = isCheck && this.currentOrder.orderByMode === 1 ? this.style.primary : this.style.iconColor
    this.ctx.fill()
  },
  getHeaderCellInfo (ctx, width, height, col, commonStyle, align) {
    const btns = []
    let btnsWidth = 0
    if (col.sortable) {
      btns.push({
        id: '$sortable',
        height,
        width: 16,
        x: 0,
        y: 0,
        style: { padding: [0, 0, 0, 4] }
      })
      btnsWidth += 16
    }
    if (col.queryField) {
      btns.push({
        id: '$query',
        height: 30,
        width: 20,
        x: btnsWidth + 4,
        y: (height - 30) / 2,
        style: {
          textAlign: 'center',
          cursor: 'pointer',
          color: isNull(this.currentQueryValue[col.queryField]) ? this.style.iconColor : this.style.primary,
          fontSize: 14
        },
        icon: {
          text: '&#xe866;',
          style: { fontFamily: 'kt-iconfont' }
        }
      })
      btnsWidth += 24
    }
    if (col.headerTools) {
      const headerTools = typeof col.headerTools === 'function'
                  ? col.headerTools(col)
                  : col.headerTools
      const tools = getNodesInfoByFormatter(headerTools, ctx, width - btnsWidth, height, commonStyle, 'left')
      if (tools.length > 0) {
        tools.forEach(v => v.x += btnsWidth)
        btnsWidth = tools[tools.length - 1].x + tools[tools.length - 1].width
        btns.push(...tools)
      }
    }
    const residueWidth = Math.max(width - btnsWidth, 0)
    const formatter = typeof col.headerFormatter === 'function'
                  ? col.headerFormatter(col)
                  : col.headerFormatter
    const textNodes = getNodesInfoByFormatter(formatter || [[{
      text: col.label,
      style: col.labelStyle || {}
    }]], ctx, residueWidth, height, commonStyle, align)

    let textWidth = Math.max(...textNodes.map(v => v.x + v.width)) - Math.min(...textNodes.map(v => v.x))

    if (align === 'center') {
      let startX = (residueWidth - textWidth) / 2
      btns.forEach(v => v.x += startX + textWidth)
    } else if (align === 'right') {
      btns.forEach(v => v.x += (residueWidth))
    } else {
      btns.forEach(v => v.x += textWidth)
    }
    return [
      ...textNodes,
      ...btns
    ]
  },
  getCellInfo (ctx, width, height, row, col, commonStyle, align, index) {
    const cellStyle = typeof col.cellStyle === 'function'
              ? col.cellStyle(row, col, width)
              : col.cellStyle

    const style = {
      ...commonStyle,
      ...cellStyle
    }
    if (col.formatter) {
      const formatter = typeof col.formatter === 'function'
                  ? col.formatter(row, col, index, width)
                  : col.formatter
      return getNodesInfoByFormatter(formatter, ctx, width, height, style, align)
    } else {
      const text = col.type === 'index' ? (index + 1) : row[col.key]
      const { tw, over: isOver, text: _text } = textOverflow(ctx, text, width, style.fontSize)
      return [{
        text,
        isOver,
        _text,
        _textWidth: isOver ? width : tw,
        x: 0,
        y: 0,
        height,
        width,
        style: {
          fontSize: style.fontSize,
          color: style.color,
          textAlign: align,
          padding: [0, 0, 0, 0],
          margin: [0, 0, 0, 0],
          borderRadius: [0, 0, 0, 0],
        }
      }]
    }
  }
}
