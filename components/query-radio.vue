<template>
  <div class="kt-canvas-table-select">
    <div>
      <el-radio-group
        :value="value"
        @input="$emit('input', $event)">
        <el-radio
          v-for="(item, index) in list"
          :key="index"
          v-on="item"
          :label="item.value"
          class="kt-canvas-table-select-row">{{ item.label }}</el-radio>
      </el-radio-group>
    </div>
    <div class="kt-canvas-table-select-footer">
      <el-button type="text" @click="onReset" :disabled="disabledReset">
        重 置
      </el-button>
      <el-button type="primary" @click="onConfirm">
        确 认
      </el-button>
    </div>
  </div>
</template>

<script>
import ElRadioGroup from 'element-ui/packages/radio-group'
import ElRadio from 'element-ui/packages/radio'
import ElButton from 'element-ui/packages/button'
import 'element-ui/lib/theme-chalk/radio-group.css'
import 'element-ui/lib/theme-chalk/radio.css'
import 'element-ui/lib/theme-chalk/button.css'
import { isNull } from '../utils'
export default {
  components: { ElRadioGroup, ElRadio, ElButton },
  props: {
    list: Array,
    value: [Number, String]
  },
  computed: {
    disabledReset() {
      return isNull(this.value)
    }
  },
  methods: {
    onConfirm() {
      this.$emit('confirm')
    },
    onReset() {
      this.$emit('input', '')
    }
  }
}
</script>

<style>

</style>
