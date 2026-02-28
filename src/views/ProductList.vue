<template>
  <div class="product-list-page">
    <header class="header">
      <h1>秒杀商品</h1>
      <router-link to="/">返回首页</router-link>
    </header>

    <main class="main">
      <el-row :gutter="20">
        <el-col
          v-for="item in productList"
          :key="item.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <el-card class="product-card" shadow="hover" @click="goDetail(item.id)">
            <img v-if="item.image" :src="item.image" class="product-img" alt="商品图" />
            <div v-else class="product-img-placeholder">暂无图片</div>
            <div class="product-info">
              <h3>{{ item.name || '秒杀商品' }}</h3>
              <div class="price-row">
                <span class="seckill-price">¥{{ item.seckillPrice || '0.00' }}</span>
                <span class="original-price">¥{{ item.originalPrice || '0.00' }}</span>
              </div>
              <Countdown :end-time="item.seckillEndTime || 0" />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 无数据时显示示例 -->
      <el-empty v-if="productList.length === 0" description="暂无秒杀商品">
        <el-button type="primary" @click="loadMockData">加载示例数据</el-button>
      </el-empty>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Countdown from '@/components/Countdown.vue'

const router = useRouter()
const productList = ref([])

function goDetail(id) {
  router.push(`/seckill/${id}`)
}

function loadMockData() {
  productList.value = [
    {
      id: 1,
      name: '示例秒杀商品 1',
      seckillPrice: '99.00',
      originalPrice: '199.00',
      seckillEndTime: Date.now() + 3600000
    },
    {
      id: 2,
      name: '示例秒杀商品 2',
      seckillPrice: '59.00',
      originalPrice: '129.00',
      seckillEndTime: Date.now() + 7200000
    }
  ]
}

onMounted(() => {
  loadMockData()
})
</script>

<style scoped>
.product-list-page {
  min-height: 100vh;
  background-color: #faf8f7;
  background-image: var(--bg-pattern-dots);
  background-size: 24px 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--white);
  box-shadow: var(--shadow-sm);
}

.header h1 {
  color: var(--seckill-red);
  font-weight: 700;
}

.header a {
  color: var(--seckill-red);
  font-weight: 500;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  position: relative;
}

.product-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 2px solid transparent;
}

.product-card:hover {
  transform: translateY(-6px);
  border-color: var(--gold);
  box-shadow: var(--shadow-gold);
}

.product-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  background: var(--bg-light);
}
.product-img-placeholder {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-light);
  color: #999;
  font-size: 13px;
}

.product-info {
  padding-top: 12px;
}

.product-info h3 {
  font-size: 16px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seckill-price {
  color: var(--seckill-red);
  font-size: 22px;
  font-weight: 700;
}

.original-price {
  margin-left: 8px;
  color: var(--text-placeholder);
  text-decoration: line-through;
}
</style>
