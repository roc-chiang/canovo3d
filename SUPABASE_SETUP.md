# Supabase 设置指南

## 步骤 1: 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 注册/登录账号
3. 点击 "New Project"
4. 填写项目信息：
   - Name: `canovo-3d-gifts`
   - Database Password: 设置一个强密码（保存好）
   - Region: 选择离您最近的区域
5. 点击 "Create new project"，等待项目创建完成（约 2 分钟）

## 步骤 2: 获取项目凭证

1. 项目创建完成后，进入项目设置
2. 点击左侧菜单 "Settings" → "API"
3. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

4. 在项目根目录创建 `.env.local` 文件，填入：

```env
NEXT_PUBLIC_SUPABASE_URL=你的Project_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_public_key
ADMIN_PASSWORD=sculptify2025
```

## 步骤 3: 创建数据库表

1. 在 Supabase 控制台，点击左侧 "SQL Editor"
2. 点击 "New query"
3. 复制粘贴以下 SQL 代码：

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

-- 创建索引以提高查询性能
CREATE INDEX idx_submissions_employee_name ON submissions(employee_name);
CREATE INDEX idx_submissions_status ON submissions(status);

-- 插入示例员工数据（根据实际情况修改）
INSERT INTO employees (name) VALUES
  ('张伟'),
  ('李娜'),
  ('王芳'),
  ('刘强'),
  ('陈静');
```

4. 点击 "Run" 执行 SQL

## 步骤 4: 创建存储桶

### 创建 employee-photos 桶

1. 点击左侧 "Storage"
2. 点击 "Create a new bucket"
3. 填写信息：
   - Name: `employee-photos`
   - Public bucket: ✅ **勾选**（重要！）
4. 点击 "Create bucket"

### 创建 3d-models 桶

1. 再次点击 "Create a new bucket"
2. 填写信息：
   - Name: `3d-models`
   - Public bucket: ✅ **勾选**（重要！）
3. 点击 "Create bucket"

## 步骤 5: 设置存储策略（可选，如果公开桶不够）

如果需要更细粒度的控制，可以设置以下策略：

1. 点击 "Storage" → "Policies"
2. 为每个桶添加策略

### employee-photos 策略

```sql
-- 允许所有人读取
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'employee-photos');

-- 允许上传
CREATE POLICY "Allow Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'employee-photos');

-- 允许更新
CREATE POLICY "Allow Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'employee-photos');
```

### 3d-models 策略

```sql
-- 允许所有人读取
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = '3d-models');

-- 允许上传
CREATE POLICY "Allow Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = '3d-models');

-- 允许更新
CREATE POLICY "Allow Update"
ON storage.objects FOR UPDATE
USING (bucket_id = '3d-models');
```

## 步骤 6: 验证设置

### 检查数据表

1. 点击 "Table Editor"
2. 应该能看到 `employees` 和 `submissions` 两个表
3. `employees` 表应该有示例数据

### 检查存储桶

1. 点击 "Storage"
2. 应该能看到 `employee-photos` 和 `3d-models` 两个桶
3. 两个桶都应该显示为 "Public"

## 步骤 7: 更新员工名单

在项目中编辑 `lib/employees.json`，添加实际的员工姓名：

```json
[
  "张伟",
  "李娜",
  "王芳",
  "刘强",
  "陈静"
]
```

**注意**: 这个列表必须与数据库中的 `employees` 表同步！

## 常见问题

### Q: 上传文件失败，显示 403 错误
**A**: 检查存储桶是否设置为 Public，或者策略是否正确配置。

### Q: 无法查看上传的图片/模型
**A**: 确保存储桶是 Public 的，或者 RLS 策略允许 SELECT 操作。

### Q: 员工登录失败
**A**: 检查 `lib/employees.json` 中是否包含该员工姓名（区分大小写）。

### Q: 数据库连接失败
**A**: 检查 `.env.local` 文件中的 URL 和 Key 是否正确。

## 下一步

设置完成后：

1. 运行 `npm run dev` 启动开发服务器
2. 访问 http://localhost:3000 测试员工登录
3. 访问 http://localhost:3000/sculptify-admin 测试管理员面板

## 生产环境部署

部署到 Vercel 时，记得在 Vercel 项目设置中添加环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ADMIN_PASSWORD`

完成！🎉
