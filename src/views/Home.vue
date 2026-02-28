<template>
  <div class="admin-page">
    <header class="admin-header">
      <div class="header-left">
        <span class="logo">闪电秒杀</span>
        <span class="breadcrumb">{{ breadcrumbText }}</span>
      </div>
      <div class="header-right">
        <span class="user-info">{{ userStore.userInfo?.phone || '-' }}</span>
        <button class="btn-logout" @click="handleLogout">退出登录</button>
      </div>
    </header>

    <div class="admin-body">
      <aside class="admin-menu">
        <button
          v-for="item in menuList"
          :key="item.key"
          class="menu-item"
          :class="{ active: currentMenu === item.key }"
          @click="currentMenu = item.key"
        >
          {{ item.label }}
        </button>
      </aside>

      <main class="admin-content">
        <div class="content-card">
          <!-- 秒杀商品管理：京东/淘宝电商后台标准，横向筛选、标准化表格 -->
          <section v-show="currentMenu === 'product'" class="module product-module">
            <h3 class="module-title">秒杀商品管理</h3>
            <div class="module-body">
              <!-- 筛选区：专业级布局，标签+控件一一对应，等距对齐 -->
              <div class="product-filter-bar">
                <div class="product-filter-group">
                  <label class="product-filter-label">状态</label>
                  <select v-model="productSearch.status" class="product-filter-select">
                    <option value="全部">全部</option>
                    <option value="上架">上架</option>
                    <option value="下架">下架</option>
                  </select>
                </div>
                <div class="product-filter-group">
                  <label class="product-filter-label">商品ID</label>
                  <el-input v-model="productSearch.id" placeholder="请输入" class="product-filter-input" clearable autocomplete="off" />
                </div>
                <div class="product-filter-group">
                  <label class="product-filter-label">商品名称</label>
                  <el-input v-model="productSearch.name" placeholder="请输入" class="product-filter-input" clearable autocomplete="off" />
                </div>
                <button type="button" class="product-search-btn" @click="loadProducts">搜索</button>
              </div>
              <!-- 操作按钮区：主按钮红底、次按钮白底红边，高度32px，间距10px -->
              <div class="product-btn-row">
                <button class="product-btn-primary" @click="openProductForm()">新增</button>
                <button class="product-btn-secondary" @click="openProductForm(selectedProduct)" :disabled="!selectedProduct">修改</button>
                <button class="product-btn-secondary" @click="handleDeleteProduct" :disabled="!selectedProducts.length">删除</button>
                <button class="product-btn-secondary" @click="handleBatchStatus('up')" :disabled="!selectedProducts.length">批量上架</button>
                <button class="product-btn-secondary" @click="handleBatchStatus('down')" :disabled="!selectedProducts.length">批量下架</button>
                <button class="product-btn-primary" @click="handleExcelImport">Excel导入</button>
                <button class="product-btn-primary" @click="handleExcelExport">Excel导出</button>
                <button class="product-btn-primary" @click="openBatchSeckillPrice">秒杀价批量设置</button>
              </div>
              <!-- 数据表格：列宽/对齐/斑马纹/库存预警 -->
              <div class="table-wrap">
                <p v-if="productLoading" class="load-text">加载中...</p>
                <table v-else class="product-table">
                  <thead>
                    <tr>
                      <th class="product-col-chk"><input type="checkbox" v-model="productSelectAll" @change="toggleProductSelectAll" /></th>
                      <th class="product-col-id">商品ID</th>
                      <th class="product-col-name">商品名称</th>
                      <th class="product-col-cat">品类</th>
                      <th class="product-col-price">原价</th>
                      <th class="product-col-price">秒杀价</th>
                      <th class="product-col-stock">库存</th>
                      <th class="product-col-status">状态</th>
                      <th class="product-col-ops">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, idx) in displayProductList"
                      :key="row.id"
                      :class="{
                        selected: selectedProduct?.id === row.id,
                        'product-row-even': idx % 2 === 1,
                        'product-stock-warn': (row.stock || 0) <= PRODUCT_STOCK_WARN
                      }"
                      @click="selectedProduct = row"
                    >
                      <td class="product-col-chk"><input type="checkbox" v-model="row._selected" @click.stop /></td>
                      <td class="product-col-id">{{ row.id }}</td>
                      <td class="product-col-name" :title="row.name">
                        <span class="product-name-text">{{ row.name }}</span>
                      </td>
                      <td class="product-col-cat">{{ row.category || '-' }}</td>
                      <td class="product-col-price">¥{{ row.originalPrice }}</td>
                      <td class="product-col-price">{{ row.seckillPrice != null ? `¥${row.seckillPrice}` : '-' }}</td>
                      <td class="product-col-stock" :class="{ 'product-stock-low': (row.stock || 0) <= PRODUCT_STOCK_WARN }">{{ row.stock }}</td>
                      <td class="product-col-status">
                        <span :class="(row.statusText || (row.status === 0 ? '下架' : '上架')) === '上架' ? 'status-on' : 'status-off'">{{ row.statusText || (row.status === 0 ? '下架' : '上架') }}</span>
                      </td>
                      <td class="product-col-ops">
                        <button class="product-op-link" @click.stop="openProductForm(row)">编辑</button>
                        <span class="product-op-gap" />
                        <button class="product-op-link" @click.stop="handleDeleteProductOne(row)">删除</button>
                        <span class="product-op-gap" />
                        <button class="product-op-link" @click.stop="openSeckillSetting(row)">详情</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- 秒杀活动配置：专业级表单，标签与控件对齐，功能完整 -->
          <section v-show="currentMenu === 'activity'" class="module activity-module">
            <h3 class="module-title">秒杀活动配置</h3>
            <div class="module-body">
              <div class="activity-form-card">
                <div class="activity-form-row">
                  <div class="activity-form-group">
                    <label class="activity-form-label">商品</label>
                    <el-select v-model="activityForm.productId" placeholder="请选择商品" class="activity-form-select">
                      <el-option :value="''" label="请选择商品" />
                      <el-option v-for="p in productOptions" :key="p.id" :value="p.id" :label="p.name" />
                    </el-select>
                  </div>
                  <div class="activity-form-group">
                    <label class="activity-form-label">秒杀价</label>
                    <div class="activity-form-field">
                      <el-input
                        v-model.number="activityForm.seckillPrice"
                        type="number"
                        placeholder="须低于原价"
                        class="activity-form-input"
                        :class="{ 'price-invalid': activityPriceInvalid }"
                      />
                      <span v-if="activityPriceInvalid" class="activity-form-error">秒杀价不能高于原价</span>
                    </div>
                  </div>
                  <div class="activity-form-group">
                    <label class="activity-form-label">秒杀库存</label>
                    <div class="activity-form-field">
                      <el-input
                        v-model.number="activityForm.seckillStock"
                        type="number"
                        placeholder="≤商品总库存"
                        class="activity-form-input"
                        :class="{ 'price-invalid': activityStockInvalid }"
                      />
                      <span v-if="activityStockInvalid" class="activity-form-error">不能超过商品总库存</span>
                    </div>
                  </div>
                </div>
                <div class="activity-form-row">
                  <div class="activity-form-group">
                    <label class="activity-form-label">开始时间</label>
                    <el-date-picker
                      v-model="activityForm.startTime"
                      type="datetime"
                      placeholder="选择开始时间"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      :disabled-date="disabledPastDate"
                      class="activity-form-date"
                    />
                  </div>
                  <div class="activity-form-group">
                    <label class="activity-form-label">结束时间</label>
                    <el-date-picker
                      v-model="activityForm.endTime"
                      type="datetime"
                      placeholder="选择结束时间"
                      format="YYYY-MM-DD HH:mm:ss"
                      value-format="YYYY-MM-DD HH:mm:ss"
                      :disabled-date="disabledPastDate"
                      class="activity-form-date"
                    />
                  </div>
                  <div class="activity-form-actions">
                    <button type="button" class="activity-btn-quick" @click="setQuickTime('today')">今日</button>
                    <button type="button" class="activity-btn-quick" @click="setQuickTime('tomorrow')">明日</button>
                    <button type="button" class="activity-btn-submit" :disabled="activitySubmitting" @click="submitActivity">
                      {{ activitySubmitting ? '提交中...' : (activityForm.id ? '更新' : '提交') }}
                    </button>
                    <button type="button" class="activity-btn-copy" :disabled="!activityForm.id" @click="copyActivity">活动复制</button>
                  </div>
                </div>
              </div>
              <div class="table-wrap">
                <p v-if="activityLoading" class="load-text">加载中...</p>
                <table v-else class="data-table activity-table">
                  <thead>
                    <tr>
                      <th class="col-id">活动ID</th>
                      <th class="col-name">商品名称</th>
                      <th class="col-price">秒杀价</th>
                      <th class="col-time">开始时间</th>
                      <th class="col-time">结束时间</th>
                      <th class="col-stock">库存</th>
                      <th class="col-status">状态</th>
                      <th class="col-ops">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in displayActivityList" :key="row.id" :class="{ 'row-even': idx % 2 === 1 }">
                      <td class="col-id">{{ row.id }}</td>
                      <td class="col-name">{{ productMap[row.productId] || row.productName }}</td>
                      <td class="col-price">¥{{ row.seckillPrice }}</td>
                      <td class="col-time">{{ formatTime(row.startTime) }}</td>
                      <td class="col-time">{{ formatTime(row.endTime) }}</td>
                      <td class="col-stock">{{ row.seckillStock }}</td>
                      <td class="col-status" :class="{ ended: getActivityStatus(row) === '已结束' }">{{ getActivityStatus(row) }}</td>
                      <td class="col-ops">
                        <span class="activity-op-wrap">
                          <button type="button" class="activity-op-link" @click="openActivityForm(row)">编辑</button>
                          <span class="activity-op-divider">|</span>
                          <button type="button" class="activity-op-link" @click="handleDeleteActivity(row)">删除</button>
                          <span class="activity-op-divider">|</span>
                          <button type="button" class="activity-op-link" @click="copyActivityFromRow(row)">活动复制</button>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- 订单管理：筛选区横向排列10px间距，表格标准化列宽 -->
          <section v-show="currentMenu === 'order'" class="module">
            <h3 class="module-title">订单管理</h3>
            <div class="module-body">
              <div class="toolbar">
                <div class="search-row order-search-row">
                  <el-input v-model="orderFilter.orderNo" placeholder="订单号" class="order-filter-input" clearable autocomplete="off" />
                  <el-input v-model="orderFilter.phone" placeholder="手机号" class="order-filter-input" clearable autocomplete="off" />
                  <el-input v-model="orderFilter.productName" placeholder="商品名称" class="order-filter-input" clearable autocomplete="off" />
                  <el-select v-model="orderFilter.status" placeholder="状态" class="order-filter-select" clearable>
                    <el-option label="全部状态" value="" />
                    <el-option label="待支付" value="0" />
                    <el-option label="已支付" value="1" />
                    <el-option label="已取消" value="2" />
                    <el-option label="异常" value="3" />
                  </el-select>
                  <el-date-picker v-model="orderFilter.startTime" type="date" placeholder="开始日期" value-format="YYYY-MM-DD" class="order-filter-date" />
                  <el-date-picker v-model="orderFilter.endTime" type="date" placeholder="结束日期" value-format="YYYY-MM-DD" class="order-filter-date" />
                  <el-button type="primary" @click="applyOrderFilter">筛选</el-button>
                </div>
                <div class="btn-row">
                  <button class="btn-secondary" @click="batchUpdateOrderStatus" :disabled="!selectedOrders.length">批量修改状态</button>
                  <button class="btn-secondary" @click="exportOrders">导出订单</button>
                </div>
              </div>
              <div class="table-wrap">
                <p v-if="orderLoading" class="load-text">加载中...</p>
                <table v-else class="data-table order-table">
                  <thead>
                    <tr>
                      <th class="order-col-chk"><input type="checkbox" v-model="orderSelectAll" @change="toggleOrderSelectAll" /></th>
                      <th class="order-col-id">订单ID</th>
                      <th class="order-col-no">订单号</th>
                      <th class="order-col-name">商品名称</th>
                      <th class="order-col-price">金额</th>
                      <th class="order-col-time">下单时间</th>
                      <th class="order-col-time">支付时间</th>
                      <th class="order-col-status">状态</th>
                      <th class="order-col-phone">手机号</th>
                      <th class="order-col-ops">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in displayOrderList" :key="row.id" :class="{ 'order-risk': row.riskFlag }">
                      <td class="order-col-chk"><input type="checkbox" v-model="row._selected" /></td>
                      <td class="order-col-id">{{ row.id }}</td>
                      <td class="order-col-no">{{ row.orderNo }}</td>
                      <td class="order-col-name">{{ row.productName }}</td>
                      <td class="order-col-price">¥{{ row.amount }}</td>
                      <td class="order-col-time">{{ formatTime(row.createTime) }}</td>
                      <td class="order-col-time">{{ row.payTime ? formatTime(row.payTime) : '-' }}</td>
                      <td class="order-col-status" :class="{ 'status-cancelled': row.status === 2, 'status-ended': row.status === 3 }">
                        <span>{{ orderStatusMap[row.status] ?? '未知' }}</span>
                        <span v-if="row.riskFlag" class="risk-tag">风控拦截</span>
                      </td>
                      <td class="order-col-phone">{{ row.phone || row.userId }}</td>
                      <td class="order-col-ops">
                        <button class="btn-link" @click="openOrderDetail(row)">详情</button>
                        <el-select v-model="row._editStatus" size="small" class="order-status-select" @change="updateOrderStatus(row)">
                          <el-option :value="0" label="待支付" />
                          <el-option :value="1" label="已支付" />
                          <el-option :value="2" label="已取消" />
                          <el-option :value="3" label="异常" />
                        </el-select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="chart-block">
                <div class="chart-title">近7日支付率趋势</div>
                <canvas ref="payRateCanvas" class="chart-canvas"></canvas>
              </div>
            </div>
          </section>

          <!-- 库存预警 -->
          <section v-show="currentMenu === 'stockWarn'" class="module">
            <h3 class="module-title">库存预警管理</h3>
            <div class="module-body">
              <div class="toolbar">
                <span class="inline-label">阈值</span>
                <input v-model.number="stockWarnThreshold" type="number" class="input input-narrow" />
                <button class="btn-primary" @click="handleOneClickRestock">一键补货</button>
              </div>
              <div class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>商品ID</th>
                      <th>商品名称</th>
                      <th>当前库存</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in stockWarnList" :key="row.id">
                      <td>{{ row.id }}</td>
                      <td>{{ row.name }}</td>
                      <td class="warn-num">{{ row.stock }}</td>
                      <td><button class="btn-link" @click="restockOne(row)">补货</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- 统计分析：4大核心图表 -->
          <section v-show="currentMenu === 'stats'" class="module">
            <h3 class="module-title">秒杀统计分析</h3>
            <div class="module-body stats-body">
              <div class="stats-toolbar">
                <el-radio-group v-model="statsGmvRange" size="small" @change="redrawStatsCharts">
                  <el-radio-button label="day">按日</el-radio-button>
                  <el-radio-button label="week">按周</el-radio-button>
                  <el-radio-button label="month">按月</el-radio-button>
                </el-radio-group>
                <el-button type="primary" size="small" @click="exportStatsReport">导出统计报表</el-button>
              </div>
              <el-row :gutter="16" class="stats-charts">
                <el-col :span="12">
                  <div class="chart-block">
                    <div class="chart-title">秒杀GMV趋势图</div>
                    <div ref="gmvChartRef" class="chart-canvas"></div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="chart-block">
                    <div class="chart-title">商品销量排行TOP10</div>
                    <div ref="salesRankChartRef" class="chart-canvas"></div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="chart-block">
                    <div class="chart-title">订单状态分布</div>
                    <div ref="orderPieChartRef" class="chart-canvas"></div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="chart-block">
                    <div class="chart-title">活跃用户数折线图</div>
                    <div ref="activeUserChartRef" class="chart-canvas"></div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </section>

          <!-- 用户管理 -->
          <section v-show="currentMenu === 'user'" class="module">
            <h3 class="module-title">用户管理</h3>
            <div class="module-body">
              <div class="toolbar">
                <el-input v-model="userSearch.phone" placeholder="手机号" style="width:140px" clearable />
                <el-input v-model="userSearch.nickname" placeholder="用户名" style="width:140px" clearable />
                <el-button type="primary" @click="searchUsers">搜索</el-button>
                <el-button @click="handleBatchResetPwd">批量重置密码</el-button>
                <el-button @click="handleBlacklist">黑白名单</el-button>
              </div>
              <div class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>用户ID</th>
                      <th>手机号</th>
                      <th>用户名</th>
                      <th>秒杀次数</th>
                      <th>成功次数</th>
                      <th>下单金额</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in displayUserList" :key="row.id">
                      <td>{{ row.id }}</td>
                      <td>{{ row.phone }}</td>
                      <td>{{ row.nickname }}</td>
                      <td>{{ row.seckillCount ?? 0 }}</td>
                      <td>{{ row.successCount ?? 0 }}</td>
                      <td>{{ row.totalAmount ?? 0 }}</td>
                      <td>{{ row.permission }}</td>
                      <td>
                        <button class="btn-link" @click="editUser(row)">编辑</button>
                        <button class="btn-link" @click="setPermission(row)">详情</button>
                        <button class="btn-link" @click="toggleUserStatus(row)">{{ row.permission === '黑名单' ? '启用' : '禁用' }}</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- 系统监控：Redis/MQ/接口，超阈值告警 -->
          <section v-show="currentMenu === 'monitor'" class="module">
            <h3 class="module-title">系统监控</h3>
            <div class="module-body monitor-body">
              <div class="monitor-cards">
                <div class="monitor-card" :class="{ 'monitor-alert': monitorRedisUsage > 80 }">
                  <div class="monitor-label">Redis 内存使用率</div>
                  <div class="monitor-value" :class="monitorRedisUsage > 80 ? 'monitor-alert-text' : 'success'">{{ monitorRedisUsage }}%</div>
                  <div class="monitor-desc">连接数: 12 / 内存: 2.3MB</div>
                  <span v-if="monitorRedisUsage > 80" class="alert-tag">告警</span>
                </div>
                <div class="monitor-card" :class="{ 'monitor-alert': monitorMqBacklog > 1000 }">
                  <div class="monitor-label">MQ 消息堆积数</div>
                  <div class="monitor-value" :class="monitorMqBacklog > 1000 ? 'monitor-alert-text' : 'success'">{{ monitorMqBacklog }}</div>
                  <div class="monitor-desc">队列: 秒杀订单</div>
                  <span v-if="monitorMqBacklog > 1000" class="alert-tag">告警</span>
                </div>
                <div class="monitor-card">
                  <div class="monitor-label">接口响应时间</div>
                  <div class="monitor-value">P95: {{ monitorP95 }}ms / P99: {{ monitorP99 }}ms</div>
                  <div class="monitor-desc">平均 45ms / 超时率: 0%</div>
                </div>
              </div>
              <div class="monitor-table-wrap">
                <div class="chart-title">接口耗时监控（近10次）</div>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>接口</th>
                      <th>耗时(ms)</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(r, i) in monitorApiList" :key="i">
                      <td>{{ r.api }}</td>
                      <td>{{ r.time }}</td>
                      <td><span :class="r.status === 200 ? 'status-ok' : 'status-err'">{{ r.status }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- 系统日志：操作日志 + 异常日志 -->
          <section v-show="currentMenu === 'log'" class="module">
            <h3 class="module-title">系统日志</h3>
            <div class="module-body">
              <div class="toolbar">
                <el-radio-group v-model="logTab" size="small">
                  <el-radio-button label="op">操作日志</el-radio-button>
                  <el-radio-button label="err">异常日志</el-radio-button>
                </el-radio-group>
                <el-input v-model="logFilter.ip" placeholder="IP筛选" style="width:140px" clearable />
                <el-button type="primary" @click="searchLogs">筛选</el-button>
                <el-button @click="handleLogClean">日志清理</el-button>
                <el-button @click="handleLogExport">导出备份</el-button>
              </div>
              <div class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>时间</th>
                      <th>{{ logTab === 'op' ? '操作' : '报错信息' }}</th>
                      <th>操作人/IP</th>
                      <th>结果</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in (logTab === 'op' ? displayLogList : displayErrLogList)" :key="row.id" :class="{ 'log-err-row': logTab === 'err' }">
                      <td>{{ row.time }}</td>
                      <td>{{ row.action || row.message }}</td>
                      <td>{{ row.ip || row.operator }}</td>
                      <td>{{ row.result }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>

    <footer class="admin-footer">© 2025 闪电秒杀系统 后台管理端</footer>

    <div v-if="productFormVisible" class="modal-mask" @click.self="productFormVisible = false">
      <div class="modal-box">
        <h3 class="modal-title">商品{{ productForm.id ? '修改' : '新增' }}</h3>
        <div class="form-block">
          <div class="form-row">
            <label class="label">商品名称</label>
            <el-input v-model="productForm.name" placeholder="请输入商品名称" style="width:100%" />
          </div>
          <div class="form-row">
            <label class="label">品类</label>
            <el-select v-model="productForm.category" placeholder="品类" style="width:100%">
              <el-option v-for="c in CATEGORY_OPTIONS.filter(x=>x!=='全部')" :key="c" :value="c" :label="c" />
            </el-select>
          </div>
          <div class="form-row">
            <label class="label">原价</label>
            <el-input-number v-model="productForm.originalPrice" :min="0" :precision="2" style="width:100%" />
          </div>
          <div class="form-row">
            <label class="label">库存</label>
            <el-input-number v-model="productForm.stock" :min="0" :precision="0" style="width:100%" />
          </div>
          <div class="form-row form-actions">
            <label class="label"></label>
            <div class="btn-group">
            <button class="btn-primary" @click="submitProduct">保存</button>
            <button class="btn-secondary" @click="productFormVisible = false">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="batchStockVisible" class="modal-mask" @click.self="batchStockVisible = false">
      <div class="modal-box">
        <h3 class="modal-title">库存批量修改</h3>
        <div class="form-block">
          <div class="form-row">
            <label class="label">增加数量</label>
            <input v-model.number="batchStockDelta" type="number" class="input input-w" />
          </div>
          <div class="form-row form-actions">
            <label class="label"></label>
            <div class="btn-group">
            <button class="btn-primary" @click="confirmBatchStock">确认</button>
            <button class="btn-secondary" @click="batchStockVisible = false">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="batchSeckillVisible" class="modal-mask" @click.self="batchSeckillVisible = false">
      <div class="modal-box">
        <h3 class="modal-title">秒杀价批量设置</h3>
        <div class="form-block">
          <div class="form-row">
            <label class="label">秒杀价</label>
            <input v-model.number="batchSeckillPrice" type="number" step="0.01" class="input input-w" />
          </div>
          <div class="form-row form-actions">
            <label class="label"></label>
            <div class="btn-group">
            <button class="btn-primary" @click="confirmBatchSeckillPrice">确认</button>
            <button class="btn-secondary" @click="batchSeckillVisible = false">取消</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { getProductList, createProduct, updateProduct, deleteProduct } from '@/api/modules/product'
import { exportToCSV } from '@/utils/export'
import { getActivityList, createActivity, updateActivity, deleteActivity } from '@/api/modules/seckill'
import { getOrderList, updateOrderStatus as apiUpdateOrderStatus } from '@/api/modules/order'

const router = useRouter()
const userStore = useUserStore()

// 品类选项（商品筛选用）
const CATEGORY_OPTIONS = ['全部', '数码', '家电', '日用', '食品', '其他']
// 商品库存预警阈值（≤30 标红）
const PRODUCT_STOCK_WARN = 30

// 京东同款真实秒杀数据（含品类）
const JD_PRODUCTS = [
  { id: 1001, name: 'iPhone 16 128GB', category: '数码', originalPrice: 5999, stock: 120, status: 1, statusText: '上架', isSeckill: true, seckillPrice: 5299 },
  { id: 1002, name: '小米14 Ultra 16GB', category: '数码', originalPrice: 4999, stock: 80, status: 1, statusText: '上架', isSeckill: true, seckillPrice: 4499 },
  { id: 1003, name: '海尔冰箱BCD-468', category: '家电', originalPrice: 3299, stock: 45, status: 1, statusText: '上架', isSeckill: true, seckillPrice: 2799 },
  { id: 1004, name: '戴森V15吸尘器', category: '家电', originalPrice: 4990, stock: 30, status: 1, statusText: '上架', isSeckill: false, seckillPrice: null },
  { id: 1005, name: '维达抽纸24包', category: '日用', originalPrice: 59.9, stock: 800, status: 1, statusText: '上架', isSeckill: true, seckillPrice: 39.9 },
  { id: 1006, name: '茅台飞天53度', category: '食品', originalPrice: 2999, stock: 20, status: 0, statusText: '下架', isSeckill: false, seckillPrice: null },
  { id: 1007, name: 'AirPods Pro 2', category: '数码', originalPrice: 1899, stock: 200, status: 1, statusText: '上架', isSeckill: true, seckillPrice: 1599 },
  { id: 1008, name: '美的电饭煲4L', category: '家电', originalPrice: 399, stock: 350, status: 1, statusText: '上架', isSeckill: true, seckillPrice: 299 }
]

const JD_ACTIVITIES = [
  { id: 1, productId: 1001, productName: 'iPhone 16 128GB', seckillPrice: 5299, seckillStock: 20, startTime: '2025-03-01T10:00:00', endTime: '2025-03-01T12:00:00' },
  { id: 2, productId: 1003, productName: '海尔冰箱BCD-468', seckillPrice: 2799, seckillStock: 10, startTime: '2025-02-28T08:00:00', endTime: '2025-02-28T10:00:00' },
  { id: 3, productId: 1005, productName: '维达抽纸24包', seckillPrice: 39.9, seckillStock: 500, startTime: '2025-02-28T00:00:00', endTime: '2025-02-28T23:59:59' },
  { id: 4, productId: 1007, productName: 'AirPods Pro 2', seckillPrice: 1599, seckillStock: 50, startTime: '2025-03-02T14:00:00', endTime: '2025-03-02T16:00:00' },
  { id: 5, productId: 1008, productName: '美的电饭煲4L', seckillPrice: 299, seckillStock: 100, startTime: '2025-02-27T10:00:00', endTime: '2025-02-27T12:00:00' }
]

const JD_ORDERS = [
  { id: 1, orderNo: 'JD202502280001', userId: 1001, phone: '13800138000', productName: 'iPhone 16 128GB', amount: 5299, status: 1, createTime: '2025-02-28T10:05:00', payTime: '2025-02-28T10:06:00', riskFlag: false, _editStatus: 1, _selected: false },
  { id: 2, orderNo: 'JD202502280002', userId: 1002, phone: '13900139000', productName: '海尔冰箱BCD-468', amount: 2799, status: 0, createTime: '2025-02-28T09:30:00', payTime: null, riskFlag: false, _editStatus: 0, _selected: false },
  { id: 3, orderNo: 'JD202502280003', userId: 1003, phone: '13700137000', productName: '维达抽纸24包', amount: 39.9, status: 1, createTime: '2025-02-28T08:15:00', payTime: '2025-02-28T08:16:00', riskFlag: false, _editStatus: 1, _selected: false },
  { id: 4, orderNo: 'JD202502270001', userId: 1001, phone: '13800138000', productName: 'iPhone 16 128GB', amount: 5299, status: 2, createTime: '2025-02-27T11:00:00', payTime: null, riskFlag: false, _editStatus: 2, _selected: false },
  { id: 5, orderNo: 'JD202502280004', userId: 1004, phone: '13600136000', productName: 'AirPods Pro 2', amount: 1599, status: 0, createTime: '2025-02-28T12:00:00', payTime: null, riskFlag: true, _editStatus: 0, _selected: false },
  { id: 6, orderNo: 'JD202502280005', userId: 1005, phone: '13500135000', productName: '美的电饭煲4L', amount: 299, status: 1, createTime: '2025-02-28T10:30:00', payTime: '2025-02-28T10:31:00', riskFlag: false, _editStatus: 1, _selected: false },
  { id: 7, orderNo: 'JD202502260001', userId: 1002, phone: '13900139000', productName: '小米14 Ultra', amount: 4499, status: 1, createTime: '2025-02-26T14:00:00', payTime: '2025-02-26T14:01:00', riskFlag: true, _editStatus: 1, _selected: false },
  { id: 8, orderNo: 'JD202502280006', userId: 1006, phone: '13400134000', productName: '维达抽纸24包', amount: 39.9, status: 3, createTime: '2025-02-28T09:00:00', payTime: null, riskFlag: false, _editStatus: 3, _selected: false },
  { id: 9, orderNo: 'JD202502270002', userId: 1003, phone: '13700137000', productName: '海尔冰箱BCD-468', amount: 2799, status: 1, createTime: '2025-02-27T15:00:00', payTime: '2025-02-27T15:02:00', riskFlag: false, _editStatus: 1, _selected: false },
  { id: 10, orderNo: 'JD202502280007', userId: 1001, phone: '13800138000', productName: '美的电饭煲4L', amount: 299, status: 2, createTime: '2025-02-28T11:20:00', payTime: null, riskFlag: false, _editStatus: 2, _selected: false }
]

const JD_USERS = [
  { id: 1, phone: '13800138000', nickname: '京东用户001', seckillCount: 12, successCount: 10, totalAmount: 52890, permission: '正常', createTime: '2025-01-15 10:00' },
  { id: 2, phone: '13900139000', nickname: '秒杀达人', seckillCount: 28, successCount: 25, totalAmount: 125600, permission: '正常', createTime: '2025-02-01 14:30' },
  { id: 3, phone: '13700137000', nickname: '新用户003', seckillCount: 3, successCount: 2, totalAmount: 2838, permission: '限购', createTime: '2025-02-15 09:00' },
  { id: 4, phone: '13600136000', nickname: 'VIP用户', seckillCount: 56, successCount: 52, totalAmount: 198000, permission: '白名单', createTime: '2024-12-01 16:20' },
  { id: 5, phone: '13500135000', nickname: '普通用户', seckillCount: 0, successCount: 0, totalAmount: 0, permission: '黑名单', createTime: '2025-02-20 11:00' }
]

const JD_LOGS = [
  { id: 1, time: '2025-02-28 10:30:00', action: '管理员登录', ip: '192.168.1.100', result: '成功' },
  { id: 2, time: '2025-02-28 10:25:00', action: '新增秒杀活动', ip: '192.168.1.100', result: '成功' },
  { id: 3, time: '2025-02-28 10:20:00', action: '商品上下架', ip: '192.168.1.101', result: '成功' },
  { id: 4, time: '2025-02-28 10:15:00', action: '订单状态更新', ip: '192.168.1.100', result: '成功' },
  { id: 5, time: '2025-02-28 10:10:00', action: '用户权限修改', ip: '192.168.1.102', result: '成功' },
  { id: 6, time: '2025-02-28 10:05:00', action: '秒杀开始', ip: '192.168.1.100', result: '成功' }
]
const JD_ERR_LOGS = [
  { id: 101, time: '2025-02-28 10:28:00', message: 'Redis连接超时: Connection refused', ip: '192.168.1.100', result: '失败' },
  { id: 102, time: '2025-02-28 10:12:00', message: '库存扣减失败: 库存不足', ip: '192.168.1.101', result: '失败' },
  { id: 103, time: '2025-02-28 09:55:00', message: '订单创建异常: 重复下单', ip: '192.168.1.102', result: '失败' }
]

const menuList = [
  { key: 'product', label: '秒杀商品管理' },
  { key: 'activity', label: '秒杀活动配置' },
  { key: 'order', label: '订单管理' },
  { key: 'stockWarn', label: '库存预警管理' },
  { key: 'stats', label: '秒杀统计分析' },
  { key: 'user', label: '用户管理' },
  { key: 'monitor', label: '系统监控' },
  { key: 'log', label: '系统日志' }
]

const breadcrumbMap = {
  product: '首页 / 秒杀商品管理',
  activity: '首页 / 秒杀活动配置',
  order: '首页 / 订单管理',
  stockWarn: '首页 / 库存预警管理',
  stats: '首页 / 秒杀统计分析',
  user: '首页 / 用户管理',
  monitor: '首页 / 系统监控',
  log: '首页 / 系统日志'
}

const breadcrumbText = computed(() => breadcrumbMap[currentMenu.value] || '首页')

const currentMenu = ref('product')
const productList = ref([])
const productLoading = ref(false)
const productSearch = reactive({ id: '', name: '', status: '全部' })
const selectedProduct = ref(null)
const productFormVisible = ref(false)
const productForm = reactive({ id: null, name: '', category: '数码', originalPrice: null, stock: null })
const productOptions = ref([])
const productMap = ref({})
const productSelectAll = ref(false)
const batchStockVisible = ref(false)
const batchStockDelta = ref(0)
const batchSeckillVisible = ref(false)
const batchSeckillPrice = ref(null)
const stockWarnThreshold = ref(50)

const activityList = ref([])
const activityLoading = ref(false)
const activitySubmitting = ref(false)
const activityForm = reactive({
  id: null, productId: '', seckillPrice: null, seckillStock: null, startTime: '', endTime: ''
})

const orderList = ref([])
const orderLoading = ref(false)
const orderFilter = reactive({ status: '', orderNo: '', phone: '', productName: '', startTime: '', endTime: '' })
const orderSelectAll = ref(false)
const chartCanvas = ref(null)
const payRateCanvas = ref(null)
const gmvChartRef = ref(null)
const salesRankChartRef = ref(null)
const orderPieChartRef = ref(null)
const activeUserChartRef = ref(null)
const statsGmvRange = ref('day')

const userList = ref([])
const userSearch = reactive({ phone: '', nickname: '' })

const logList = ref([])
const errLogList = ref([])
const logTab = ref('op')
const logFilter = reactive({ ip: '' })

const monitorRedisUsage = ref(72)
const monitorMqBacklog = ref(85)
const monitorP95 = ref(95)
const monitorP99 = ref(156)
const monitorApiList = ref([
  { api: 'POST /api/seckill/order', time: 38, status: 200 },
  { api: 'GET /api/products', time: 52, status: 200 },
  { api: 'GET /api/orders', time: 41, status: 200 },
  { api: 'POST /api/seckill/order', time: 45, status: 200 },
  { api: 'GET /api/seckill/activity', time: 35, status: 200 },
  { api: 'PUT /api/orders/3/status', time: 28, status: 200 },
  { api: 'GET /api/products/seckill-list', time: 48, status: 200 },
  { api: 'POST /api/seckill/order', time: 120, status: 200 },
  { api: 'GET /api/user/info', time: 22, status: 200 },
  { api: 'POST /api/user/login', time: 156, status: 200 }
])

const orderStatusMap = { 0: '待支付', 1: '已支付', 2: '已取消', 3: '异常' }
const orderTrendData = [12, 28, 35, 42, 38, 55, 48]
const payRateData = [65, 72, 78, 85, 82, 88, 90]
const successRateRank = [
  { name: 'iPhone 16 128GB', rate: 95 },
  { name: '维达抽纸24包', rate: 92 },
  { name: '美的电饭煲4L', rate: 88 },
  { name: '海尔冰箱BCD-468', rate: 85 },
  { name: 'AirPods Pro 2', rate: 80 }
]
// 统计分析数据
const statsGmvData = { day: { x: ['2/22', '2/23', '2/24', '2/25', '2/26', '2/27', '2/28'], y: [12500, 18900, 22300, 15600, 28100, 31200, 26800] }, week: { x: ['第1周', '第2周', '第3周', '第4周'], y: [65800, 89200, 112300, 101700] }, month: { x: ['1月', '2月'], y: [285000, 368700] } }
const statsSalesRank = [{ name: '维达抽纸24包', value: 1250 }, { name: '美的电饭煲4L', value: 680 }, { name: 'iPhone 16 128GB', value: 320 }, { name: 'AirPods Pro 2', value: 280 }, { name: '海尔冰箱BCD-468', value: 195 }, { name: '小米14 Ultra', value: 120 }, { name: '戴森V15吸尘器', value: 85 }, { name: '茅台飞天53度', value: 45 }, { name: '其他', value: 180 }]
const statsOrderStatus = [{ name: '已支付', value: 65 }, { name: '待支付', value: 15 }, { name: '已取消', value: 12 }, { name: '异常', value: 8 }]
const statsActiveUser = [120, 185, 220, 198, 256, 312, 285]

const displayProductList = computed(() => {
  let list = productList.value
  if (productSearch.id) list = list.filter(r => String(r.id).includes(productSearch.id))
  if (productSearch.name) list = list.filter(r => (r.name || '').includes(productSearch.name))
  if (productSearch.status && productSearch.status !== '全部') {
    list = list.filter(r => (r.statusText || (r.status === 0 ? '下架' : '上架')) === productSearch.status)
  }
  return list
})

const selectedProducts = computed(() => displayProductList.value.filter(p => p._selected))

function toggleProductSelectAll() {
  const all = productSelectAll.value
  const ids = new Set(displayProductList.value.map(p => p.id))
  productList.value.forEach(p => {
    if (ids.has(p.id)) p._selected = all
  })
}

const displayActivityList = computed(() => activityList.value)

// 活动表单校验：秒杀价须低于原价
const activityPriceInvalid = computed(() => {
  if (activityForm.seckillPrice == null || !activityForm.productId) return false
  const p = productOptions.value.find(x => x.id === activityForm.productId || x.id === Number(activityForm.productId))
  const orig = p?.originalPrice ?? 0
  return activityForm.seckillPrice >= orig
})
// 活动表单校验：秒杀库存须≤商品总库存
const activityStockInvalid = computed(() => {
  if (activityForm.seckillStock == null || !activityForm.productId) return false
  const p = productOptions.value.find(x => x.id === activityForm.productId || x.id === Number(activityForm.productId))
  const stock = p?.stock ?? 0
  return activityForm.seckillStock > stock
})

const displayOrderList = computed(() => {
  let list = orderList.value
  if (orderFilter.orderNo) list = list.filter(r => (r.orderNo || '').includes(orderFilter.orderNo))
  if (orderFilter.phone) list = list.filter(r => (r.phone || '').includes(orderFilter.phone))
  if (orderFilter.productName) list = list.filter(r => (r.productName || '').includes(orderFilter.productName))
  if (orderFilter.status !== '') list = list.filter(r => String(r.status) === orderFilter.status)
  if (orderFilter.startTime) list = list.filter(r => (r.createTime || '').slice(0, 10) >= orderFilter.startTime)
  if (orderFilter.endTime) list = list.filter(r => (r.createTime || '').slice(0, 10) <= orderFilter.endTime)
  return list
})

const stockWarnList = computed(() => productList.value.filter(p => (p.stock || 0) < stockWarnThreshold.value))

const displayUserList = computed(() => {
  let list = userList.value
  if (userSearch.phone) list = list.filter(u => (u.phone || '').includes(userSearch.phone))
  if (userSearch.nickname) list = list.filter(u => (u.nickname || '').includes(userSearch.nickname))
  return list
})

const displayLogList = computed(() => {
  let list = logList.value
  if (logFilter.ip) list = list.filter(l => (l.ip || '').includes(logFilter.ip))
  return list
})
const displayErrLogList = computed(() => {
  let list = errLogList.value
  if (logFilter.ip) list = list.filter(l => (l.ip || '').includes(logFilter.ip))
  return list
})

const selectedOrders = computed(() => displayOrderList.value.filter(o => o._selected))

function handleLogout() {
  userStore.logout()
  router.push('/login')
}

function formatTime(val) {
  if (!val) return '-'
  return String(val).replace('T', ' ').slice(0, 19)
}

function toLocalDatetime(val) {
  if (!val) return ''
  const s = String(val).replace('T', ' ').slice(0, 19)
  return s.length >= 16 ? s.slice(0, 16) : s
}

function getActivityStatus(row) {
  const now = new Date().toISOString()
  const start = String(row.startTime || '').slice(0, 19)
  const end = String(row.endTime || '').slice(0, 19)
  if (now < start) return '未开始'
  if (now > end) return '已结束'
  return '进行中'
}

// 禁止选择过去日期（活动时间校验）
function disabledPastDate(time) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return time.getTime() < today.getTime()
}

async function loadProducts() {
  productLoading.value = true
  try {
    const res = await getProductList({ page: 1, size: 100 })
    const data = res.data || res
    const records = data.records || []
    const list = records.length ? records.map(r => ({ ...r, _selected: false, statusText: r.status === 0 ? '下架' : '上架', seckillPrice: r.seckillPrice ?? null })) : JD_PRODUCTS.map(p => ({ ...p, _selected: false }))
    productList.value = list
    productOptions.value = list
    productMap.value = Object.fromEntries(list.map(p => [p.id, p.name]))
  } catch (e) {
    productList.value = JD_PRODUCTS.map(p => ({ ...p, _selected: false }))
    productOptions.value = productList.value
    productMap.value = Object.fromEntries(productList.value.map(p => [p.id, p.name]))
  } finally {
    productLoading.value = false
  }
}

function openProductForm(row) {
  if (row) {
    productForm.id = row.id
    productForm.name = row.name
    productForm.category = row.category || '数码'
    productForm.originalPrice = row.originalPrice
    productForm.stock = row.stock
  } else {
    productForm.id = null
    productForm.name = ''
    productForm.category = '数码'
    productForm.originalPrice = null
    productForm.stock = null
  }
  productFormVisible.value = true
}

function openSeckillSetting(row) {
  currentMenu.value = 'activity'
  activityForm.productId = row.id
  activityForm.seckillPrice = row.originalPrice ? row.originalPrice * 0.9 : ''
  activityForm.seckillStock = 50
  const now = new Date()
  activityForm.startTime = toDateTimeStr(now)
  activityForm.endTime = toDateTimeStr(new Date(now.getTime() + 2 * 60 * 60 * 1000))
}

async function submitProduct() {
  if (!productForm.name || productForm.originalPrice == null || productForm.stock == null) {
    ElMessage.warning('请填写完整')
    return
  }
  const payload = { name: productForm.name, category: productForm.category, image: '', originalPrice: productForm.originalPrice, stock: productForm.stock }
  try {
    if (productForm.id && productForm.id < 1000) {
      await updateProduct(productForm.id, payload)
    } else if (!productForm.id) {
      await createProduct(payload)
    } else {
      const found = productList.value.find(p => p.id === productForm.id)
      if (found) Object.assign(found, payload)
    }
    productFormVisible.value = false
    ElMessage.success('保存成功')
    loadProducts()
  } catch (e) {
    if (!productForm.id || productForm.id >= 1000) {
      if (productForm.id) {
        const found = productList.value.find(p => p.id === productForm.id)
        if (found) Object.assign(found, payload)
      } else {
        productList.value = [...productList.value, { id: Date.now(), ...payload, category: productForm.category, statusText: '上架', isSeckill: false, seckillPrice: null }]
      }
      productFormVisible.value = false
      productOptions.value = productList.value
      productMap.value = Object.fromEntries(productList.value.map(p => [p.id, p.name]))
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(e?.message || '操作失败')
    }
  }
}

async function handleDeleteProduct() {
  const list = [...selectedProducts.value]
  if (!list.length) return
  const ids = list.map(r => r.id)
  for (const id of ids) {
    try {
      if (id < 1000) await deleteProduct(id)
    } catch (_) {}
  }
  productList.value = productList.value.filter(p => !ids.includes(p.id))
  productOptions.value = productList.value
  productMap.value = Object.fromEntries(productList.value.map(p => [p.id, p.name]))
  selectedProduct.value = null
  ElMessage.success(`已删除 ${list.length} 件`)
}

async function handleDeleteProductOne(row) {
  try {
    if (row.id >= 1000) {
      productList.value = productList.value.filter(p => p.id !== row.id)
      productOptions.value = productList.value
      productMap.value = Object.fromEntries(productList.value.map(p => [p.id, p.name]))
      selectedProduct.value = null
      ElMessage.success('删除成功')
      return
    }
    await deleteProduct(row.id)
    selectedProduct.value = null
    ElMessage.success('删除成功')
    loadProducts()
  } catch (e) {
    productList.value = productList.value.filter(p => p.id !== row.id)
    productOptions.value = productList.value
    productMap.value = Object.fromEntries(productList.value.map(p => [p.id, p.name]))
    selectedProduct.value = null
    ElMessage.success('删除成功')
  }
}

function handleBatchStatus(type) {
  const list = selectedProducts.value
  if (!list.length) return
  list.forEach(p => {
    p.status = type === 'up' ? 1 : 0
    p.statusText = type === 'up' ? '上架' : '下架'
  })
  ElMessage.success(`已${type === 'up' ? '上架' : '下架'} ${list.length} 件`)
}

function handleExcelImport() {
  ElMessage.info('请上传 CSV 文件，列：name,originalPrice,stock')
}

function handleExcelExport() {
  const cols = [
    { key: 'id', label: '商品ID' },
    { key: 'name', label: '商品名称' },
    { key: 'category', label: '品类' },
    { key: 'originalPrice', label: '原价' },
    { key: 'seckillPrice', label: '秒杀价' },
    { key: 'stock', label: '库存' },
    { key: 'statusText', label: '状态' }
  ]
  exportToCSV(displayProductList.value, cols, `秒杀商品_${new Date().toISOString().slice(0, 10)}.csv`)
  ElMessage.success('导出成功')
}

function openBatchStock() {
  batchStockDelta.value = 0
  batchStockVisible.value = true
}

function confirmBatchStock() {
  const delta = batchStockDelta.value || 0
  if (delta <= 0) { ElMessage.warning('请输入正数'); return }
  productList.value.forEach(p => { p.stock = (p.stock || 0) + delta })
  batchStockVisible.value = false
  ElMessage.success('批量修改成功')
}

function openBatchSeckillPrice() {
  batchSeckillPrice.value = null
  batchSeckillVisible.value = true
}

function confirmBatchSeckillPrice() {
  const v = batchSeckillPrice.value
  if (v == null || v < 0) { ElMessage.warning('请输入有效秒杀价'); return }
  const list = selectedProducts.value.length ? selectedProducts.value : (selectedProduct.value ? [selectedProduct.value] : [])
  if (!list.length) { ElMessage.warning('请先选择商品'); return }
  list.forEach(p => { p.seckillPrice = v })
  ElMessage.success(`已设置 ${list.length} 件`)
  batchSeckillVisible.value = false
}

function toDateTimeStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${day} ${h}:${min}:${s}`
}

function setQuickTime(type) {
  const now = new Date()
  let start, end
  if (type === 'today') {
    start = new Date(now); start.setHours(10, 0, 0, 0)
    end = new Date(now); end.setHours(12, 0, 0, 0)
  } else {
    const t = new Date(now); t.setDate(t.getDate() + 1)
    start = new Date(t); start.setHours(10, 0, 0, 0)
    end = new Date(t); end.setHours(12, 0, 0, 0)
  }
  activityForm.startTime = toDateTimeStr(start)
  activityForm.endTime = toDateTimeStr(end)
}

function copyActivity() {
  if (!activityForm.id) return
  activityForm.id = null
  ElMessage.success('已复制，请修改后提交')
}

function copyActivityFromRow(row) {
  activityForm.productId = row.productId
  activityForm.seckillPrice = row.seckillPrice
  activityForm.seckillStock = row.seckillStock
  activityForm.startTime = formatTime(row.startTime) !== '-' ? formatTime(row.startTime) : ''
  activityForm.endTime = formatTime(row.endTime) !== '-' ? formatTime(row.endTime) : ''
  activityForm.id = null
  ElMessage.success('已复制活动')
}

async function loadActivities() {
  activityLoading.value = true
  try {
    const res = await getActivityList({ page: 1, size: 100 })
    const data = res.data || res
    activityList.value = data.records?.length ? data.records : JD_ACTIVITIES.map(a => ({ ...a }))
    if (!productOptions.value.length) {
      productOptions.value = productList.value.length ? productList.value : JD_PRODUCTS
      productMap.value = Object.fromEntries(productOptions.value.map(p => [p.id, p.name]))
    }
  } catch (e) {
    activityList.value = JD_ACTIVITIES.map(a => ({ ...a }))
  } finally {
    activityLoading.value = false
  }
}

function openActivityForm(row) {
  activityForm.id = row.id
  activityForm.productId = row.productId
  activityForm.seckillPrice = row.seckillPrice
  activityForm.seckillStock = row.seckillStock
  activityForm.startTime = formatTime(row.startTime) !== '-' ? formatTime(row.startTime) : ''
  activityForm.endTime = formatTime(row.endTime) !== '-' ? formatTime(row.endTime) : ''
}

function resetActivityForm() {
  activityForm.id = null
  activityForm.productId = ''
  activityForm.seckillPrice = null
  activityForm.seckillStock = null
  activityForm.startTime = ''
  activityForm.endTime = ''
}

async function submitActivity() {
  if (!activityForm.productId || activityForm.seckillPrice == null || activityForm.seckillStock == null || !activityForm.startTime || !activityForm.endTime) {
    ElMessage.warning('请填写完整')
    return
  }
  if (activityPriceInvalid.value) {
    ElMessage.warning('秒杀价不能高于原价')
    return
  }
  if (activityStockInvalid.value) {
    ElMessage.warning('秒杀库存不能超过商品总库存')
    return
  }
  let start = String(activityForm.startTime).trim()
  let end = String(activityForm.endTime).trim()
  if (start.length === 16) start += ':00'
  if (end.length === 16) end += ':00'
  if (start >= end) { ElMessage.warning('开始时间须早于结束时间'); return }
  const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ')
  if (start < nowStr) { ElMessage.warning('开始时间不能选择过去时间'); return }
  activitySubmitting.value = true
  try {
    const payload = {
      productId: Number(activityForm.productId),
      seckillPrice: activityForm.seckillPrice,
      seckillStock: activityForm.seckillStock,
      startTime: start,
      endTime: end
    }
    if (activityForm.id) {
      await updateActivity(activityForm.id, payload)
    } else {
      await createActivity(payload)
    }
    resetActivityForm()
    ElMessage.success('提交成功')
    loadActivities()
  } catch (e) {
    activityList.value = [...activityList.value, {
      id: Date.now(),
      productId: Number(activityForm.productId),
      productName: productMap.value[activityForm.productId],
      ...payload
    }]
    resetActivityForm()
    ElMessage.success('提交成功')
  } finally {
    activitySubmitting.value = false
  }
}

async function handleDeleteActivity(row) {
  try {
    await deleteActivity(row.id)
    loadActivities()
    ElMessage.success('删除成功')
  } catch (e) {
    activityList.value = activityList.value.filter(a => a.id !== row.id)
    ElMessage.success('删除成功')
  }
}

async function loadOrders() {
  orderLoading.value = true
  try {
    const res = await getOrderList({ page: 1, size: 100 })
    const data = res.data || res
    const records = (data.records || []).map(r => ({
      ...r,
      phone: r.phone || r.userPhone || '-',
      payTime: r.payTime || null,
      riskFlag: r.riskFlag ?? false,
      _editStatus: r.status,
      _selected: false
    }))
    orderList.value = records.length ? records : JD_ORDERS.map(o => ({ ...o, _editStatus: o.status, _selected: false }))
  } catch (e) {
    orderList.value = JD_ORDERS.map(o => ({ ...o, _editStatus: o.status, _selected: false }))
  } finally {
    orderLoading.value = false
  }
}

function applyOrderFilter() {
  loadOrders()
}

function toggleOrderSelectAll() {
  const all = orderSelectAll.value
  displayOrderList.value.forEach(o => { o._selected = all })
}

function batchUpdateOrderStatus() {
  const list = selectedOrders.value
  if (!list.length) return
  list.forEach(o => { o.status = o._editStatus })
  ElMessage.success(`已更新${list.length}条`)
}

function exportOrders() {
  const cols = [
    { key: 'orderNo', label: '订单号' },
    { key: 'productName', label: '商品' },
    { key: 'amount', label: '金额' },
    { key: 'createTime', label: '下单时间' },
    { key: 'status', label: '状态' }
  ]
  const statusLabels = { 0: '待支付', 1: '已支付', 2: '已取消', 3: '异常' }
  const data = displayOrderList.value.map(o => ({
    ...o,
    status: statusLabels[o.status] ?? o.status
  }))
  exportToCSV(data, cols, `订单导出_${new Date().toISOString().slice(0, 10)}.csv`)
  ElMessage.success('导出成功')
}

function openOrderDetail(row) { ElMessage.info(`订单详情：${row.orderNo}`) }

async function updateOrderStatus(row) {
  const status = row._editStatus
  if (status === row.status) return
  try {
    await apiUpdateOrderStatus(row.id, status)
    row.status = status
  } catch (e) {
    row.status = status
  }
  ElMessage.success('更新成功')
}

function handleOneClickRestock() {
  const t = stockWarnThreshold.value
  stockWarnList.value.forEach(p => {
    const f = productList.value.find(x => x.id === p.id)
    if (f) f.stock = (f.stock || 0) + t
  })
  ElMessage.success('一键补货成功')
}

function restockOne(row) {
  const f = productList.value.find(p => p.id === row.id)
  if (f) f.stock = (f.stock || 0) + stockWarnThreshold.value
  ElMessage.success('补货成功')
}

function searchUsers() { userList.value = userList.value.length ? userList.value : JD_USERS }
function handleBatchResetPwd() { ElMessage.success('批量重置密码（模拟）') }
function handleBlacklist() { ElMessage.success('黑白名单管理：可添加黑名单（禁止参与秒杀）/白名单（不限购）') }
function editUser(row) { ElMessage.info(`编辑用户：${row.phone}`) }
function setPermission(row) { ElMessage.info(`权限：${row.permission}；秒杀${row.seckillCount}次，成功${row.successCount ?? 0}次，金额${row.totalAmount ?? 0}元`) }
function toggleUserStatus(row) {
  if (row.permission === '黑名单') { row.permission = '正常'; ElMessage.success('已启用') }
  else { row.permission = '黑名单'; ElMessage.success('已禁用') }
}

function searchLogs() { logList.value = logList.value.length ? logList.value : JD_LOGS }
function handleLogClean() { ElMessage.success('日志清理（模拟）') }
function handleLogExport() { ElMessage.success('导出备份成功') }

let chartInstance1 = null
let chartInstance2 = null
let gmvChartInstance = null
let salesRankChartInstance = null
let orderPieChartInstance = null
let activeUserChartInstance = null

function drawChart() {
  const el = chartCanvas.value
  if (!el) return
  if (chartInstance1) chartInstance1.dispose()
  chartInstance1 = echarts.init(el)
  chartInstance1.setOption({
    color: ['#E41D13'],
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'] },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eee' } } },
    series: [{ type: 'line', smooth: true, data: orderTrendData, areaStyle: { opacity: 0.2 } }]
  })
}

function drawPayRateChart() {
  const el = payRateCanvas.value
  if (!el) return
  if (chartInstance2) chartInstance2.dispose()
  chartInstance2 = echarts.init(el)
  chartInstance2.setOption({
    color: ['#E41D13'],
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'] },
    yAxis: { type: 'value', min: 60, max: 100, axisLabel: { formatter: '{value}%' }, splitLine: { lineStyle: { color: '#eee' } } },
    series: [{ type: 'line', smooth: true, data: payRateData }]
  })
}

function drawGmvChart() {
  const el = gmvChartRef.value
  if (!el) return
  if (gmvChartInstance) gmvChartInstance.dispose()
  gmvChartInstance = echarts.init(el)
  const d = statsGmvData[statsGmvRange.value] || statsGmvData.day
  gmvChartInstance.setOption({
    color: ['#E41D13'],
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: d.x },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}' }, splitLine: { lineStyle: { color: '#eee' } } },
    series: [{ type: 'line', smooth: true, data: d.y, areaStyle: { opacity: 0.2 }, name: 'GMV(元)' }]
  })
}

function drawSalesRankChart() {
  const el = salesRankChartRef.value
  if (!el) return
  if (salesRankChartInstance) salesRankChartInstance.dispose()
  salesRankChartInstance = echarts.init(el)
  const top10 = statsSalesRank.slice(0, 10)
  salesRankChartInstance.setOption({
    color: ['#E41D13'],
    grid: { left: 80, right: 40, top: 10, bottom: 30 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: top10.map(x => x.name).reverse(), axisLabel: { width: 80, overflow: 'truncate' } },
    series: [{ type: 'bar', data: top10.map(x => x.value).reverse(), barWidth: '60%' }]
  })
}

function drawOrderPieChart() {
  const el = orderPieChartRef.value
  if (!el) return
  if (orderPieChartInstance) orderPieChartInstance.dispose()
  orderPieChartInstance = echarts.init(el)
  orderPieChartInstance.setOption({
    color: ['#67C23A', '#E6A23C', '#909399', '#F56C6C'],
    series: [{ type: 'pie', radius: ['40%', '70%'], data: statsOrderStatus, label: { show: true, formatter: '{b}: {c}%' } }]
  })
}

function drawActiveUserChart() {
  const el = activeUserChartRef.value
  if (!el) return
  if (activeUserChartInstance) activeUserChartInstance.dispose()
  activeUserChartInstance = echarts.init(el)
  activeUserChartInstance.setOption({
    color: ['#E41D13'],
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: ['2/22', '2/23', '2/24', '2/25', '2/26', '2/27', '2/28'] },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#eee' } } },
    series: [{ type: 'line', smooth: true, data: statsActiveUser, areaStyle: { opacity: 0.2 }, name: '活跃用户' }]
  })
}

function redrawStatsCharts() {
  nextTick(() => {
    drawGmvChart()
    drawSalesRankChart()
    drawOrderPieChart()
    drawActiveUserChart()
  })
}

function exportStatsReport() {
  const rows = [
    ['秒杀统计报表', '', '', ''],
    ['导出时间', new Date().toLocaleString(), '', ''],
    ['GMV趋势(按日)', statsGmvData.day.x.join(','), statsGmvData.day.y.join(','), ''],
    ['商品销量TOP10', ...statsSalesRank.slice(0, 10).map(x => `${x.name}:${x.value}`)],
    ['订单状态', ...statsOrderStatus.map(x => `${x.name}:${x.value}%`)]
  ]
  const csv = rows.map(r => (Array.isArray(r) ? r : [r]).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `秒杀统计报表_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
  ElMessage.success('导出成功')
}

