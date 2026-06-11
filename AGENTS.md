# AGENTS.md - AI 协作指南

> 本文件为 AI 编码助手提供项目上下文，帮助快速理解架构约定和代码规范。

## 项目概述

课时管理 KA（Course Record）前端 —— 基于 uni-app + Vue 3 + TypeScript 的微信小程序，面向教育培训机构的教师和家长，提供学生管理、班级管理、课程管理、课时扣费、排课等功能。

后端为 Spring Cloud Alibaba 微服务架构，前端通过 Nginx → Gateway → 微服务的链路通信。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | uni-app (Vue 3 Composition API) |
| 语言 | TypeScript (strict, noImplicitAny: false) |
| 构建 | Vite 5 + @dcloudio/vite-plugin-uni |
| 状态管理 | Pinia (Composition Store 风格) |
| 加密 | sm-crypto (SM2 加密 + SM3 签名) |
| 包管理 | pnpm |
| 目标平台 | 微信小程序 (mp-weixin) 为主，兼容 H5 |

## 目录结构

```
src/
├── api/                    # API 接口层（按业务模块分目录）
│   ├── auth/               # 认证相关（登录、登出、Token 刷新）
│   ├── menu/               # 菜单（属于 auth-service）
│   ├── student/            # 学生 CRUD
│   ├── teacher/            # 教师 CRUD
│   ├── class/              # 班级 CRUD + 学生进出班
│   ├── course/             # 课程 CRUD
│   ├── course-record/      # 课卡记录（学生课程关联）+ 扣课
│   ├── class-schedule/     # 班级课表
│   ├── institution/        # 机构/校区
│   └── record/             # 扣课记录
├── components/             # 通用组件
│   ├── floating-action-button/  # 悬浮操作按钮
│   ├── form-group/         # 表单字段组
│   ├── form-page/          # 表单页面容器
│   ├── page-footer/        # 页面底部
│   └── search-filter-bar/  # 搜索筛选栏
├── config/
│   ├── routes.ts           # 页面路由常量（ROUTES 对象）
│   └── common.ts           # 数据字段映射（DATA_INDEX_MAP 等）
├── pages/
│   ├── index/              # 启动页（角色选择）
│   ├── login/              # 登录页
│   ├── privacy/            # 隐私政策
│   ├── user-agreement/     # 用户协议
│   ├── main/               # 主功能分包
│   │   ├── index/          # 主页（TabBar）
│   │   ├── component/      # 主页子组件（teacher/home, parent/home 等）
│   │   ├── parent/         # 家长端页面
│   │   └── teacher/        # 教师端页面（30+ 子页面）
│   └── class-record/       # 课时记录分包（家长端课时查看）
├── stores/
│   ├── user.ts             # 用户信息（userInfo, roleId, identityInfo）
│   └── student.ts          # 当前学生信息（studentList, studentInfo）
├── types/                  # 全局类型声明（.d.ts）
├── utils/
│   ├── request/index.ts    # HTTP 请求封装（核心）
│   ├── crypto/index.ts     # SM2 加密 + SM3 签名
│   ├── common/index.ts     # 通用工具（跳转、Toast、数据解析、切换用户）
│   └── share/index.ts      # 全局分享配置
├── static/                 # 静态资源（SVG 图标、SCSS 变量、logo）
├── App.vue                 # 根组件
├── main.ts                 # 入口文件
├── manifest.json           # uni-app 应用配置
├── pages.json              # 页面路由配置（含分包）
└── uni.scss                # 全局 SCSS 变量
```

## 微服务 API 路由规则（关键）

前端所有 API 请求经过 `Nginx(:9080) → Gateway(:9999) → 微服务` 链路。

Gateway 路由规则（stripPrefix=1，去掉第一段路径）：

| 前端路径前缀 | Gateway 转发目标 | 到达 Controller 的路径 |
|-------------|-----------------|----------------------|
| `/auth/**` | auth-service | 去掉 `/auth` 后的路径 |
| `/biz/**` | business-service | 去掉 `/biz` 后的路径 |

