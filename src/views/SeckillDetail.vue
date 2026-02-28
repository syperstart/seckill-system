<template>
  <div class="seckill-detail-page">
    <header class="header">
      <router-link to="/products">← 返回商品列表</router-link>
    </header>

    <main class="main" v-loading="loading">
      <el-row :gutter="32">
        <el-col :xs="24" :md="12">
          <div class="product-image">
            <img v-if="detail.image" :src="detail.image" alt="商品图" />
            <div v-else class="product-image-placeholder">暂无图片</div>
          </div>
        </el-col>
        <el-col :xs="24" :md="12">
          <div class="product-detail">
            <h1>{{ detail.name || '秒杀商品' }}</h1>
            <div class="price-row">
              <span class="seckill-price">¥{{ detail.seckillPrice || '0.00' }}</span>
              <span class="original-price">¥{{ detail.originalPrice || '0.00' }}</span>
            </div>
            <Countdown :end-time="detail.seckillEndTime || 0" class="countdown" />
            <SeckillButton
              :stock="detail.stock"
              :loading="orderLoading"
              @click="handleSeckill"
            />
          </div>
        </el-col>
      </el-row>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Countdown from '@/components/Countdown.vue'
import SeckillButton from '@/components/SeckillButton.vue'

const route = useRoute()
const loading = ref(false)
const orderLoading = ref(false)
const detail = reactive({
  id: null,
  name: '',
  image: '',
  seckillPrice: '',
  originalPrice: '',
  stock: 0,
  seckillEndTime: null
})

const canSeckill = computed(() => {
  return detail.stock > 0 && (!detail.seckillEndTime || detail.seckillEndTime > Date.now())
})

async function loadDetail() {
  loading.value = true
  try {
    // TODO: 调用 API 获取详情
    Object.assign(detail, {
      id: route.params.id,
      name: '秒杀商品详情',
      seckillPrice: '99.00',
      originalPrice: '199.00',
      stock: 100,
      seckillEndTime: Date.now() + 3600000
    })
  } finally {
    loading.value = false
  }
}

async function handleSeckill() {
  if (!canSeckill.value) return
  orderLoading.value = true
  try {
    // TODO: 调用秒杀 API
    console.log('秒杀', detail.id)
  } finally {
    orderLoading.value = false
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.seckill-detail-page {
  min-height: 100vh;
  background-color: #faf8f7;
  background-image: var(--bg-pattern-dots);
  background-size: 24px 24px;
}

.header {
  padding: 16px 24px;
  background: var(--white);
  box-shadow: var(--shadow-sm);
}

.header a {
  color: var(--seckill-red);
  text-decoration: none;
  font-weight: 500;
}

.main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px;
}

.product-image img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}
.product-image-placeholder {
  width: 100%;
  min-height: 200px;
  max-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
  font-size: 14px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.product-detail h1 {
  font-size: 26px;
  margin-bottom: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.seckill-price {
  color: var(--seckill-red);
  font-size: 36px;
  font-weight: 700;
}

.original-price {
  margin-left: 12px;
  color: var(--text-placeholder);
  text-decoration: line-through;
}

.countdown {
  margin: 24px 0;
}
</style>
