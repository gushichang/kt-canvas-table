const defaultStyle = {
  padding: 8,
  borderColor: '#ebeef5',
  headerBackground: '#f9f9f9',
  // headerBackground: '#fff',
  summaryBackground: '#f5f7fa',
  background: '#fff',
  activeRowBackground: '#f0f9eb',
  // activeRowBackground: 'rgba(66, 129, 255, 0.3)',
  stripeRowBackground: '#fafafa',
  color: '#666',
  headerColor: '#666',
  headerFontWeight: 'normal',
  fontSize: 13,
  activeColBackground: '#f0f9eb',
  primary: '#096dd9',
  iconFamily: 'iconfont',
  iconColor: '#bfbfbf'
}

export default {
  style() {
    return {
      ...defaultStyle,
      ...this.customStyle
    }
  },
  summaryHeight() {
    return this.summary ? (this.summaryRowHeight || this.rowHeight) : 0
  },
  maxContentHeight() {
    return this.maxHeight -
            this.headerHeight -
            this.summaryHeight -
            (this.maxScrollWidth > 0 ? (this.barWidth || 10) : 0)
  },
  contentHeight() {
    return this.rowHeight * (this.data.length || 1)
  },
  maxScrollHeight() {
    const diff = this.contentHeight - this.maxContentHeight
    return diff > 0 ? diff : null
  },
  bodyHeight() {
    return this.maxScrollHeight ? this.maxContentHeight : this.contentHeight
  },
  wrapperHeight() {
    return this.headerHeight +
            this.bodyHeight +
            this.summaryHeight +
            (this.maxScrollWidth > 0 ? (this.barWidth || 10) : 0)
  },
  maxScrollWidth() {
    const diff = this.contentWidth - this.wrapperWidth
    return diff > 0 ? diff : null
  },
  headerColumnsByFixed() {
    return {
      'left': this.currentColumns.filter(item => item.fixed === 'left'),
      'right': this.currentColumns.filter(item => item.fixed === 'right'),
      'center': this.currentColumns.filter(item => !item.fixed)
    }
  },
  bodyColumnsByFixed() {
    return {
      'left': this.bodyColumns.filter(item => item.fixed === 'left'),
      'right': this.bodyColumns.filter(item => item.fixed === 'right'),
      'center': this.bodyColumns.filter(item => !item.fixed)
    }
  },
  fixedPlateInfo() {
    return {
      left: {
        x: 0,
        width: this.fixedLeftWidth
      },
      center: {
        x: this.fixedLeftWidth,
        width: this.wrapperWidth - this.fixedLeftWidth - this.fixedRightWidth
      },
      right: {
        x: this.wrapperWidth - this.fixedRightWidth,
        width: this.fixedRightWidth
      }
    }
  },
  allChecked() {
    let l = 0
    if (!this.disabledSelection) {
      l = this.data.length
    } else {
      l = this.data.filter((v, i) => !this.disabledSelection(v, i))
    }
    return l > 0 && this.currentSelection.length === l
  }
}
