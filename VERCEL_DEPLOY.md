# 闪电秒杀前端 - Vercel 部署指南

## 一、前置准备

- 仓库已推送：https://github.com/syperstart/seckill-system
- 分支：`main`

---

## 二、Vercel 部署详细步骤

### 步骤 1：登录 Vercel

1. 打开浏览器访问 **https://vercel.com**
2. 点击右上角 **Log In**
3. 选择 **Continue with GitHub**，授权 Vercel 访问你的 GitHub 账号
4. 若首次使用，按提示完成账号创建

---

### 步骤 2：导入项目

1. 登录后进入 **Dashboard**
2. 点击 **Add New...** → **Project**
3. 在 **Import Git Repository** 页面：
   - 若未连接 GitHub，先点击 **Configure GitHub App** 授权仓库访问
   - 在列表中找到 **syperstart/seckill-system**，点击右侧 **Import**

---

### 步骤 3：配置构建设置

在 **Configure Project** 页面，确认或修改以下项：

| 配置项 | 推荐值 | 说明 |
|--------|--------|------|
| **Project Name** | `seckill-system` | 可自定义，将作为子域名 |
| **Framework Preset** | `Vite` | 自动识别，勿改 |
| **Root Directory** | 留空 | 仓库根目录即为 frontend |
| **Build Command** | `npm run build` | 默认即可 |
| **Output Directory** | `dist` | Vite 默认输出目录 |
| **Install Command** | `npm install` | 默认即可 |

---

### 步骤 4：添加环境变量

在 **Environment Variables** 区域：

1. 点击 **Key** 输入框，输入：`VITE_API_BASE_URL`
2. 点击 **Value** 输入框，根据情况填写：

| 情况 | 填写值 |
|------|--------|
| 后端已部署 | `https://你的后端域名/api`（如 `https://seckill-api.railway.app/api`） |
| 后端未部署 | 先填 `https://api.example.com/api`，上线后到项目设置中修改 |

3. 环境选择：勾选 **Production**、**Preview**、**Development**（三选一或全选均可，建议全选）
4. 点击 **Add** 添加

> **注意**：`VITE_` 开头的变量会在构建时注入前端，修改后需重新部署生效。

---

### 步骤 5：部署

1. 确认配置无误后，点击底部 **Deploy**
2. 等待构建完成（约 1–2 分钟）
3. 部署成功后，会显示 **Congratulations!** 和访问链接，如：`https://seckill-system-xxx.vercel.app`

---

## 三、部署后操作

### 查看部署状态

- 在项目 **Deployments** 页可查看每次部署记录
- 点击某次部署可查看构建日志

### 修改环境变量

1. 进入项目 → **Settings** → **Environment Variables**
2. 找到 `VITE_API_BASE_URL`，点击 **Edit**
3. 修改值后保存
4. 在 **Deployments** 页点击最新部署右侧 **⋯** → **Redeploy** 使新变量生效

### 自定义域名（可选）

1. 进入项目 → **Settings** → **Domains**
2. 添加你的域名，按提示配置 DNS

---

## 四、后端未部署时的使用方式

若后端尚未上线，前端仍可部署，但：

- 登录、注册、商品列表等接口会请求失败
- 可先完成前端部署，后续在 Vercel 中更新 `VITE_API_BASE_URL` 并 Redeploy

**后端部署建议**：Railway、Render、Fly.io 等平台均可部署 Spring Boot，部署后把 API 根地址填入 `VITE_API_BASE_URL`。

---

## 五、常见问题

| 问题 | 处理方式 |
|------|----------|
| 构建失败 | 查看 **Deployments** 中该次部署的 **Build Logs**，根据报错排查 |
| 页面 404 | 确认 `vercel.json` 中 `rewrites` 已配置，所有路由指向 `/index.html` |
| 接口请求失败 | 检查 `VITE_API_BASE_URL` 是否正确，且后端已配置 CORS 允许 Vercel 域名 |
| 修改环境变量不生效 | 修改后需在 **Deployments** 中 **Redeploy** |
