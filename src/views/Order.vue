<template>
  <div class="order-page">
    <header class="header">
      <h1>我的订单</h1>
      <router-link to="/">返回首页</router-link>
    </header>

    <main class="main">
      <el-table :data="orderList" stripe>
        <el-table-column prop="id" label="订单号" width="180" />
        <el-table-column prop="productName" label="商品名称" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="orderList.length === 0" description="暂无订单">
        <el-button type="primary" @click="$router.push('/products')">去秒杀</el-button>
      </el-empty>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const orderList = ref([])

function getStatusType(status) {
  const map = { paid: 'success', pending: 'warning', cancelled: 'info' }
  return map[status] || 'info'
}

onMounted(() => {
  // TODO: 调用 API 获取订单列表
  orderList.value = []
})
</script>

<style scoped>
.order-page {
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.amount {
  color: var(--seckill-red);
  font-weight: 700;
}
</style>
