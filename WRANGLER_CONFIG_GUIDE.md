# CloudFlare ImgBed wrangler.toml 配置指南

## 🚨 重要：设置保存失败的解决方案

如果您遇到"设置保存成功但退出后被还原"的问题，这是因为 `wrangler.toml` 文件缺少必要的KV数据库绑定配置。

## 📋 必需配置步骤

### 1. 创建 Cloudflare KV Namespace

在 Cloudflare Dashboard 中：
1. 进入 Workers & Pages 
2. 点击 KV
3. 创建新的 Namespace，命名如 `imgbed-storage`
4. 记录 Namespace ID

### 2. 创建 R2 Bucket（可选，如果使用R2存储）

在 Cloudflare Dashboard 中：
1. 进入 R2 Object Storage
2. 创建新的 Bucket
3. 记录 Bucket 名称

### 3. 配置 wrangler.toml

将以下配置复制到您的 `wrangler.toml` 文件，并替换相应的值：

```toml
name = "isufe"
compatibility_date = "2024-07-01"

# ===== 必需配置 =====
# KV数据库绑定 - 用于存储图片元数据和系统设置
[[kv_namespaces]]
binding = "img_url"
id = "YOUR_KV_NAMESPACE_ID"           # 替换为您的KV Namespace ID
preview_id = "YOUR_KV_NAMESPACE_ID"   # 通常与上面相同

# ===== 可选配置 =====
# R2对象存储绑定 - 用于存储图片文件（如果使用R2）
[[r2_buckets]]
binding = "img_r2"
bucket_name = "YOUR_R2_BUCKET_NAME"   # 替换为您的R2 Bucket名称

# 环境变量配置
[vars]
# 管理员认证（必需）
BASIC_USER = "admin"                  # 管理员用户名
BASIC_PASS = "your_admin_password"    # 管理员密码

# 用户上传认证码（可选，留空则无需认证）
AUTH_CODE = ""

# S3存储配置（如果使用第三方S3）
S3_ACCESS_KEY_ID = ""
S3_SECRET_ACCESS_KEY = ""
S3_BUCKET_NAME = ""
S3_ENDPOINT = ""
S3_REGION = "us-east-1"
S3_PATH_STYLE = "true"

# Telegram配置（如果使用Telegram存储）
TG_BOT_TOKEN = ""
TG_CHAT_ID = ""

# CloudFlare API配置（用于CDN缓存清理）
CF_ZONE_ID = ""
CF_EMAIL = ""
CF_API_KEY = ""

# 其他配置
ALLOWED_DOMAINS = ""                  # 允许的引用域名，多个用逗号分隔
WhiteList_Mode = "false"              # 是否启用白名单模式
AllowRandom = "true"                  # 是否允许随机图片API
disable_telemetry = "false"           # 是否禁用遥测
```

## 🔧 修复步骤

### 步骤1：更新配置文件
1. 在 Cloudflare Dashboard 创建 KV Namespace
2. 获取 Namespace ID
3. 更新 `wrangler.toml` 文件中的 `id = "YOUR_KV_NAMESPACE_ID"`
4. 设置管理员用户名密码

### 步骤2：重新部署
```bash
# 如果使用本地开发
wrangler dev

# 如果部署到生产环境
wrangler deploy
```

### 步骤3：Docker环境修复
```bash
# 停止容器
docker-compose down

# 重新构建并启动
docker-compose up --build
```

## 📊 验证配置

部署后，您可以：

1. **检查KV绑定状态**：
   访问 `/api/manage/debug` 查看配置状态

2. **测试设置保存**：
   - 登录管理界面
   - 修改任意设置并保存
   - 刷新页面检查设置是否保持

3. **检查日志**：
   ```bash
   # 查看容器日志
   docker-compose logs -f imgbed
   
   # 或者查看Cloudflare Workers日志
   wrangler tail
   ```

## ❗ 常见问题

### 问题1：设置保存后仍然还原
- **原因**：KV Namespace ID 配置错误
- **解决**：检查 Cloudflare Dashboard 中的 Namespace ID 是否正确

### 问题2：无法访问管理界面
- **原因**：BASIC_USER 和 BASIC_PASS 未设置
- **解决**：在 wrangler.toml 中设置管理员认证信息

### 问题3：上传失败
- **原因**：存储渠道配置错误
- **解决**：检查 R2、S3 或 Telegram 配置

## 💡 最佳实践

1. **安全性**：
   - 使用强密码作为管理员密码
   - 不要在公共代码仓库中暴露敏感信息

2. **备份**：
   - 定期备份 KV 数据
   - 保存配置文件副本

3. **监控**：
   - 启用 Cloudflare Analytics
   - 监控存储使用情况

## 🆘 获取帮助

如果仍然遇到问题：
1. 检查 Cloudflare Workers 日志
2. 访问 `/api/manage/debug` 查看详细状态
3. 查看浏览器开发者工具的 Network 标签页错误信息 