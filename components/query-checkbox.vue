<template>
  <div class="kt-canvas-table-select">
    <div>
      <el-checkbox-group
        :value="value || []"
        @input="$emit('input', $event)">
        <el-checkbox
          v-for="(item, index) in list"
          :key="index"
          v-on="item"
          :label="item.value"
          class="kt-canvas-table-select-row">{{ item.label }}</el-checkbox>
      </el-checkbox-group>
    </div>
    <div class="kt-canvas-table-select-footer">
      <el-button type="text" @click="onReset" :disabled="disabledReset">
        重 置
      </el-button>
      <el-button type="primary" @click="onConfirm" size="mini">
        确 认
      </el-button>
    </div>
  </div>
</template>

<script>
import ElCheckboxGroup from '../el-components/checkbox-group'
import ElCheckbox from '../el-components/checkbox'
import ElButton from '../el-components/button'
import { isNull } from '../utils'
export default {
  components: { ElCheckboxGroup, ElCheckbox, ElButton },
  props: {
    list: Array,
    value: [Array]
  },
  data() {
    return {
      currentValue: this.value ? [...this.value] : []
    }
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
      this.$emit('input', [])
    }
  }
}
</script>

<style>

</style>