### API 路径命名规则

**auth-service 的接口**（路径前缀 `/auth`）：
- AuthController 类级别 `@RequestMapping("/auth")` → 前端路径：`/auth/auth/xxx`
- MenuController 类级别 `@RequestMapping("/menu")` → 前端路径：`/auth/menu/xxx`

**business-service 的接口**（路径前缀 `/biz`）：
- 所有业务 Controller → 前端路径：`/biz/{controller_mapping}/xxx`

### 示例

```
前端调用: POST /auth/auth/login_by_pwd
→ Nginx 转发到 Gateway: /auth/auth/login_by_pwd
→ Gateway stripPrefix=1: /auth/login_by_pwd → auth-service
→ AuthController(@RequestMapping("/auth")) 的 /login_by_pwd 方法

前端调用: POST /biz/student/get_by_student_id
→ Nginx 转发到 Gateway: /biz/student/get_by_student_id
→ Gateway stripPrefix=1: /student/get_by_student_id → business-service
→ StudentController(@RequestMapping("/student")) 的 /get_by_student_id 方法
```

## 请求封装（utils/request）

### 核心机制

- **baseUrl**：development → `http://localhost:9080`，production → `https://api.kurimula-airi.top`
- **认证头**：`Authorization: Bearer {accessToken}`（从 uni.getStorageSync 获取）
- **签名头**：每个请求自动附加 `x-sign`、`x-timestamp`、`x-nonce`（SM3 签名防篡改）
- **401 处理**：自动使用 refreshToken 静默刷新，刷新期间其他请求排队等待
- **刷新 URL**：`/auth/auth/refresh`

### 导出方法

```typescript
import { get, post, put, del } from "@/utils/request";
// url 必须以 /auth 或 /biz 开头
post<ResponseType>("/biz/student/get_by_student_id", { studentId: 1 });
```

### 新增 API 的步骤

1. 在 `src/types/` 中定义 Request/Response 类型（.d.ts 文件）
2. 在 `src/api/{module}/index.ts` 中添加函数，路径必须带 `/auth/` 或 `/biz/` 前缀
3. 在页面中 import 使用

## 类型系统

### 全局类型声明

所有业务类型定义在 `src/types/*.d.ts` 中，无需 import 即可在全局使用（tsconfig include 自动包含）。

### 核心类型

| 类型文件 | 关键类型 |
|---------|---------|
| `http.d.ts` | `ApiResponse<T>`（统一响应包装）、`LoginResponse` |
| `user.d.ts` | `UserResponse`（联合类型，根据 roleId 区分教师/家长） |
| `auth.d.ts` | `LoginByPwdRequest`、`LoginByTokenRequest`、`RefreshTokenRequest` |
| `student.d.ts` | `StudentResponse`、各种 Request/Response |
| `common.d.ts` | `SearchFilterConfig`、`ToSelectStudentPageParams` |
| `env.d.ts` | `sm-crypto` 模块声明 |

### 类型命名约定

- Request 类型：`{Action}{Entity}Request`（如 `InsertStudentRequest`、`UpdateClassRequest`）
- Response 类型：`{Action}{Entity}Response`（如 `StudentListResponse`、`LoginResponse`）
- 列表响应通常包含 `list` 和 `total` 字段

## 状态管理

使用 Pinia Composition Store 风格（`defineStore('name', () => { ... })`）。

### user store

- `userInfo: UserResponse | null` — 当前用户信息（含 roleId 判断角色）
- `setUserInfo(user)` / `clearUserInfo()`

### student store

- `studentList: StudentResponse[]` — 学生列表
- `studentInfo: StudentResponse | null` — 当前选中学生
- `setStudentInfo(student)` / `setStudentList(list)` / `clearAll()`

## 加密与签名

### SM2 密码加密

