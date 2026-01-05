# Canovo 年会 3D 礼品收集系统

by Sculptify

## 项目简介

这是一个为 Canovo 年会设计的 3D 礼品收集系统。员工可以上传照片，管理员处理后上传 3D 模型，员工可以预览自己的专属 3D 礼品。

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **样式**: Vanilla CSS (玻璃态效果、渐变、动画)
- **3D 查看器**: Google Model Viewer
- **数据库**: Supabase (仅数据库)
- **文件存储**: 本地文件系统（无大小限制）
- **部署**: Coolify (Docker)

## 架构特点

### 混合架构
- ✅ **数据库**: Supabase 云端（免费，自动备份）
- ✅ **文件存储**: Oracle 服务器本地存储（无限制）
- ✅ **部署**: Coolify 自动化部署（HTTPS + 持久化）

### 优势
- 📸 照片和模型无大小限制
- 💰 完全免费（利用现有服务器资源）
- 🔒 HTTPS 自动配置
- 💾 文件持久化存储
- 🚀 一键部署更新

## 功能特性

### 员工端
- ✅ 姓名 + 访问码验证登录
- ✅ 上传照片（支持替换）
- ✅ 查看提交状态
- ✅ 3D 模型交互式预览

### 管理端 (/sculptify-admin)
- ✅ 密码保护的管理面板
- ✅ 员工状态总览（未上传/待处理/已完成）
- ✅ 下载员工照片
- ✅ 上传 GLB 3D 模型（支持 100MB+）
- ✅ 实时统计数据

## 环境配置

### 1. 环境变量设置

创建 `.env.local` 文件：

```env
# Supabase 数据库配置
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# 管理员密码
ADMIN_PASSWORD=sculptify2025

# 文件存储配置
UPLOAD_DIR=/app/uploads
NEXT_PUBLIC_FILE_BASE_URL=https://your-domain.com
```

详细配置说明请查看 [ENV_CONFIG.md](./ENV_CONFIG.md)

### 2. Supabase 数据库配置

#### 创建数据表

在 Supabase SQL 编辑器中执行：

```sql
-- 创建 employees 表
CREATE TABLE employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 submissions 表
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_name TEXT NOT NULL,
  photo_url TEXT,
  model_url TEXT,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_submissions_employee_name ON submissions(employee_name);
CREATE INDEX idx_submissions_status ON submissions(status);

-- 插入员工数据
INSERT INTO employees (name) VALUES
  ('张伟'),
  ('李娜'),
  ('王芳');
```

详细 Supabase 设置请查看 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 3. 更新员工名单

编辑 `lib/employees.json` 文件，添加授权员工姓名：

```json
[
  "张三",
  "李四",
  "王五"
]
```

**注意**：必须与数据库中的 employees 表同步！

## 本地开发

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

**注意**：本地开发时文件会保存到 `uploads/` 目录。

## 部署

### Coolify 部署（推荐）⭐

详细部署指南请查看 [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md)

**快速步骤：**

1. 推送代码到 Git 仓库
2. 在 Coolify 创建新应用
3. 配置环境变量
4. 配置持久化存储卷：`/app/uploads`
5. 设置域名（自动 HTTPS）
6. 部署

### 其他部署方式

也可以部署到 Vercel/Railway 等平台，但需要配置外部存储（如 Cloudflare R2）。

## 项目结构

```
canovo3d/
├── app/
│   ├── page.tsx                    # 员工登录页
│   ├── upload/page.tsx             # 上传/预览页
│   ├── sculptify-admin/page.tsx    # 管理员面板
│   ├── api/
│   │   ├── verify/route.ts         # 验证 API
│   │   ├── submissions/route.ts    # 提交管理 API
│   │   ├── upload-model/route.ts   # 模型上传 API
│   │   └── uploads/[...path]/route.ts  # 静态文件服务
│   ├── layout.tsx
│   └── globals.css                 # 全局样式
├── lib/
│   ├── supabase.ts                 # Supabase 客户端
│   ├── storage.ts                  # 本地存储工具
│   ├── types.ts                    # TypeScript 类型
│   └── employees.json              # 员工名单
├── types/
│   └── model-viewer.d.ts           # Model Viewer 类型定义
├── uploads/                        # 文件存储目录（持久化）
│   ├── photos/                     # 员工照片
│   └── models/                     # 3D 模型
├── Dockerfile                      # Docker 配置
├── COOLIFY_DEPLOYMENT.md           # Coolify 部署指南
└── ENV_CONFIG.md                   # 环境变量说明
```

## 使用流程

### 员工使用流程

1. 访问首页，输入姓名和访问码（Canovo2025）
2. 上传照片（无大小限制）
3. 等待管理员处理
4. 查看 3D 模型预览

### 管理员使用流程

1. 访问 `/sculptify-admin`
2. 输入管理员密码（默认：sculptify2025）
3. 查看员工列表和状态
4. 下载待处理员工的照片
5. 制作 3D 模型后上传 .glb 文件（支持 100MB+）
6. 员工自动可以看到 3D 预览

## 访问码和密码

- **员工访问码**: `Canovo2025`
- **管理员密码**: `sculptify2025` (可在环境变量中修改)

## 注意事项

- ✅ 文件存储无大小限制（本地存储）
- ✅ 照片和模型支持任意大小
- ✅ 确保 Coolify 配置了持久化卷
- ✅ 生产环境请修改默认密码
- ✅ 定期备份 uploads 目录

## 许可证

MIT

