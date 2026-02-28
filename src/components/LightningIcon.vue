<template>
  <svg
    class="lightning-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13 2L4 14h7l-2 8 10-12h-7l2-8z"
      :stroke="color"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup>
defineProps({
  size: { type: [Number, String], default: 20 },
  color: { type: String, default: 'currentColor' }
})
</script>

<style scoped>
.lightning-icon {
  flex-shrink: 0;
  transition: transform 0.2s;
}
</style>
