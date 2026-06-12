# AGENTS.md — 课时管理 KA 前端

基于 uni-app + Vue 3 + TypeScript 的微信小程序前端，面向教育培训机构的教师和家长。

## 项目结构

```
frontend/uni-app/
├── src/
│   ├── api/                # API 接口层（按业务模块分目录）
│   ├── components/         # 通用组件
│   ├── config/             # 路由常量、数据映射
│   ├── pages/              # 页面（主包 + 分包）
│   ├── stores/             # Pinia 状态管理
│   ├── types/              # 全局类型声明（.d.ts，无需 import）
│   ├── utils/              # 工具函数
│   └── static/             # 静态资源
├── docs/                   # 文档
│   └── architecture.md     # 架构设计文档
├── AGENTS.md               # 本文件
└── README.md               # 项目说明
```

## 技术栈

| 组件 | 技术 |
|------|------|
| 框架 | uni-app (Vue 3 Composition API) |
| 语言 | TypeScript (strict, noImplicitAny: false) |
| 构建 | Vite 5 + @dcloudio/vite-plugin-uni |
| 状态管理 | Pinia (Composition Store 风格) |
| 加密 | sm-crypto (SM2 + SM3 国密算法) |
| 包管理 | pnpm |
| 目标平台 | 微信小程序 (mp-weixin) 为主，兼容 H5 |

## 目录约定

- `src/api/{module}/index.ts` — API 接口函数，路径必须以 `/auth/` 或 `/biz/` 开头
- `src/types/*.d.ts` — 全局类型声明，tsconfig 自动 include，无需 import
- `src/stores/*.ts` — Pinia Composition Store（`defineStore('name', () => { ... })`）
- `src/utils/request/index.ts` — HTTP 请求封装（Token、签名、401 刷新）
- `src/utils/crypto/index.ts` — SM2 加密 + SM3 签名
- `src/utils/common/index.ts` — 通用工具（jump、showToast、parseData、usePageData）
- `src/config/routes.ts` — 页面路由常量（ROUTES 对象），跳转必须使用
- `src/components/` — 通用组件（form-group、form-page、search-filter-bar 等）

## 核心模块

### api/

按业务模块分目录，每个模块一个 `index.ts`：

| 目录 | Gateway 前缀 | 目标服务 | 说明 |
|------|------------|---------|------|
| `auth/` | `/auth/auth/` | auth-service | 登录/登出/Token 刷新 |
| `menu/` | `/auth/menu/` | auth-service | 菜单查询 |
| `student/` | `/biz/student/` | business-service | 学生 CRUD |
| `teacher/` | `/biz/teacher/` | business-service | 教师 CRUD |
| `class/` | `/biz/class/` | business-service | 班级管理 |
| `course/` | `/biz/course/` | business-service | 课程 CRUD |
| `course-record/` | `/biz/course_record/` | business-service | 课卡记录 + 扣课 |
| `class-schedule/` | `/biz/class_schedule/` | business-service | 班级课表 |
| `institution/` | `/biz/institution/` | business-service | 机构/校区 |
| `record/` | `/biz/record/` | business-service | 扣课记录 |

### utils/request

HTTP 请求封装，核心机制：
- **baseUrl**：development → `http://localhost:9080`，production → `https://api.kurimula-airi.top`
- **认证头**：`Authorization: Bearer {accessToken}`
- **签名头**：`x-sign`、`x-timestamp`、`x-nonce`（SM3 签名防篡改）
- **401 处理**：自动使用 refreshToken 静默刷新，刷新期间其他请求排队等待
- **刷新 URL**：`/auth/auth/refresh`

导出方法：`get`、`post`、`put`、`del`

### utils/crypto

- `encryptPassword(data)` — SM2 公钥加密，返回 "04" + 密文（cipherMode=1）
- `generateSign(params)` — SM3 签名，返回 `{ sign, timestamp, nonce }`

### utils/common

