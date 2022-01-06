## kt-canvas-table 以 canvas 绘制的 vue 表格组件，解决上万行+上万列大数据渲染问题

### Install

```bash
npm install kt-canvas-table --save

# or
yarn add kt-canvas-table

```

### Demo && api

-   [Demo](http://gushichang.gitee.io/kt-canvas-table-document/#/)

### Example

```html
<template>
	<canvas-table :data="data" :columns="columns" :max-height="600">
	</canvas-table>
</template>
<script>
	import CanvasTable from "kt-canvas-table"

	export default {
		components: { CanvasTable },
		data() {
			return {
				// data: [],
				data: [
					{ profit: "100%", volume: 100, waybill: "700" },
					{ profit: "100%", volume: 100, waybill: "700" },
					{ profit: "100%", volume: 100, waybill: "700" },
					{ profit: "100%", volume: 100, waybill: "700" },
				],
				columns: [
					{
						label: "序号",
						key: "$$index",
						type: "index",
						fixed: "left",
						align: "center",
						colResize: false,
						width: 40,
					},

					{
						label: "营业额",
						key: "profit",
					},
					{
						label: "利润率",
						key: "volume",
						minWidth: 140,
					},
					{
						label: "运单",
						key: "waybill",
						minWidth: 140,
					},
				],
			}
		},
	}
</script>
```
### API
```js
props: {
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
  selectionKey: String, // 多选存的key，默认取index
  disabledSelection: Function, // 复选框禁用 (row, index) => Boolean
  selection: { // 多选选中的值 支持.sync
    type: Array,
    default: () => []
  },
  summary: Object, // 汇总数据，跟行数据格式一样
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
// 自定义样式
customerStyle: {
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
  primary: '#9266f9'
}
// 列配置
columns: [{
  key: String,
  type: String, // index, selection,
  fixed: String, // 'left' / 'right'
  width: Number,
  minWidth: Number,
  label: String,
  labelStyle: [Function, Object] // return Object,
  formatter: (row, col, index) => [],
  sortable: [Boolean, String], // true: 排序字段跟key一样， 排序字段跟key不一样时 可以指定一个 String
  cellStyle: [Function, Object], //  自定义单元格样式
  align: String, // 
  labelAlign: String, // 
  children: [],
  queryComponent: '', // 查询过滤组件
  queryAttrs: {}, // 查询过滤组件需要传入的值
  summaryFormatter: [],
  headerFormatter: [Array, Function], // 参考formatter
  headerTools: [Array, Function], // 放在排序后面工具栏， 参考formatter
  summaryAlign: 'center',
  summarySpan: Number, // 汇总栏单元格横跨多少个单元格
  colResize: true, // 是否可拖动列宽
  sortType: 'number', //  'number' / 'string'
  tooltip: [String, (row, col, index) => String ], // 气泡
  headerTooltip: [String, (col) => String ],
  summaryTooltip: [String, (col) => String ],
  disabledRightClick: true, // 单元格右击默认会文字选择提供复制使用
  customRender: [Boolean, (h, { row, col, index }) => {}], // true: 会提供一个slot自定义渲染， 或使用jsx自定义渲染
  headerCustomRender: [Boolean, (h, { row, col, index }) => {}],
  summaryCustomRender: [Boolean, (h, { row, col, index }) => {}],
}]
// formatter [String, Array, Object, Function]
(row, col, index, width) => [
  [ // 每一行标识
    { // 节点
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
        direction: '', // 图标位置 'left' / 'right'
        style: {
          color: 'xxx',
          fontSize: 'xxx',
          fontFamily: 'xxx',
          margin: 'xx', // 与文字的间距
          offsetY： 0, // 纵向偏移
        }
      },
      tooltip: { // 气泡
        content: 'xxx',
        placement: '',
        style: {}
      },
      on: { //  暂支持的事件有: click, dblclick，支持 .stop 修饰符 阻止其他事件，如 cell-click 事件
        click: ({ col, row, index, target, box }) => {},
        'click.stop': ({ col, row, index, target, box }) => {},
      }
    }
  ]
]
// slot 插槽：
{key}_body / {key}_head / {key}_sum

// 事件
'cell-click': (row, col, index) => {}, 
'row-click': (row, index) => {},
'header-cell-click': (col) => {},
'col-resize': (col) => {},
'row-dblclick': (row, index) => {},
'cell-dblclick': (row, col, index) => {},
'mousemove': ({ row, col, index, target, box, rect }) => {},
'query-change': (key, val, this.currentQueryValue) => {},
'selection-change': (currentSelection) => {},
'mouseleave': () => {},
'sort': (currentOrder, col) => {},
'scroll': ({ x, y }) => {},

// 内部方法
setScroll({ x: Number, y: Number }), // 设置滚动条
createPopover(rect, { component, attrs, events }, placement), // 创建一个气泡，第一个参数是相对于表格的位置信息，第二个参数是一个对象，需要有一个组件及组件的属性与事件
hidePopover(), // 隐藏气泡
```