watch(currentMenu, (key) => {
  if (key === 'product') loadProducts()
  else if (key === 'activity') loadActivities()
  else if (key === 'order') { loadOrders(); nextTick(() => setTimeout(drawPayRateChart, 50)) }
  else if (key === 'user') { userList.value = [...JD_USERS] }
  else if (key === 'monitor') { }
  else if (key === 'log') { logList.value = [...JD_LOGS]; errLogList.value = [...JD_ERR_LOGS] }
  else if (key === 'stats') nextTick(() => setTimeout(redrawStatsCharts, 50))
})

onMounted(() => {
  loadProducts()
  userList.value = [...JD_USERS]
  logList.value = [...JD_LOGS]
  errLogList.value = [...JD_ERR_LOGS]
  setTimeout(() => {
    loadActivities()
    loadOrders()
  }, 200)
  nextTick(() => {
    if (chartCanvas.value) {
      const ob = new ResizeObserver(() => {
        drawChart()
        drawPayRateChart()
        chartInstance1?.resize()
        chartInstance2?.resize()
      })
      ob.observe(chartCanvas.value)
    }
    if (payRateCanvas.value) {
      const ob2 = new ResizeObserver(() => {
        chartInstance2?.resize()
      })
      ob2.observe(payRateCanvas.value)
    }
    if (gmvChartRef.value) {
      const ob3 = new ResizeObserver(() => {
        gmvChartInstance?.resize()
        salesRankChartInstance?.resize()
        orderPieChartInstance?.resize()
        activeUserChartInstance?.resize()
      })
      ob3.observe(gmvChartRef.value)
    }
  })
})
</script>

