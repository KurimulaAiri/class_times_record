# 课时管理 KA - 前端

教育培训机构课时管理微信小程序，面向教师和家长提供学生管理、班级管理、课程管理、课时扣费、排课等功能。

## 系统架构

```
微信小程序 → Nginx(:9080) → Gateway(:9999) → auth-service(:10002)
                                           → business-service(:10001)
```

| 组件 | 端口 | 说明 |
|------|------|------|
| Nginx | 9080 | 反向代理，动态 DNS 转发到 Gateway |
| Gateway | 9999 | JWT 认证 + 路由分发（StripPrefix=1） |
| auth-service | 10002 | 认证/菜单/权限 |
| business-service | 10001 | 学生/教师/班级/课程/课时/机构/记录 |
| Nacos | 8848 | 服务注册/配置中心 |
| MySQL | 3306 | 数据库（121.196.229.10） |

## Gateway 路由规则

| 前端路径前缀 | 目标服务 | 说明 |
|-------------|---------|------|
| `/auth/**` | auth-service | 认证、菜单（stripPrefix=1） |
| `/biz/**` | business-service | 所有业务接口（stripPrefix=1） |

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | uni-app (Vue 3 Composition API) |
| 语言 | TypeScript |
| 构建 | Vite 5 |
| 状态管理 | Pinia |
| 加密 | sm-crypto (SM2 + SM3 国密算法) |
| 目标平台 | 微信小程序 (主要) / H5 |

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式 - 微信小程序
pnpm dev:mp-weixin

# 开发模式 - H5
pnpm dev:h5

# 生产构建 - 微信小程序
pnpm build:mp-weixin

# 类型检查
pnpm type-check
```

## 项目结构

```
src/
├── api/                    # API 接口层（按业务模块分目录）
├── components/             # 通用组件
├── config/                 # 路由常量、数据映射
├── pages/                  # 页面（主包 + 分包）
│   ├── index/              # 启动页
│   ├── login/              # 登录
│   ├── main/               # 主功能分包
│   │   ├── parent/         #   家长端页面
│   │   └── teacher/        #   教师端页面（30+）
│   └── class-record/       # 课时记录分包
├── stores/                 # Pinia 状态管理
├── types/                  # 全局类型声明 (.d.ts)
├── utils/                  # 工具函数
│   ├── request/            # HTTP 请求封装
│   ├── crypto/             # SM2/SM3 加密签名
│   ├── common/             # 通用工具
│   └── share/              # 全局分享
└── static/                 # 静态资源
```

## API 路径示例

```
登录:       POST /auth/auth/login_by_pwd
刷新Token:   POST /auth/auth/refresh
获取学生:    POST /biz/student/get_by_student_id
扣课:       POST /biz/course_record/deduct_by_student_id
```

## 功能模块

### 教师端
- 学员管理（增删改查、正式学员）
- 班级管理（创建、编辑、添加/移除学生）
- 课程管理（创建、编辑、关联班级）
- 课时扣费（按学生/课程/班级扣课、快速扣课）
- 排课管理（班级课表、调整排课）
- 教师管理（增删改查）
- 机构信息管理
- 扣课记录查看

### 家长端
- 查看孩子课程列表
- 查看课时余额和扣课记录
- 编辑学生信息

## 请求与认证

- **认证方式**: Bearer Token（`Authorization: Bearer {accessToken}`）
- **Token 刷新**: 401 时自动使用 refreshToken 静默刷新
- **请求签名**: 每个请求自动附加 SM3 签名头（`x-sign`、`x-timestamp`、`x-nonce`）
- **密码加密**: SM2 公钥加密传输

## 环境配置

| 环境 | baseUrl |
|------|---------|
| development | `http://localhost:9080` |
| production | `https://api.kurimula-airi.top` |

## 相关文档

- [AGENTS.md](./AGENTS.md) — AI 协作指南（目录约定、核心模块、编码规范）
- [架构设计文档](./docs/architecture.md) — 完整的系统架构、核心机制、安全设计、页面路由、编码规范
