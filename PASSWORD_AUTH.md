# 密码身份验证功能说明

## 功能概述

已为三个角色添加了密码身份验证功能:
- ✅ **评委端** - 需要用户名和密码登录
- ✅ **述职人员** - 需要用户名和密码登录  
- ✅ **管理员** - 需要用户名和密码登录

## 默认密码

所有用户的默认密码为: `123456`

### 默认用户列表

初始化后,系统会创建以下用户:

| 姓名 | 角色 | 密码 |
|------|------|------|
| 管理员 | 管理员 | 123456 |
| 评委张三 | 评委 | 123456 |
| 评委李四 | 评委 | 123456 |
| 述职人员王五 | 述职人员 | 123456 |
| 述职人员赵六 | 述职人员 | 123456 |

## 使用流程

### 1. 初始化数据库

首次使用前,访问以下地址初始化数据库:
```
http://localhost:3000/api/init
```

### 2. 登录系统

1. 在首页选择角色(评委/述职人员/管理员)
2. 选择对应的用户
3. 输入密码 (默认: 123456)
4. 点击"进入系统"按钮

### 3. 管理员功能

管理员登录后可以:
- 添加新用户并设置密码
- 查看用户列表及其默认密码
- 删除用户
- 管理题目和周期

## 数据库变更

### users 表新增字段

```sql
password VARCHAR(255) NOT NULL DEFAULT '123456'
```

## 安全说明

### ✅ 当前安全措施

1. **密码不暴露给客户端**
   - 查询用户列表时不返回密码字段
   - 只在登录验证时使用密码

2. **登录验证在服务器端**
   - 验证逻辑在 `/api/auth/login` API 中执行
   - 客户端无法绕过验证

3. **数据库密码保护**
   - 数据库连接信息在 `.env.local` 中
   - 不会暴露给前端用户

### 🔐 生产环境建议

**重要提示**: 当前密码是明文存储,仅适用于演示环境!

生产环境应该:

1. **使用密码哈希**
   ```bash
   npm install bcrypt
   ```
   
2. **修改存储逻辑**
   ```typescript
   import bcrypt from 'bcrypt'
   
   // 添加用户时
   const hashedPassword = await bcrypt.hash(password, 10)
   
   // 验证密码时
   const isValid = await bcrypt.compare(password, hashedPassword)
   ```

3. **添加会话管理**
   - 使用 JWT 或 Session
   - 添加登录过期机制

4. **强密码策略**
   - 要求密码长度至少8位
   - 包含大小写字母、数字和特殊字符

## API 接口

### POST /api/auth/login

登录验证接口

**请求参数:**
```json
{
  "name": "评委张三",
  "password": "123456",
  "role": "judge"
}
```

**成功响应:**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "name": "评委张三",
    "role": "judge"
  }
}
```

**失败响应:**
```json
{
  "success": false,
  "message": "用户名或密码错误"
}
```

## 数据迁移

如果已有数据库,需要添加密码字段:

```sql
-- 为现有用户表添加密码字段
ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '123456';
```

或者删除旧表重新初始化:

```sql
DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS score_periods;
DROP TABLE IF EXISTS score_questions;
DROP TABLE IF EXISTS users;
```

然后重新访问 `/api/init` 初始化。

## 测试建议

1. **测试正确登录**
   - 使用正确的用户名和密码
   - 验证能成功进入系统

2. **测试错误密码**
   - 使用错误的密码
   - 验证显示错误提示

3. **测试不存在的用户**
   - 验证错误处理

4. **测试角色权限**
   - 评委只能看到评分界面
   - 述职人员只能看到自己的成绩
   - 管理员可以管理所有数据
