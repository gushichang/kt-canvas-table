
/**
 * props
 */
export default {
  data: { // 自动排序需加上 .sync
    type: Array,
    default: () => []
  },
  queryValue: { // 查询绑定的值 .sync
    type: Object,
    default: () => ({})
  },
  columns: { // 列配置，见下方
    type: Array,
    default: () => []
  },
  maxHeight: {
    type: Number,
    default: 700
  },
  border: {
    type: Boolean,
    default: false
  },
  stripe: { // 斑马线
    type: Boolean,
    default: false
  },
  autoSort: { // 是否自动排序
    type: Boolean,
    default: false
  },
  sort: { // 排序 支持 .sync
    type: Object,
    default: () => ({
      field: '',  // 排序字段
      orderByMode: '' // 排序方式： 1 - 倒序，0 - 正序
    })
  },
  hideHeader: Boolean, // 隐藏表头
  rowHeight: {
    type: Number,
    default: 42
  },
  headerRowHeight: { // Array： 设置每层的行高， Number： 每层都一样的行高
    type: [Number, Array],
    default: 42
  },
  summaryRowHeight: Number, // 汇总行高，默认为 rowHeight
  selectionKey: String, // 多选存的可以，默认取index
  disabledSelection: Function, // 复选框禁用
  selection: { // 多选选中的值 .sync
    type: Array,
    default: () => []
  },
  summary: Object, // 汇总
  highlightRow: Function, // (row, index) => String:color
  customStyle: { // 自定义样式
    type: Object,
    default: () => ({})
  },
  noDataText: {
    type: String,
    default: '暂无数据'
  }
}
/* customStyle: {
  padding: 8,
  borderColor: '#ebeef5',
  headerBackground: '#f9f9f9',
  summaryBackground: '#f9f9f9',
  background: '#fff',
  activeRowBackground: '#f0f9eb', // 点击行高亮颜色
  stripeRowBackground: '#fafafa',
  color: '#666',
  fontSize: 13,
  activeColBackground: '#f0f9eb', // 排序列高亮颜色
  primary: '#9266f9',
  iconFamily: 'iconfont'
}
 */
/**
 * columns: [{
 *  key: String,
 *  type: String, // index, selection,
 *  fixed: String, // 'left' / 'right'
 *  width: Number,
 *  minWidth: Number,
 *  label: [String, Function],
 *  labelStyle: [Function, Object] // return Object,
 *  formatter: (row, col, index) => [], //  见下方Formatter 配置
 *  sortable: [Boolean, String],
 *  cellStyle: [Function, Object],
 *  align: String, //
 *  labelAlign: String, //
 *  children: [],
 *  queryField: '', // 查询绑定的值
 *  queryComponent: '', // 查询过滤组件
 *  queryAttrs: {}, // 查询过滤组件需要传入的值
 *  summaryFormatter: [], //  见下方Formatter 配置
 *  headerFormatter: [Array, Function],
 *  headerTools: [], //  见下方Formatter 配置
 *  summaryAlign: 'center',
    summarySpan: 3,
    colResize: true,
    headerCustomRender: false,
    customRender: true, // Boolean | Function(h, { row, col }) | component
    summaryCustomRender: false,
    sortType: 'number', // 'number' / 'string'
    tooltip: [String, (row, col, index) => String ],
    headerTooltip: [String, (col) => String ],
    summaryTooltip: [String, (col) => String ],
 * }]
 */

/* let formatter = (row, col, index) [
  [
    {
      id: 'xxx', // 给事件做标识
      text: 'xxx',
      style: {
        width: 'xxx',
        height: 'xxx',
        border: [1, '#ccc'],
        borderBottom: [1, '#ccc'],
        borderTop: [1, '#ccc'],
        borderLeft: [1, '#ccc'],
        borderRight: [1, '#ccc'],
        padding: [Number, Array],
        color: 'xx',
        fontSize: Number,
        background: '',
        borderRadius: [Number, Array],
        margin: [Number, Array],
      },
      icon: {
        text: 'xxx',
        direction: '', // 图表位置 'left' / 'right'
        style: {
          color: 'xxx',
          fontSize: 'xxx',
          iconFamily: 'xxx',
          margin: 'xx', // 与文字的间距
          offsetY： 0, // 纵向偏移
        }
      },
      tooltip: { //  气泡
        content: '',
        placement: 'top',
      },
      on: {
        click: ({row, col, index, target}) => {},
        dblclick: () => {},
        'click.stop': () => {},
      }
    }
  ]
] */

  
