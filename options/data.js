export default function () {
  return {
    scrollX: 0,
    scrollY: 0,
    wrapperWidth: 0, //
    headerHeight: 0,
    // widthConfig: {},
    currentColumns: [],
    bodyColumns: [],
    // ctx: null,
    fixedLeftWidth: 0,
    fixedRightWidth: 0,
    contentWidth: 0,
    // bodyCellInfo: {},
    // headerCellInfo: {},
    // summaryCellInfo: {},
    activeIndex: null,
    currentOrder: {
      field: '',
      orderByMode: ''
    },
    barWidth: 12,
    slotList: [],
    isInitSlot: false,
    isInit: false,
    currentData: [],
    currentSelection: [],
    currentQueryValue: {},
    events: {
      'cell-click': (...e) => this.$emit('cell-click', ...e),
      'row-click': (...e) => this.$emit('row-click', ...e),
      'header-cell-click': (...e) => this.$emit('header-cell-click', ...e),
      'col-resize': (...e) => this.$emit('col-resize', ...e),
      'row-dblclick': (...e) => this.$emit('row-dblclick', ...e),
      'cell-dblclick': (...e) => this.$emit('cell-dblclick', ...e),
      'mousemove': (...e) => this.$emit('mousemove', ...e),
      'query-click': (...e) => this.$emit('query-click', ...e),
      'mouseleave': (...e) => this.$emit('mouseleave', ...e),
    }
  }
}
