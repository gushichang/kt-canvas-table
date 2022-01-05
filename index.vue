<template>
<div
  @animationstart="getWrapperWidth"
  ref="box"
  class="kt-canvas-table-box">
  <div
    ref="table"
    :class="{ 'kt-canvas-table_border': border }"
    class="kt-canvas-table">
    <canvas
      :style="{
        height: wrapperHeight + 'px',
        width: wrapperWidth + 'px',
      }"
      ref="canvas">
    </canvas>
    <operate-board
      ref="operate"
      class="kt-canvas-table-operate-board"
      :style="{
        '--bar-width': barWidth + 'px',
        '--background': style.background,
        '--border-color': style.borderColor,
        '--header-height': headerHeight + 'px',
        '--primary': style.primary,
        fontSize: style.fontSize + 'px',
        color: style.color,
      }"
      :wrapperWidth="wrapperWidth"
      :contentWidth="contentWidth"
      :maxScrollWidth="maxScrollWidth"
      :maxScrollHeight="maxScrollHeight"
      :contentHeight="contentHeight"
      :maxContentHeight="maxContentHeight"
      :bodyHeight="bodyHeight"
      @scroll="setScroll"
      @row-click="onRowClick"
      @col-resize="onColResize"
      @checkbox-click="onCheckboxClick"
      @checkbox-all-click="onCheckboxAllClick"
      @sort-click="onSortClick"
      @query-change="onQueryChange"
      v-on="events"
    >
      <template v-for="wrapRow in slotList">
        <div
          class="kt-canvas-table-slot-wrap"
          v-for="wrapCol in wrapRow.list"
          :style="{
            height: wrapCol.height() + 'px',
            width: wrapCol.width() + 'px',
            overflow: 'hidden'
          }"
          :key="wrapRow.type + wrapCol.type">
          <template v-if="wrapRow.type === 'body'">
            <div
              :key="col.key"
              :style="getSlotColStyle(wrapCol.type, col)"
              v-for="col in getSlotColumns(wrapCol.list, wrapCol.type)">
              <div
                class="kt-canvas-table-slot"
                :style="getSlotCellStyle(wrapCol.type, col)"
                v-for="n in displayRowCount()"
                :key="col.key + n">
                <slot
                  :index="currentIndex(n)"
                  :name="col.key + '_' + wrapRow.type"
                  :col="col"
                  :row="data[currentIndex(n)]">
                  <template  v-if="col.customRender !== true">
                    <custome-rander
                      v-if="typeof(col.customRender) === 'function'"
                      :type="wrapRow.type"
                      :col="col"
                      :index="currentIndex(n)"
                      :row="data[currentIndex(n)]"/>
                    <component
                      v-else
                      :is="col.customRender"
                      :type="wrapRow.type"
                      :col="col"
                      :index="currentIndex(n)"
                      :row="data[currentIndex(n)]"/>
                  </template>
                </slot>
              </div>
            </div>
          </template>
          <template v-else>
            <div
              class="kt-canvas-table-slot"
              :style="getSlotStyle(wrapRow.type, wrapCol.type, item)"
              v-for="item in getSlotColumns(wrapCol.list, wrapCol.type)"
              :key="item.key">
              <slot :name="item.key + '_' + wrapRow.type" :col="item" :row="wrapRow.type === 'sum' ? summary : null">
                <template v-if="(wrapRow.type === 'head' && item.headerCustomRender !== true) || (wrapRow.type === 'sum' && item.summaryCustomRender !== true)">
                  <custome-rander
                    v-if="(wrapRow.type === 'head' && typeof(item.headerCustomRender) === 'function') || (wrapRow.type === 'sum' && typeof(item.summaryCustomRender) === 'function')"
                    :type="wrapRow.type"
                    :col="item"
                    :row="wrapRow.type === 'sum' ? summary : null"/>
                  <component
                    v-else
                    :col="item"
                    :row="wrapRow.type === 'sum' ? summary : null"
                    :is="wrapRow.type === 'sum' ? item.summaryCustomRender : item.headerCustomRender"/>
                </template>
              </slot>
            </div>
          </template>
        </div>
      </template>
    </operate-board>
  </div>
</div>
</template>

<script>
import OperateBoard from './components/operate-board'
import data from './options/data'
import props from './options/props'
import computed from './options/computed'
import drawMethods from './options/methods-draw'
import baseMethods from './options/methods-base'
import watch from './options/watch'
import CustomeRander from './components/custome-render'
export default {
  name: 'kt-canvas-table',
  components: { OperateBoard, CustomeRander },
  props,
  data,
  computed,
  watch,
  methods: {
    ...drawMethods,
    ...baseMethods
  },
  mounted() {
    this.init()
  },
  activated() {
    this.redraw()
  },
  beforeDestroy() {
    this.removeEvents()
  }
}
</script>

<style>
  @import './table.css';
</style>
