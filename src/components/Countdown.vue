<template>
  <div class="countdown-box" v-if="!ended">
    <span class="label">距离结束</span>
    <span class="time" :key="timeKey">{{ formattedTime }}</span>
  </div>
  <div class="countdown-box ended" v-else>已结束</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  /** 秒杀结束时间戳（毫秒） */
  endTime: {
    type: Number,
    default: 0
  }
})

const remaining = ref(0)
const timer = ref(null)
const timeKey = ref(0)

const ended = computed(() => remaining.value <= 0)

const formattedTime = computed(() => {
  const s = Math.max(0, Math.floor(remaining.value / 1000))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return [h, m, sec].map((v) => String(v).padStart(2, '0')).join(':')
})

function tick() {
  if (props.endTime) {
    remaining.value = props.endTime - Date.now()
    timeKey.value = Math.floor(Date.now() / 1000)
  }
}

onMounted(() => {
  tick()
  timer.value = setInterval(tick, 1000)
})

onUnmounted(() => {
  clearInterval(timer.value)
})
</script>

<style scoped>
.countdown-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.countdown-box .label {
  color: var(--text-secondary);
  font-weight: 500;
}

.countdown-box .time {
  color: var(--gold);
  font-weight: 700;
  font-size: 16px;
  padding: 4px 12px;
  background: linear-gradient(135deg, rgba(230, 67, 64, 0.9), rgba(184, 44, 40, 0.95));
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: var(--radius-sm);
  animation: countdown-tick 1s ease;
}

@keyframes countdown-tick {
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

.countdown-box.ended .time {
  display: none;
}

.countdown-box.ended {
  color: var(--text-placeholder);
}
</style>
