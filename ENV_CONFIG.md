# 环境变量配置说明

## Supabase 数据库配置

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 管理员密码

```env
ADMIN_PASSWORD=sculptify2025
```

## 文件存储配置（本地存储）

```env
UPLOAD_DIR=/app/uploads
NEXT_PUBLIC_FILE_BASE_URL=https://your-domain.com
```

## 说明

- `UPLOAD_DIR`: 服务器上的文件存储路径（Coolify 会自动挂载为持久化卷）
- `NEXT_PUBLIC_FILE_BASE_URL`: 您的域名，用于生成文件访问 URL
- 照片和模型文件都存储在本地文件系统，无大小限制
