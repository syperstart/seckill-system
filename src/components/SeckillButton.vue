<template>
  <el-button
    type="danger"
    size="large"
    :disabled="disabled"
    :loading="loading"
    class="seckill-btn"
    @click="$emit('click')"
  >
    <LightningIcon v-if="!loading && stock > 0" :size="18" color="currentColor" />
    {{ buttonText }}
  </el-button>
</template>

<script setup>
import { computed } from 'vue'
import LightningIcon from './LightningIcon.vue'

const props = defineProps({
  /** 库存数量 */
  stock: { type: Number, default: 0 },
  /** 加载状态 */
  loading: { type: Boolean, default: false }
})

defineEmits(['click'])

const disabled = computed(() => props.stock <= 0)
const buttonText = computed(() => (props.stock > 0 ? '立即秒杀' : '已抢光'))
</script>

<style scoped>
.seckill-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  font-size: 18px;
  font-weight: 700;
  padding: 16px;
  background: var(--seckill-red) !important;
  border-color: var(--seckill-red) !important;
}

.seckill-btn:hover:not(:disabled):not(.is-loading) {
  background: var(--gold) !important;
  border-color: var(--gold) !important;
  color: var(--text-primary) !important;
  box-shadow: var(--shadow-gold);
}
</style>