<style scoped>
/* 京东电商后台风格：主色#E41D13，背景#F5F5F5，字体微软雅黑，无背景图 */
.admin-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F5F5F5;
  background-image: none;
  color: #333333;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
}

.admin-header {
  flex-shrink: 0;
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #E6E6E6;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  color: #E41D13;
}

.breadcrumb {
  font-size: 14px;
  color: #666666;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info { font-size: 14px; color: #333; }

.btn-logout {
  padding: 6px 14px;
  background: #fff;
  border: 1px solid #E41D13;
  font-size: 14px;
  color: #E41D13;
  cursor: pointer;
  border-radius: 6px;
}

.btn-logout:hover { background: #fff5f5; }

.admin-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.admin-menu {
  flex-shrink: 0;
  width: 180px;
  background: #E41D13;
  padding: 10px 0;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  opacity: 0.9;
}

.menu-item:hover { opacity: 1; background: rgba(255,255,255,0.15); }
/* 选中项：白色左侧边框高亮 */
.menu-item.active { background: rgba(255,255,255,0.25); font-weight: 600; opacity: 1; border-left: 3px solid #fff; }

.admin-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background-color: #faf8f7;
  background-image: var(--bg-pattern-dots);
  background-size: 20px 20px;
}

/* 内容区：白色卡片化，圆角8px+轻微阴影，时尚电商后台标准 */
.content-card {
  background: linear-gradient(180deg, #fff 0%, #fffefd 100%);
  padding: 24px;
  min-height: 100%;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06), 0 0 0 1px rgba(228, 61, 19, 0.04);
}

.module-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 15px 0;
  padding: 0 0 12px 16px;
  border-left: 4px solid #E41D13;
  border-bottom: 1px solid rgba(228, 29, 19, 0.15);
  color: #333333;
  background: linear-gradient(90deg, rgba(228, 29, 19, 0.04) 0%, transparent 100%);
}

.module-body { min-height: 200px; }

.toolbar { margin-bottom: 16px; }
.search-row, .btn-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.inline-label { font-size: 14px; color: #666; margin-right: 8px; }

.input {
  padding: 8px 12px;
  height: 44px;
  border: 1px solid #E6E6E6;
  font-size: 14px;
  min-width: 120px;
  border-radius: 6px;
  box-sizing: border-box;
}
.input:focus {
  outline: none;
  border-color: #E41D13;
}

.input-w { width: 200px; }
.input-narrow { width: 60px; min-width: 60px; }
.input-tiny { width: 90px; padding: 4px 6px; font-size: 12px; }

.btn-primary {
  padding: 6px 14px;
  background: #E41D13;
  color: #fff;
  border: none;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
}

.btn-primary:hover:not(:disabled) { background: #c91810; }
.btn-primary:disabled { background: #ccc; cursor: not-allowed; }

.btn-secondary {
  padding: 6px 14px;
  background: #fff;
  color: #E41D13;
  border: 1px solid #E41D13;
  font-size: 14px;
  cursor: pointer;
  border-radius: 6px;
}

.btn-secondary:hover:not(:disabled) { background: #fff5f5; }
.btn-secondary:disabled { border-color: #ccc; color: #ccc; cursor: not-allowed; }

.btn-small {
  padding: 4px 10px;
  font-size: 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  cursor: pointer;
  border-radius: 6px;
}

.btn-group { display: flex; gap: 8px; align-items: center; }

.btn-link {
  background: none;
  border: none;
  color: #E41D13;
  font-size: 13px;
  cursor: pointer;
  padding: 0 4px;
}

.btn-link:hover { text-decoration: underline; }

.load-text {
  padding: 24px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.table-wrap { overflow: auto; }

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  border: 1px solid #E6E6E6;
}

.data-table th,
.data-table td {
  padding: 0 10px;
  height: 40px;
  text-align: center;
  border: 1px solid #E6E6E6;
  vertical-align: middle;
}

.data-table th {
  background: #F5F5F5;
  font-weight: 600;
  color: #333;
}

.data-table tbody tr:nth-child(even) { background: #FAFAFA; }
.data-table tbody tr:hover { background: #f5f5f5 !important; }

.form-tip { font-size: 12px; margin-left: 8px; }
.form-tip.error { color: #E41D13; }
.price-invalid :deep(.el-input__wrapper) { box-shadow: 0 0 0 1px #E41D13 inset !important; }
.stock-warn { background: #fff5f5 !important; }
.stock-warn-cell { color: #E41D13 !important; font-weight: 600; }

/* ========== 秒杀商品管理页：专业级电商后台标准 ========== */
/* 筛选区：标签+控件一一对应，等距对齐，视觉统一 */
.product-filter-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.product-filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.product-filter-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  width: 64px;
  text-align: right;
  margin: 0;
  line-height: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.product-filter-select {
  width: 100px;
  height: 36px;
  padding: 0 12px;
  font-size: 14px;
  color: #333;
  background: #fff;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  cursor: pointer;
  outline: none;
}
.product-filter-select:hover { border-color: #C0C4CC; }
.product-filter-select:focus { border-color: #E41D13; }
.product-filter-input { width: 160px !important; }
.product-filter-bar :deep(.el-input__suffix),
.product-filter-bar :deep(.el-input .el-input__suffix) {
  display: none !important;
}
.product-filter-bar :deep(.el-input__wrapper) {
  padding-right: 12px !important;
  height: 36px !important;
  min-height: 36px !important;
  border-radius: 4px;
  display: flex !important;
  align-items: center !important;
}
.product-filter-bar :deep(.el-input__inner) {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  line-height: 1.5;
}
.product-filter-bar :deep(.el-input__inner)::-ms-clear { display: none; }
.product-search-btn {
  height: 36px;
  padding: 0 28px;
  margin-left: 8px;
  background: #E41D13;
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}
.product-search-btn:hover { background: #c91810; }

.product-btn-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.product-btn-primary {
  height: 32px;
  padding: 0 16px;
  background: #E41D13;
  color: #fff;
  border: none;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
}
.product-btn-primary:hover:not(:disabled) { background: #c91810; }
.product-btn-primary:disabled { background: #ccc; color: #fff; cursor: not-allowed; }
.product-btn-secondary {
  height: 32px;
  padding: 0 16px;
  background: #fff;
  color: #E41D13;
  border: 1px solid #E41D13;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
}
.product-btn-secondary:hover:not(:disabled) { background: #fff5f5; }
.product-btn-secondary:disabled { border-color: #ccc; color: #ccc; cursor: not-allowed; }

.product-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  border: 1px solid #E6E6E6;
}
.product-table th,
.product-table td {
  padding: 0 12px;
  height: 42px;
  border: 1px solid #E6E6E6;
  vertical-align: middle;
}
.product-table th {
  background: #F5F5F5;
  font-weight: 600;
  color: #333;
  text-align: center;
}
.product-table .product-col-chk { width: 48px; text-align: center; }
.product-table .product-col-id { width: 80px; text-align: center; }
.product-table .product-col-name { min-width: 140px; text-align: left; max-width: 200px; }
.product-table .product-col-cat { width: 100px; text-align: center; }
.product-table .product-col-price { width: 100px; text-align: right; }
.product-table .product-col-stock { width: 80px; text-align: center; }
.product-table .product-col-status { width: 80px; text-align: center; }
.product-table .product-col-ops { width: 150px; text-align: center; }
.product-table tbody tr.product-row-even { background: #FAFAFA; }
.product-table tbody tr:hover { background: #F0F0F0 !important; }
.product-table tbody tr.selected { background: #fff5f5 !important; }
.product-table tbody tr.product-stock-warn { background: #fff5f5 !important; }
.product-table .product-name-text {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}
.product-table .product-stock-low { color: #E41D13; font-weight: 600; }
.product-table .status-on { color: #52c41a !important; }
.product-table .status-off { color: #909399 !important; }
.product-op-link {
  background: none;
  border: none;
  color: #E41D13;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
}
.product-op-link:hover { text-decoration: underline; }
.product-op-gap { display: inline-block; width: 10px; }
.order-risk { background: #fff5f5 !important; }
.risk-tag { margin-left: 6px; padding: 2px 6px; font-size: 11px; background: #E41D13; color: #fff; border-radius: 4px; }
.data-table tbody tr.selected { background: #fff5f5 !important; }
.warn-num { color: #E41D13; font-weight: 600; }

.form-block { margin-bottom: 20px; }
.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.form-row .label {
  width: 80px;
  text-align: right;
  margin-right: 12px;
  font-size: 14px;
  color: #333;
}

.form-actions .label { visibility: hidden; }

/* ========== 秒杀活动配置：专业级表单 ========== */
.activity-form-card {
  padding: 20px;
  margin-bottom: 20px;
  background: #fff;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.activity-form-row {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.activity-form-row:last-of-type { margin-bottom: 0; }
.activity-form-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.activity-form-field {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}
.activity-form-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
  width: 72px;
  text-align: right;
  margin: 0;
  line-height: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.activity-form-select { width: 200px !important; }
.activity-form-input { width: 160px !important; }
.activity-form-date { width: 220px !important; }
.activity-form-card :deep(.el-input__suffix),
.activity-form-card :deep(.el-select .el-input__suffix),
.activity-form-card :deep(.el-date-editor .el-input__suffix),
.activity-form-card :deep(.el-date-editor .el-input__prefix) { display: none !important; }
.activity-form-card :deep(.el-date-editor .el-input__wrapper) {
  background-image: none !important;
  padding-left: 12px !important;
}
.activity-form-card :deep(.el-input__wrapper),
.activity-form-card :deep(.el-select .el-input__wrapper),
.activity-form-card :deep(.el-select__wrapper),
.activity-form-card :deep(.el-date-editor .el-input__wrapper) {
  height: 36px !important;
  min-height: 36px !important;
  border-radius: 4px;
}
.activity-form-error {
  font-size: 12px;
  color: #E41D13;
  white-space: nowrap;
}
.activity-form-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.activity-btn-quick {
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
  color: #666;
  background: #fff;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  cursor: pointer;
}
.activity-btn-quick:hover { border-color: #E41D13; color: #E41D13; }
.activity-btn-submit {
  height: 36px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: #E41D13;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.activity-btn-submit:hover:not(:disabled) { background: #c91810; }
.activity-btn-submit:disabled { background: #ccc; cursor: not-allowed; }
.activity-btn-copy {
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
  color: #E41D13;
  background: #fff;
  border: 1px solid #E41D13;
  border-radius: 4px;
  cursor: pointer;
}
.activity-btn-copy:hover:not(:disabled) { background: #fff5f5; }
.activity-btn-copy:disabled { border-color: #ccc; color: #ccc; cursor: not-allowed; }

/* 活动表格：标准化列宽，操作列分隔清晰 */
.activity-table {
  border: 1px solid #E6E6E6;
  font-size: 13px;
}
.activity-table th,
.activity-table td {
  border: 1px solid #E6E6E6;
  padding: 0 10px;
  height: 40px;
  vertical-align: middle;
}
.activity-table th { text-align: center; }
.activity-table th {
  background: #F5F5F5;
  font-weight: 600;
  color: #333;
}
.activity-table .col-id { width: 80px; text-align: center; }
.activity-table .col-name { text-align: left; min-width: 120px; }
.activity-table .col-price { width: 100px; text-align: right; }
.activity-table .col-time { width: 180px; text-align: center; }
.activity-table .col-stock { width: 80px; text-align: center; }
.activity-table .col-status { width: 80px; text-align: center; }
.activity-table .col-ops { width: 220px; text-align: center; }
.activity-table tbody tr.row-even { background: #FAFAFA; }
.activity-table tbody tr:hover { background: #f5f5f5 !important; }
.activity-op-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.activity-op-link {
  background: none;
  border: none;
  color: #E41D13;
  font-size: 13px;
  cursor: pointer;
  padding: 0 2px;
}
.activity-op-link:hover { text-decoration: underline; }
.activity-op-divider {
  color: #DCDFE6;
  font-size: 12px;
  user-select: none;
}
.activity-table .col-num { text-align: right; }
.activity-table .col-status.ended { color: #E41D13; font-weight: 500; }
.activity-module .table-wrap { margin-top: 20px; }

.chart-block { margin-top: 24px; }
.chart-title { font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #333; }
.chart-canvas { width: 100%; height: 220px; display: block; min-height: 200px; }

.stats-body { padding: 0; }
.stats-toolbar { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.stats-charts { margin-top: 8px; }
.stats-charts .chart-block { margin-top: 12px; }
.rank-block { }
.rank-list { display: flex; flex-direction: column; gap: 6px; }
.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  font-size: 14px;
  background: #FAFAFA;
}

.rank-num {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E41D13;
  color: #fff;
  font-size: 12px;
}

.rank-name { flex: 1; }
.rank-rate { color: #E41D13; font-weight: 600; }

.admin-footer {
  flex-shrink: 0;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999999;
  background: #fff;
  border-top: 1px solid #E6E6E6;
}

.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: #fff;
  padding: 24px;
  min-width: 360px;
  border: 1px solid #e8e8e8;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #E41D13;
}

select.input { min-width: 140px; }

.monitor-body { }
.monitor-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.monitor-card {
  padding: 16px;
  background: #FAFAFA;
  border-radius: 6px;
  border: 1px solid #E6E6E6;
}
.monitor-label { font-size: 13px; color: #666; margin-bottom: 4px; }
.monitor-value { font-size: 18px; font-weight: 600; color: #333; }
.monitor-value.success { color: #52c41a; }
.monitor-desc { font-size: 12px; color: #999; margin-top: 4px; }
.monitor-card { position: relative; }
.monitor-alert { border-color: #E41D13 !important; background: #fff5f5 !important; }
.monitor-alert-text { color: #E41D13 !important; }
.alert-tag { position: absolute; top: 8px; right: 8px; padding: 2px 8px; font-size: 12px; background: #E41D13; color: #fff; border-radius: 4px; }
.log-err-row { background: #fff5f5 !important; }
.monitor-table-wrap { margin-top: 16px; }
.status-ok { color: #52c41a; }
.status-err { color: #E41D13; }

/* 订单管理：筛选区横向10px间距，隐藏箭头/图标乱码 */
/* 订单筛选区：横向布局，左对齐，统一间距 */
.order-search-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  flex-wrap: wrap;
}
.order-search-row :deep(.el-input__suffix),
.order-search-row :deep(.el-select .el-input__suffix),
.order-search-row :deep(.el-date-editor .el-input__suffix),
.order-search-row :deep(.el-date-editor .el-input__prefix) { display: none !important; }
.order-search-row :deep(.el-input__wrapper),
.order-search-row :deep(.el-date-editor .el-input__wrapper) {
  padding-right: 12px !important;
  padding-left: 12px !important;
  background-image: none !important;
}
.order-search-row .order-filter-input { width: 160px; min-width: 160px; }
.order-search-row .order-filter-select { width: 110px; min-width: 110px; }
.order-search-row .order-filter-date { width: 140px; min-width: 140px; }
.order-search-row :deep(.el-input__wrapper),
.order-search-row :deep(.el-date-editor) { height: 36px; min-height: 36px; }
.order-table .order-col-chk { width: 40px; text-align: center; }
.order-table .order-col-id { width: 80px; text-align: center; }
.order-table .order-col-no { width: 180px; text-align: left; }
.order-table .order-col-name { min-width: 120px; text-align: left; }
.order-table .order-col-price { width: 100px; text-align: right; }
.order-table .order-col-time { width: 180px; text-align: center; }
.order-table .order-col-status { width: 80px; text-align: center; }
.order-table .order-col-status.status-cancelled,
.order-table .order-col-status.status-ended { color: #E41D13; font-weight: 500; }
.order-table .order-col-phone { width: 120px; text-align: center; }
.order-table .order-col-ops { width: 100px; text-align: center; }
.order-status-select { width: 90px !important; }

@media (max-width: 900px) {
  .stats-body { }
  .monitor-cards { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .admin-body { flex-direction: column; }
  .admin-menu {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 8px;
  }
  .menu-item { flex: 1 1 auto; min-width: 100px; }
  .header-left { flex-wrap: wrap; }
  .search-row, .btn-row { flex-direction: column; }
  .input { min-width: 100%; }
}
</style>
