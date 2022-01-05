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