```typescript
import { encryptPassword } from "@/utils/crypto";
const encrypted = encryptPassword(plainPassword); // 返回 "04" + 密文
```

### SM3 请求签名

每次请求自动在 `utils/request` 中调用 `generateSign(data)` 生成签名，附加到请求头：
- `x-sign`: SM3 签名值
- `x-timestamp`: 时间戳
- `x-nonce`: 8位随机串

签名算法：对请求参数排序拼接 + API_SECRET 盐值 → SM3 哈希。

## 页面路由

### 路由常量

所有页面路径定义在 `src/config/routes.ts` 的 `ROUTES` 对象中，页面跳转必须使用这些常量：

```typescript
import { ROUTES } from "@/config/routes";
uni.navigateTo({ url: ROUTES.STUDENT_DETAIL });
```

### 分包结构

- **主包**：启动页、登录页、隐私/协议页
- **pages/main 分包**：主功能页（教师端 30+ 页面 + 家长端页面）
- **pages/class-record 分包**：课时记录（家长端查看课时）

### 角色路由

- `roleId: 3` → 家长（ParentIdentity）→ parent/ 下的页面
- `roleId: 4` → 教师（TeacherIdentity）→ teacher/ 下的页面

## 编码规范

### 文件命名

- 页面目录：kebab-case（如 `class-manage/`、`fast-deduct/`）
- API 目录：kebab-case（如 `course-record/`）
- 类型文件：kebab-case（如 `course-record.d.ts`）
- 组件目录：kebab-case（如 `search-filter-bar/`）

### Vue 组件风格

- 使用 `<script setup lang="ts">`
- Composition API + `ref` / `computed` / `watch`
- 样式使用 SCSS，全局变量通过 `@use` 引入

### 条件编译

微信小程序特有代码使用 uni-app 条件编译：

```typescript
// #ifdef MP-WEIXIN
platform = "WEIXIN";
// #endif
```

### 组件自动导入

uni-app easycom 机制：`uni-xxx` 组件自动从 `@dcloudio/uni-ui` 导入，无需手动 import。

## 常见任务

### 新增业务页面

1. 在 `src/pages/main/teacher/` 或 `parent/` 下创建目录
2. 创建 `index.vue` + `index.scss`
3. 在 `pages.json` 的 subPackages 中注册页面
4. 在 `src/config/routes.ts` 中添加路由常量

### 新增 API 接口

1. 在 `src/types/` 对应 .d.ts 中定义 Request/Response 类型
2. 在 `src/api/{module}/index.ts` 中添加函数，路径加 `/auth/` 或 `/biz/` 前缀
3. export 函数供页面使用

### 修改请求逻辑

核心请求逻辑在 `src/utils/request/index.ts`，包括：
- baseUrl 配置
- Token 头格式（Authorization: Bearer xxx）
- 401 自动刷新逻辑
- 签名头附加

### 环境切换

- 开发环境：`http://localhost:9080`（Nginx 本地代理）
- 生产环境：`https://api.kurimula-airi.top`

## 构建与运行

```bash
# 安装依赖
pnpm install

# 开发模式（微信小程序）
pnpm dev:mp-weixin

# 开发模式（H5）
pnpm dev:h5

# 生产构建（微信小程序）
pnpm build:mp-weixin

# 类型检查
pnpm type-check
```

## 注意事项

1. **API 路径必须带 Gateway 前缀**：`/auth/` 或 `/biz/`，否则 Gateway 无法路由
2. **Token 格式**：`Authorization: Bearer xxx`，不是 `token: xxx`
3. **类型文件无需 import**：`src/types/*.d.ts` 中的类型全局可用
4. **路由跳转用 ROUTES 常量**：不要硬编码页面路径
5. **SM2 cipherMode**：前端使用 cipherMode=1（C1C3C2），需与后端一致
6. **SCSS 全局变量**：通过 vite.config.ts 的 additionalData 自动注入，组件中直接使用
7. **分包加载**：主包控制在 2MB 以内，业务页面放 subPackages
