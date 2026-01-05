# Coolify 部署指南

本指南将帮助您在 Oracle 服务器上使用 Coolify 部署 Canovo 3D 礼品收集系统。

## 前提条件

- ✅ Oracle 服务器已安装 Coolify
- ✅ 有可用的域名
- ✅ Supabase 项目已创建（仅用于数据库）

---

## 部署步骤

### 1. 准备代码仓库

将项目代码推送到 Git 仓库（GitHub/GitLab/Gitea）：

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-git-repo-url
git push -u origin main
```

### 2. 在 Coolify 创建新项目

1. 登录 Coolify 面板
2. 点击 **"+ New Resource"**
3. 选择 **"Application"**
4. 选择 **"Public Repository"** 或连接您的 Git 仓库

### 3. 配置应用

#### 基本设置

- **Name**: `canovo-3d-gifts`
- **Repository URL**: 您的 Git 仓库地址
- **Branch**: `main`
- **Build Pack**: `nixpacks` 或 `dockerfile`

#### 构建设置

Coolify 会自动检测 Next.js 项目并配置构建命令：

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Port**: `3000`

### 4. 配置环境变量

在 Coolify 的 **Environment Variables** 部分添加：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 管理员密码
ADMIN_PASSWORD=sculptify2025

# 文件存储配置
UPLOAD_DIR=/app/uploads
NEXT_PUBLIC_FILE_BASE_URL=https://canovo.yourdomain.com
```

**重要**：将 `NEXT_PUBLIC_FILE_BASE_URL` 替换为您的实际域名！

### 5. 配置持久化存储

在 Coolify 的 **Storage** 部分添加持久化卷：

- **Source**: `/var/lib/coolify/applications/canovo-uploads`
- **Destination**: `/app/uploads`
- **Type**: `volume`

这样文件会持久化保存，即使容器重启也不会丢失。

### 6. 配置域名

在 Coolify 的 **Domains** 部分：

1. 添加您的域名：`canovo.yourdomain.com`
2. Coolify 会自动配置 Nginx 反向代理
3. 自动申请 Let's Encrypt SSL 证书（HTTPS）

### 7. 部署应用

点击 **"Deploy"** 按钮，Coolify 会：

1. 拉取代码
2. 安装依赖
3. 构建应用
4. 启动容器
5. 配置 HTTPS

部署过程大约需要 3-5 分钟。

---

## 验证部署

### 1. 检查应用状态

在 Coolify 面板查看：
- ✅ 容器状态：Running
- ✅ 健康检查：Healthy
- ✅ SSL 证书：Active

### 2. 测试访问

访问您的域名：`https://canovo.yourdomain.com`

- 应该看到登录页面
- HTTPS 证书有效
- 无安全警告

### 3. 测试文件上传

1. 登录员工账号
2. 上传照片
3. 检查文件是否保存到 `/var/lib/coolify/applications/canovo-uploads/photos/`

### 4. 测试管理员功能

1. 访问 `/sculptify-admin`
2. 上传 GLB 模型
3. 检查员工端是否能看到 3D 预览

---

## 常见问题

### Q1: 文件上传失败

**检查**：
- 持久化卷是否正确挂载？
- `UPLOAD_DIR` 环境变量是否设置为 `/app/uploads`？
- 容器是否有写入权限？

**解决**：
```bash
# SSH 到服务器，检查目录权限
ls -la /var/lib/coolify/applications/canovo-uploads
```

### Q2: 文件访问 404

**检查**：
- `NEXT_PUBLIC_FILE_BASE_URL` 是否设置正确？
- 是否包含 `https://`？
- 域名是否与实际访问域名一致？

**解决**：
确保环境变量格式正确：
```env
NEXT_PUBLIC_FILE_BASE_URL=https://canovo.yourdomain.com
```

### Q3: CORS 错误

Model Viewer 加载模型时出现 CORS 错误。

**解决**：
文件通过同域名的 `/api/uploads/` 路由访问，不会有 CORS 问题。

### Q4: 容器重启后文件丢失

**原因**：持久化卷未正确配置

**解决**：
确保在 Coolify Storage 设置中添加了卷挂载。

---

## 性能优化

### 1. 启用 Gzip 压缩

Coolify 的 Nginx 默认启用 Gzip，无需额外配置。

### 2. 配置缓存

文件访问 API 已设置缓存头：
```
Cache-Control: public, max-age=31536000, immutable
```

### 3. 监控磁盘空间

定期检查上传目录大小：
```bash
du -sh /var/lib/coolify/applications/canovo-uploads
```

30 个员工 × 100MB ≈ 3GB，确保有足够空间。

---

## 备份建议

### 自动备份脚本

```bash
#!/bin/bash
# backup-uploads.sh

BACKUP_DIR="/backups/canovo-uploads"
SOURCE_DIR="/var/lib/coolify/applications/canovo-uploads"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz $SOURCE_DIR

# 保留最近 7 天的备份
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +7 -delete
```

### 设置定时任务

```bash
# 每天凌晨 2 点备份
0 2 * * * /path/to/backup-uploads.sh
```

---

## 更新应用

在 Coolify 中更新应用：

1. 推送新代码到 Git 仓库
2. 在 Coolify 点击 **"Redeploy"**
3. Coolify 会自动拉取最新代码并重新部署

**注意**：文件不会丢失，因为使用了持久化卷。

---

## 技术支持

如遇问题，请检查：

1. Coolify 应用日志
2. 容器日志：`docker logs <container-id>`
3. Nginx 日志：`/var/log/nginx/`

完成！🎉
