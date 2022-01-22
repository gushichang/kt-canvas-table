
// 校验中文正则
const chineseReg = /[\u4e00-\u9fa5|%]/

const chineseMark = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5|@|$]/

const numReg = /[0-9]/

// 溢出隐藏计算
export const textOverflow = (ctx, text, width, fontSize) => {
  let str = ''
  let len = 0
  let over = false
  const zhWidth = fontSize // 中文
  // 测量数字和...的宽度

  ctx.font = `${fontSize}px sans-serif`
  const numWidth = Math.round(ctx.measureText('0').width * 100) / 100
  const threePoint = Math.round(ctx.measureText('...').width * 100) / 100

  // 字段值存在 或者为 0
  text = text || (typeof text === 'number') ? text + '' : ''
  // 文字宽度
  const tw = Math.floor(ctx.measureText(text).width) || 1
  if (text && text.length > 2 && tw > (width - len)) {
    let arr = text.split('')
    for (let i = 0, le = arr.length; i < le; i++) {
      let char = arr[i]
      if (chineseReg.test(char) || chineseMark.test(char)) {
        len += zhWidth
      } else if (numReg.test(char)) {
        len += numWidth
      } else {
        len += Math.round(ctx.measureText(char).width * 100) / 100
      }
      if (len > (width - threePoint)) {
        str += '...'
        over = true
        break
      } else {
        str += char
      }
    }
  } else {
    str = text
  }
  return {
    tw,
    over,
    text: str
  }
}
/**
 * 计算 x 起止点
 * @param {number} contentWidth
 * @param {number} maxWidth
 * @param {string} algin
 * @returns x
 */
export function getOffsetXByAlign(contentWidth, maxWidth, algin) {
  if (algin === 'center') {
    return parseInt((maxWidth - contentWidth) / 2)
  } else if (algin === 'right') {
    return (maxWidth - contentWidth)
  } else {
    return 0
  }
}
/**
 * icon 的宽度计算
 * @param {*} icon
 * @param {*} fontSize
 * @returns width
 */
export const getIconWidth = (icon, fontSize) => {
  if (icon) {
    let style = icon.style ? icon.style : {}
    return style.width ? style.width : ((style.margin || 0) + (style.fontSize || fontSize) * 1)
  } else {
    return 0
  }
}
/**
 * 补全'borderRadius', 'padding', 'margin' 样式，
 * @param {*} style
 */
export const fillStyle = style => {
  ['borderRadius', 'padding', 'margin'].forEach(key => {
    let val = style[key]
    let res = []
    if (val) {
      if (typeof val === 'number') {
        res = [val, val, val, val]
      } else if (Array.isArray(val)) {
        switch (val.length) {
          case 0: res = [0, 0, 0, 0]
          break
          case 1: res = [val[0], val[0], val[0], val[0]]
          break
          case 2: res = [val[0], val[1], val[0], val[1]]
          break
          case 3: res = [val[0], val[1], val[2], val[1]]
          break
          default: res = val
        }
      } else {
        res = [0, 0, 0, 0]
      }
    } else {
      res = [0, 0, 0, 0]
    }
    style[key] = res
  })
}

const lineHeight = 1.4
/**
 * 根据 formatter 计算每个节点信息
 * @param {*} formatter
 * @param {*} ctx
 * @param {*} width
 * @param {*} height
 * @param {*} style
 * @param {*} align
 * @returns [{
 *  id,
*   _text,
    text,
    isOver,
    _textWidth,
    height,
    x,
    y,
    width,
    style,
    icon
  }]
 */
