export default {
  functional: true,
  props: {
    row: Object,
    col: Object,
    index: Number,
    type: String
  },
  render (h, self) {
    const renderKeys = {
      'body': 'customRender',
      'head': 'headerCustomRender',
      'sum': 'summaryCustomRender',
    }
    let render = self.props.col[renderKeys[self.props.type]]
    if (typeof render === 'function') {
      return render(h, { ...self.props })
    } else {
      return ''
    }
  }
}
