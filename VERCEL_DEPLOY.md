# Vercel 部署指南

## 一、Git 推送（已完成）

- 仓库：https://github.com/syperstart/seckill-system
- 分支：main

## 二、Vercel 部署步骤

### 1. 连接 GitHub

1. 打开 [vercel.com](https://vercel.com)，登录
2. 点击 **Add New** → **Project**
3. 选择 **Import Git Repository**，找到 `syperstart/seckill-system`
4. 点击 **Import**

### 2. 配置项目

Vercel 会自动识别 Vite 项目，默认配置通常无需修改：

- **Framework Preset**：Vite
- **Build Command**：`npm run build`
- **Output Directory**：`dist`
- **Root Directory**：`./`（若只部署 frontend 目录，填 `frontend`；当前仓库已是 frontend 根目录则留空）

### 3. 环境变量（重要）

前端需要知道后端 API 地址。在 **Environment Variables** 中添加：

| 名称 | 值 | 说明 |
|------|-----|------|
| `VITE_API_BASE_URL` | `https://你的后端域名/api` | 后端 API 地址，必须以 `/api` 结尾 |

**示例**：
- 后端部署在 `https://api.example.com`，则填 `https://api.example.com/api`
- 若后端暂未部署，可先填占位地址，后续在 Vercel 项目设置中修改

### 4. 部署

点击 **Deploy**，等待构建完成即可。

---

## 三、注意事项

1. **后端需单独部署**：Vercel 只部署前端静态资源，后端需部署到其他服务（如 Railway、Render、自有服务器等）
2. **跨域**：后端需配置 CORS，允许 Vercel 域名访问
3. **HTTPS**：生产环境建议前后端均使用 HTTPS