export const getNodesInfoByFormatter = (formatter, ctx, width, height, style, align) => {
  if (width <= 0) return []
  if (Array.isArray(formatter)) {
    if (formatter[0] && !Array.isArray(formatter[0])) {
      formatter = [formatter]
    }
  } else if (typeof formatter === 'object' && formatter !== null) {
    formatter = [[formatter]]
  } else {
    formatter = [[{ text: formatter }]]
  }
  const lineInfo = []
  // 计算每行宽高信息
  formatter.forEach((line) => {
    const lineVal = {
      height: 0,
      width: 0,
      marginTop: 0,
      marginBottom: 0
    }
    lineInfo.push(lineVal)
    line.forEach(item => {
      const itemStyle = {
        ...style,
        ...item.style
      }
      fillStyle(itemStyle)
      let itemHeight = 0
      let itemWidth = 0
      if (item.style && item.style.height) {
        itemHeight = item.style.height
      } else {
        let iconFontSize = item.icon && item.icon.style && item.icon.style.fontSize
                      ? item.icon.style.fontSize : 0
        let maxFontSize = Math.max(itemStyle.fontSize, iconFontSize)
        itemHeight = maxFontSize * lineHeight + itemStyle.padding[0] + itemStyle.padding[2]
      }
      if (item.style && item.style.width) {
        itemWidth = item.style.width
      } else {
        itemWidth = textOverflow(ctx, item.text, width, itemStyle.fontSize).tw +
                    itemStyle.padding[1] + itemStyle.padding[3] +
                    itemStyle.margin[1] + itemStyle.margin[3]
        if (item.icon) {
          itemWidth += getIconWidth(item.icon, itemStyle.fontSize)
        }
      }

      lineVal.height = lineVal.height > itemHeight ? lineVal.height : itemHeight
      lineVal.width += itemWidth
      lineVal.marginTop = lineVal.marginTop > itemStyle.margin[0] ? lineVal.marginTop : itemStyle.margin[0]
      lineVal.marginBottom = lineVal.marginBottom > itemStyle.margin[2] ? lineVal.marginBottom : itemStyle.margin[2]
    })
  })

  const totalHeight = lineInfo.reduce((t, val) => t + val.height + val.marginTop + val.marginBottom, 0)
  let y = (height - totalHeight) / 2
  const items = []
  formatter.forEach((line, i) => {
    const lineVal = lineInfo[i]
    let x = 0
    let isOverflow = lineVal.width > width
    if (isOverflow) {
      x = 0
    } else {
      x = getOffsetXByAlign(lineVal.width, width, align)
    }
    line.forEach(item => {
      const itemStyle = {
        ...style,
        ...item.style
      }
      fillStyle(itemStyle)

      const itemX = itemStyle.margin[3] + x
      const residueWidth = width - itemX
      if (residueWidth <= 0) return

      const text = item.text

      let itemWidth = 0
      let _text = ''
      let _textWidth = 0
      let isOver = false
      let iconWidth = getIconWidth(item.icon, itemStyle.fontSize)
      if (item.style && item.style.width) {
        itemWidth = Math.min(item.style.width, residueWidth)
        const maxTextWidth = itemWidth -
                            itemStyle.padding[1] - itemStyle.padding[3] -
                            iconWidth
        if (maxTextWidth <= 0) return
        const info = textOverflow(ctx, text, maxTextWidth, itemStyle.fontSize)
        _text = info.text
        isOver = info.over
        _textWidth = isOver ? maxTextWidth : info.tw
      } else {
        const maxTextWidth = width - itemX -
                            itemStyle.padding[1] - itemStyle.padding[3] -
                            iconWidth
        if (maxTextWidth <= 0) return
        const info = textOverflow(ctx, text, maxTextWidth, itemStyle.fontSize)
        _text = info.text
        isOver = info.over
        _textWidth = isOver ? maxTextWidth : info.tw
        itemWidth = _textWidth + itemStyle.padding[1] + itemStyle.padding[3] + iconWidth
      }

      const val = {
        ...item,
        _text,
        text,
        isOver,
        _textWidth,
        height: lineVal.height,
        x: itemX,
        y: y + lineVal.marginTop,
        width: itemWidth,
        style: itemStyle
      }
      x += (itemWidth + itemStyle.margin[1] + itemStyle.margin[3])
      items.push(val)
    })
    y += (lineVal.marginTop + lineVal.marginBottom + lineVal.height)
  })
  return items
}

export const listSort = (data, key, order, sortType) => {
  if (!key) return data
  const list = [...data]
  // notOrder 如果不排序放到最底下
  if (order === 0) {
    list.sort((a, b) => {
      let c = a[key]
      let d = b[key]
      if (sortType === 'string' || (isNaN(Number(c)) && isNaN(Number(d)))) {
        return (c || '').localeCompare(d || '', 'zh')
      } else {
        return c - d
      }
    })
  } else if (order === 1) {
    list.sort((a, b) => {
      let c = a[key]
      let d = b[key]
      if (sortType === 'string' || (isNaN(Number(c)) && isNaN(Number(d)))) {
        return (d || '').localeCompare(c || '', 'zh')
      }
      return d - c
    })
  } else {
    return data
  }
  return list
}

export const isNull = (val) => {
  if (typeof val === 'object' && val !== null) {
    if (Array.isArray(val)) {
      return val.length <= 0
    } else {
      return Object.keys(val).length <= 0
    }
  } else {
    return !(Boolean(val) || val === 0)
  }
}