- `jump(path, data?, type?, useEventChannel?)` — 页面跳转（自动校验路径有效性）
- `showToast(msgOrOptions)` — 消息提示
- `parseData<T>(dataStr)` — 解析 URL JSON 参数
- `usePageData<T>(callback?)` — 接收页面参数（兼容 EventChannel + URL 兜底）
- `switchUser(role)` — 切换账号

### stores

- **user store**：`userInfo`（UserResponse 联合类型，roleId 区分角色）、`setUserInfo` / `clearUserInfo`
- **student store**：`studentList`、`studentInfo`、`setStudentInfo` / `clearAll`

### types/

全局类型声明（.d.ts），无需 import：

- `http.d.ts` — `ApiResponse<T>`（统一响应包装）、`LoginResponse`
- `user.d.ts` — `UserResponse`（联合类型，roleId=3 家长 / roleId=4 教师）
- `auth.d.ts` — `LoginByPwdRequest`、`RefreshTokenRequest`
- 各业务模块类型文件

### pages/

| 分包 | root | 页面数 | 说明 |
|------|------|--------|------|
| 主包 | - | 4 | 启动页、登录页、隐私政策、用户协议 |
| main | `pages/main` | 37 | 教师端 30+ + 家长端 3 + 首页 |
| class-record | `pages/class-record` | 5 | 家长端课时记录 |

## 跨模块约定

### API 路径

前端 API 路径 = Gateway 前缀 + Controller 类路径 + 方法路径：

```
/auth/auth/login_by_pwd    → Gateway 去掉 /auth → auth-service /auth/login_by_pwd
/biz/student/get_by_id     → Gateway 去掉 /biz  → business-service /student/get_by_id
```

**禁止**使用不带 `/auth/` 或 `/biz/` 前缀的路径。

### 类型命名

- Request：`{Action}{Entity}Request`（如 `InsertStudentRequest`）
- Response：`{Action}{Entity}Response`（如 `StudentListResponse`）
- 列表响应：含 `list` + `total` 字段

### Vue 组件

- `<script setup lang="ts">` + Composition API
- 样式使用 SCSS，全局变量自动注入
- 页面参数用 `usePageData<T>()` 接收
- 路由跳转用 `jump(ROUTES.XXX)` 或 `ROUTES.XXX`

### 文件命名

- 目录/文件：kebab-case（`class-manage/`、`course-record.d.ts`）
- 路由常量：UPPER_SNAKE_CASE（`STUDENT_DETAIL`）

## Adding a New Feature

1. **定义类型**：在 `src/types/` 对应 .d.ts 中定义 Request/Response 类型
2. **添加 API**：在 `src/api/{module}/index.ts` 中添加函数，路径加 `/auth/` 或 `/biz/` 前缀
3. **创建页面**：在 `src/pages/main/teacher/` 或 `parent/` 下创建目录 + `index.vue`
4. **注册页面**：在 `pages.json` 的 subPackages 中注册
5. **添加路由**：在 `src/config/routes.ts` 中添加 ROUTES 常量

## Building & Running

```bash
# 安装依赖
pnpm install

# 开发模式 - 微信小程序
pnpm dev:mp-weixin

# 开发模式 - H5
pnpm dev:h5

# 生产构建
pnpm build:mp-weixin

# 类型检查
pnpm type-check
```

## 注意事项

1. **API 路径必须带 Gateway 前缀**：`/auth/` 或 `/biz/`
2. **Token 格式**：`Authorization: Bearer xxx`
3. **SM2 cipherMode**：前后端统一使用 cipherMode=1（C1C3C2）
4. **类型文件无需 import**：`src/types/*.d.ts` 全局可用
5. **路由跳转用 ROUTES 常量**：禁止硬编码页面路径
6. **分包加载**：主包 ≤ 2MB，业务页面放 subPackages
7. **签名一致性**：前端 `stableStringify()` 模拟后端 Jackson 排序行为

## 相关文档

- [架构设计文档](docs/architecture.md) — 完整的系统架构、核心机制、安全设计、页面路由、编码规范
