# 课时管理 KA 前端架构设计文档

## 一、系统架构概览

### 1.1 项目定位

课时管理 KA 前端 —— 基于 uni-app + Vue 3 + TypeScript 的微信小程序，面向教育培训机构的教师和家长，提供学生管理、班级管理、课程管理、课时扣费、排课等功能。

### 1.2 技术架构层级

```
┌─────────────────────────────────────────────────────────────┐
│                    微信小程序 (uni-app)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages (Vue 3 Composition API + <script setup>)       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │   │
│  │  │ 教师端    │ │ 家长端    │ │ 公共页面  │             │   │
│  │  │ 30+ 页面  │ │ 3 页面   │ │ 4 页面   │             │   │
│  │  └─────┬────┘ └─────┬────┘ └─────┬────┘             │   │
│  │        └─────────────┼────────────┘                   │   │
│  │                      ▼                                │   │
│  │  ┌───────────────────────────────────────────────┐    │   │
│  │  │  Components (通用组件)                          │    │   │
│  │  │  form-group / form-page / search-filter-bar    │    │   │
│  │  │  floating-action-button / page-footer          │    │   │
│  │  └───────────────────┬───────────────────────────┘    │   │
│  │                      ▼                                │   │
│  │  ┌───────────────────────────────────────────────┐    │   │
│  │  │  API 层 (src/api/)                             │    │   │
│  │  │  auth / menu / student / teacher / class / ... │    │   │
│  │  └───────────────────┬───────────────────────────┘    │   │
│  │                      ▼                                │   │
│  │  ┌───────────────────────────────────────────────┐    │   │
│  │  │  Utils 层                                      │    │   │
│  │  │  request (HTTP封装) / crypto (SM2+SM3)         │    │   │
│  │  │  common (跳转/Toast/数据解析) / share (分享)    │    │   │
│  │  └───────────────────┬───────────────────────────┘    │   │
│  │                      ▼                                │   │
│  │  ┌───────────────────────────────────────────────┐    │   │
│  │  │  Stores 层 (Pinia)                             │    │   │
│  │  │  user store / student store                    │    │   │
│  │  └───────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS + JWT + SM3 签名
┌───────────────────────────▼─────────────────────────────────┐
│              Nginx (:9080) → Gateway (:9999)                  │
│              /auth/** → auth-service                          │
│              /biz/**  → business-service                      │
└──────────────────────────────────────────────────────────────┘
```

### 1.3 技术栈明细

| 层级 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | uni-app | - | 跨平台小程序开发框架 |
| 视图层 | Vue 3 | 3.x | Composition API + `<script setup>` |
| 语言 | TypeScript | 5.x | 类型安全（strict, noImplicitAny: false） |
| 构建 | Vite | 5.x | 开发服务器 + 生产构建 |
| 状态管理 | Pinia | 2.x | Composition Store 风格 |
| 加密 | sm-crypto | - | SM2 非对称加密 + SM3 哈希签名 |
| 包管理 | pnpm | - | 依赖管理 |
| 目标平台 | 微信小程序 | mp-weixin | 主要发布平台 |
| 兼容平台 | H5 | - | 开发调试用 |

---

## 二、目录结构

```
src/
├── api/                        # API 接口层（按业务模块分目录）
│   ├── auth/index.ts           # 认证（登录/登出/Token 刷新）→ /auth/auth/xxx
│   ├── menu/index.ts           # 菜单 → /auth/menu/xxx
│   ├── student/index.ts        # 学生 CRUD → /biz/student/xxx
│   ├── teacher/index.ts        # 教师 CRUD → /biz/teacher/xxx
│   ├── class/index.ts          # 班级 → /biz/class/xxx
│   ├── course/index.ts         # 课程 → /biz/course/xxx
│   ├── course-record/index.ts  # 课卡记录 + 扣课 → /biz/course_record/xxx
│   ├── class-schedule/index.ts # 班级课表 → /biz/class_schedule/xxx
│   ├── institution/index.ts    # 机构 → /biz/institution/xxx
│   └── record/index.ts         # 扣课记录 → /biz/record/xxx
├── components/                 # 通用组件
│   ├── floating-action-button/ # 悬浮操作按钮
│   ├── form-group/             # 表单字段组（label + input 组合）
│   ├── form-page/              # 表单页面容器（统一表单布局）
│   ├── page-footer/            # 页面底部操作区
│   └── search-filter-bar/      # 搜索筛选栏
├── config/
│   ├── routes.ts               # 页面路由常量（ROUTES 对象）
│   └── common.ts               # 数据字段映射（DATA_INDEX_MAP 等）
├── pages/                      # 页面
│   ├── index/                  # 启动页（角色选择）
│   ├── login/                  # 登录页
│   ├── privacy/                # 隐私政策
│   ├── user-agreement/         # 用户协议
│   ├── main/                   # 主功能分包
│   │   ├── index/              #   主页（TabBar）
│   │   ├── component/          #   主页子组件
│   │   │   ├── teacher/home/   #     教师首页
│   │   │   ├── teacher/user/   #     教师个人中心
│   │   │   ├── parent/home/    #     家长首页
│   │   │   └── parent/user/    #     家长个人中心
│   │   ├── parent/             #   家长端页面（3 个）
│   │   └── teacher/            #   教师端页面（30+ 个）
│   └── class-record/           # 课时记录分包（家长端，5 个页面）
├── stores/                     # Pinia 状态管理
│   ├── user.ts                 # 用户信息（userInfo, roleId）
│   └── student.ts              # 当前学生信息
├── types/                      # 全局类型声明（.d.ts，无需 import）
│   ├── common.d.ts             # 通用类型（SearchFilterConfig 等）
│   ├── http.d.ts               # HTTP 类型（ApiResponse<T>、LoginResponse）
│   ├── auth.d.ts               # 认证相关类型
│   ├── user.d.ts               # 用户类型（UserResponse 联合类型）
│   ├── student.d.ts            # 学生类型
│   ├── teacher.d.ts            # 教师类型
│   ├── class.d.ts              # 班级类型
│   ├── course.d.ts             # 课程类型
│   ├── course-record.d.ts      # 课卡记录类型
│   ├── class-schedule.d.ts     # 课表类型
│   ├── institution.d.ts        # 机构类型
│   ├── record.d.ts             # 扣课记录类型
│   ├── menu.d.ts               # 菜单类型
│   ├── parent.d.ts             # 家长类型
│   ├── admin.d.ts              # 管理员类型
│   └── env.d.ts                # 环境类型（sm-crypto 模块声明）
├── utils/                      # 工具函数
│   ├── request/index.ts        # HTTP 请求封装（核心）
│   ├── crypto/index.ts         # SM2 加密 + SM3 签名
│   ├── common/index.ts         # 通用工具（跳转/Toast/数据解析/切换用户）
│   └── share/index.ts          # 全局分享配置
├── static/                     # 静态资源
│   ├── icon/                   # SVG 图标（14 个）
│   ├── scss/                   # SCSS 变量与全局样式
│   └── logo.png                # 应用 Logo
├── App.vue                     # 根组件
├── main.ts                     # 入口文件
├── manifest.json               # uni-app 应用配置
├── pages.json                  # 页面路由配置（含分包）
└── uni.scss                    # 全局 SCSS 变量
```

---

## 三、核心机制

### 3.1 请求封装（utils/request）

#### 请求链路

```
页面调用 post<T>(url, data)
  │
  ├─ 1. generateSign(data) → 生成 SM3 签名（x-sign / x-timestamp / x-nonce）
  ├─ 2. 拼接完整 URL：baseUrl + url
  ├─ 3. 附加认证头：Authorization: Bearer {accessToken}
  ├─ 4. uni.request() 发送请求
  │
  ├─ 200 + code=200 → resolve(responseData)
  ├─ 200 + code≠200 → showToast(业务错误) → reject
  ├─ 401 → handle401（自动刷新 Token）
  ├─ 404/500/其他 → showToast → reject
  └─ 网络异常 → showToast → reject
```

#### 环境配置

| 环境 | baseUrl | 切换方式 |
|------|---------|---------|
| development | `http://localhost:9080` | `process.env.NODE_ENV === "development"` |
| production | `https://api.kurimula-airi.top` | `process.env.NODE_ENV === "production"` |
| trial | `https://api.kurimula-airi.top` | `process.env.NODE_ENV === "trial"` |

#### 请求头

| 请求头 | 说明 | 示例 |
|--------|------|------|
| `Content-Type` | 固定 JSON | `application/json` |
| `Authorization` | Bearer Token | `Bearer eyJhbGciOi...` |
| `x-sign` | SM3 签名 | `a1b2c3d4...` |
| `x-timestamp` | 时间戳（毫秒） | `1718000000000` |
| `x-nonce` | 8位随机串 | `x7k9m2p4` |

#### 401 自动刷新机制

```
请求返回 401
  │
  ├─ 是刷新请求本身？→ 清除 Token → 跳转登录页
  │
  ├─ 无 refreshToken？→ 清除 Token → 跳转登录页
  │
  ├─ isRefreshing = false？
  │   ├─ 是 → 设 isRefreshing = true
  │   │       → POST /auth/auth/refresh { token: refreshToken }
  │   │       → 成功：存储新 accessToken → onRefreshed() → retryRequest()
  │   │       → 失败：清除 Token → 跳转登录页
  │   └─ 否 → addRefreshSubscriber(等待队列)
  │           → 刷新成功后自动重试
  └─
```

#### 导出方法

```typescript
import { get, post, put, del } from "@/utils/request";

// url 必须以 /auth 或 /biz 开头
post<LoginResponse>("/auth/auth/login_by_pwd", { username, password });
post<StudentListResponse>("/biz/student/get_by_student_id", { studentId: 1 });
```

### 3.2 加密与签名（utils/crypto）

#### SM2 密码加密

```typescript
import { encryptPassword } from "@/utils/crypto";
const encrypted = encryptPassword(plainPassword); // 返回 "04" + 密文
```

- 公钥：硬编码在前端（04 开头的 Hex 字符串）
- cipherMode = 1（C1C3C2 格式），需与后端一致
- 密文前缀 "04" 表示未压缩格式

#### SM3 请求签名

每次请求自动在 `utils/request` 中调用 `generateSign(data)` 生成签名：

```
签名算法流程：
1. 组装 signObj = { ...params, timestamp, nonce }
2. 过滤 null/undefined/"" 值
3. 按 Key 字典序排序
4. 嵌套对象使用 stableStringify() 递归排序（模拟后端 Jackson SORT_PROPERTIES_ALPHABETICALLY）
5. 拼接为 key1=value1&key2=value2&... 格式
6. 追加盐值 API_SECRET = "SHIROKO_SM3_SALT_2026"
7. SM3 哈希 → 转小写 → x-sign
```

### 3.3 页面跳转与数据传递（utils/common）

#### jump 函数

```typescript
import { jump } from "@/utils/common";
import { ROUTES } from "@/config/routes";

// 基本跳转
jump(ROUTES.STUDENT_DETAIL, { studentId: 123 });

// 重定向
jump(ROUTES.LOGIN, {}, "redirect");

// EventChannel 大对象传参（避免 URL 长度限制）
jump(ROUTES.CLASS_DETAIL, largeData, "navigate", true);
```

**跳转前校验**：自动检查路径是否在 ROUTES 定义中，无效路径会被拦截。

#### 数据接收

```typescript
import { usePageData } from "@/utils/common";

// 兼容 EventChannel 和 URL 传参
const { data } = usePageData<StudentDetailParams>((params) => {
  console.log("接收到参数:", params);
});
```

双通道接收策略：
1. **EventChannel**（优先）：通过 `acceptClassData` 事件接收大对象
2. **URL 兜底**：解析 `?data=` 参数中的 JSON 字符串

### 3.4 状态管理（Pinia）

#### user store

```typescript
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
userStore.userInfo;       // UserResponse | null
userStore.setUserInfo(user);
userStore.clearUserInfo();
```

#### student store

```typescript
import { useStudentStore } from "@/stores/student";

const studentStore = useStudentStore();
studentStore.studentList;     // StudentResponse[]
studentStore.studentInfo;     // StudentResponse | null
studentStore.setStudentInfo(student);
studentStore.setStudentList(list);
studentStore.clearAll();
```

---

## 四、API 路由规则

### 4.1 Gateway 路由映射

前端所有 API 请求经过 `Nginx(:9080) → Gateway(:9999) → 微服务` 链路。

Gateway 路由规则（stripPrefix=1，去掉第一段路径）：

| 前端路径前缀 | Gateway 转发目标 | 到达 Controller 的路径 |
|-------------|-----------------|----------------------|
| `/auth/**` | auth-service | 去掉 `/auth` 后的路径 |
| `/biz/**` | business-service | 去掉 `/biz` 后的路径 |

### 4.2 API 路径命名规则

**auth-service 的接口**（路径前缀 `/auth`）：

| Controller | 类级别路径 | 前端路径前缀 | 示例 |
|-----------|----------|------------|------|
| AuthController | `@RequestMapping("/auth")` | `/auth/auth/` | `/auth/auth/login_by_pwd` |
| MenuController | `@RequestMapping("/menu")` | `/auth/menu/` | `/auth/menu/get_menu_by_role` |
| PermissionRecordController | `@RequestMapping("/permission_record")` | `/auth/permission_record/` | `/auth/permission_record/bind` |

**business-service 的接口**（路径前缀 `/biz`）：

| Controller | 类级别路径 | 前端路径前缀 | 示例 |
|-----------|----------|------------|------|
| StudentController | `@RequestMapping("/student")` | `/biz/student/` | `/biz/student/get_by_student_id` |
| TeacherController | `@RequestMapping("/teacher")` | `/biz/teacher/` | `/biz/teacher/update_by_id` |
| ClassController | `@RequestMapping("/class")` | `/biz/class/` | `/biz/class/add_student_to_class` |
| CourseController | `@RequestMapping("/course")` | `/biz/course/` | `/biz/course/get_by_student_id` |
| CourseRecordController | `@RequestMapping("/course_record")` | `/biz/course_record/` | `/biz/course_record/deduct_by_student_id` |
| ClassScheduleController | `@RequestMapping("/class_schedule")` | `/biz/class_schedule/` | `/biz/class_schedule/get_by_class_id` |
| InstitutionController | `@RequestMapping("/institution")` | `/biz/institution/` | `/biz/institution/get_by_id` |
| RecordController | `@RequestMapping("/record")` | `/biz/record/` | `/biz/record/new_get` |

### 4.3 路径推导公式

```
前端路径 = Gateway前缀 + Controller类路径 + 方法路径

示例：
AuthController.loginByPwd()
  → @RequestMapping("/auth") + @PostMapping("/login_by_pwd")
  → 前端路径 = /auth + /auth + /login_by_pwd = /auth/auth/login_by_pwd

StudentController.getByStudentId()
  → @RequestMapping("/student") + @PostMapping("/get_by_student_id")
  → 前端路径 = /biz + /student + /get_by_student_id = /biz/student/get_by_student_id
```

---

## 五、类型系统

### 5.1 全局类型声明

所有业务类型定义在 `src/types/*.d.ts` 中，通过 tsconfig.json 的 `include` 自动包含，**无需 import 即可在全局使用**。

### 5.2 核心类型

| 类型文件 | 关键类型 | 说明 |
|---------|---------|------|
| `http.d.ts` | `ApiResponse<T>` | 统一响应包装（code/message/data） |
| `http.d.ts` | `LoginResponse` | 登录响应（accessToken/refreshToken/userInfo） |
| `user.d.ts` | `UserResponse` | 用户信息（联合类型，roleId 区分教师/家长） |
| `auth.d.ts` | `LoginByPwdRequest` | 密码登录请求 |
| `auth.d.ts` | `LoginByTokenRequest` | Token 登录请求 |
| `auth.d.ts` | `RefreshTokenRequest` | Token 刷新请求 |
| `common.d.ts` | `SearchFilterConfig` | 搜索筛选配置 |
| `common.d.ts` | `ToSelectStudentPageParams` | 选择学生页面参数 |

### 5.3 类型命名约定

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| 请求类型 | `{Action}{Entity}Request` | `InsertStudentRequest`、`UpdateClassRequest` |
| 响应类型 | `{Action}{Entity}Response` | `StudentListResponse`、`LoginResponse` |
| 列表响应 | `{Entity}ListResponse` | `StudentListResponse`（含 list + total） |
| 视图对象 | `{Entity}VO` | `StudentVO`、`ClassVO` |

### 5.4 角色类型判断

```typescript
// UserResponse 是联合类型，根据 roleId 区分
type UserResponse = TeacherIdentity | ParentIdentity;

// roleId: 3 → 家长（ParentIdentity）
// roleId: 4 → 教师（TeacherIdentity）
```

---

## 六、页面路由

### 6.1 分包结构

| 分包 | root | 页面数 | 说明 |
|------|------|--------|------|
| 主包 | - | 4 | 启动页、登录页、隐私政策、用户协议 |
| main | `pages/main` | 37 | 主功能页（教师端 30+ + 家长端 3 + 首页） |
| class-record | `pages/class-record` | 5 | 课时记录（家长端查看课时） |

### 6.2 路由常量

所有页面路径定义在 `src/config/routes.ts` 的 `ROUTES` 对象中：

```typescript
import { ROUTES } from "@/config/routes";

// 使用路由常量跳转（禁止硬编码路径）
uni.navigateTo({ url: ROUTES.STUDENT_DETAIL });
jump(ROUTES.CLASS_MANAGE);
```

### 6.3 角色路由

| roleId | 角色 | 首页组件 | 页面目录 |
|--------|------|---------|---------|
| 3 | 家长 | `parent/home` | `pages/main/parent/` |
| 4 | 教师 | `teacher/home` | `pages/main/teacher/` |

### 6.4 页面列表

#### 教师端页面（pages/main/teacher/）

| 页面目录 | 标题 | 功能 |
|---------|------|------|
| manage-student | 学员管理 | 学员列表 + 搜索 |
| official-student | 正式学员 | 正式学员列表 |
| student-detail | 学员详情 | 学员详细信息 |
| add-student | 添加正式学员 | 新增学员表单 |
| edit-student-info | 编辑学生信息 | 修改学员信息 |
| class-manage | 班级管理 | 班级列表 |
| class-detail | 班级详情 | 班级信息 + 学生列表 |
| add-class | 添加班级 | 新增班级表单 |
| edit-class-info | 编辑班级信息 | 修改班级信息 |
| course-manage | 课程管理 | 课程列表 |
| course-detail | 课程详情 | 课程详细信息 |
| add-course | 添加课程 | 新增课程表单 |
| edit-course-info | 编辑课程信息 | 修改课程信息 |
| deduct-fee | 上课扣费 | 按学生/课程/班级扣课 |
| fast-deduct | 快速扣课 | 快速扣课操作 |
| manage-course-record | 学生课程管理 | 课卡记录列表 |
| add-course-record | 添加学生课程 | 新增购课记录 |
| edit-course-record-info | 编辑学生课程信息 | 修改购课记录 |
| select-course-record | 选择学生课程 | 选择课卡记录 |
| manage-record | 扣课记录 | 课时变更记录 |
| record-detail | 扣课记录详情 | 变更明细 |
| school-schedule | 学校课表 | 机构排课总览 |
| my-schedule | 我的课表 | 教师个人课表 |
| class-schedule-detail | 班级课表详情 | 班级排课详情 |
| adjust-class-schedule | 调整排课 | 修改排课信息 |
| edit-class-schedule-info | 编辑班级课表 | 修改课表 |
| manage-teacher | 教师管理 | 教师列表 |
| teacher-detail | 教师详情 | 教师详细信息 |
| add-teacher | 添加教师 | 新增教师表单 |
| edit-teacher-info | 编辑教师信息 | 修改教师信息 |
| institution-detail | 校区详情 | 机构信息 |
| edit-institution-info | 编辑校区信息 | 修改机构信息 |
| leave-manage | 请假管理 | 请假记录 |
| user-profile | 用户信息 | 个人信息 |
| select-student | 选择学生 | 选择器页面 |
| select-course | 选择课程 | 选择器页面 |
| select-class | 选择班级 | 选择器页面 |
| select-teacher | 选择老师 | 选择器页面 |

#### 家长端页面

| 页面目录 | 标题 | 功能 |
|---------|------|------|
| pages/main/parent/my-course | 我的课程 | 孩子课程列表 |
| pages/main/parent/edit-student-info | 编辑学员信息 | 修改孩子信息 |
| pages/class-record/index | 课时管理 | 课时余额和扣课记录 |
| pages/class-record/detail | 课程详情 | 课时详情 |
| pages/class-record/edit | 编辑信息 | 修改课时信息 |
| pages/class-record/adjust | 调整课时 | 课时调整 |
| pages/class-record/add-course | 添加课程 | 新增课时 |

---

## 七、组件体系

### 7.1 通用组件

| 组件 | 目录 | 功能 | 使用场景 |
|------|------|------|---------|
| form-group | `components/form-group/` | 表单字段组（label + input） | 所有表单页面 |
| form-page | `components/form-page/` | 表单页面容器（统一布局） | 新增/编辑页面 |
| search-filter-bar | `components/search-filter-bar/` | 搜索筛选栏 | 列表页面 |
| floating-action-button | `components/floating-action-button/` | 悬浮操作按钮 | 管理列表页 |
| page-footer | `components/page-footer/` | 页面底部操作区 | 表单提交页 |

### 7.2 组件自动导入

uni-app easycom 机制自动导入 `uni-xxx` 组件：

```json
{
  "easycom": {
    "custom": {
      "^uni-(.*)": "@dcloudio/uni-ui/lib/uni-$1/uni-$1.vue"
    }
  }
}
```

使用时无需 import：

```vue
<uni-icons type="search" size="18" />
```

---

## 八、安全设计

### 8.1 认证机制

```
登录流程：
1. 前端发送登录请求（密码经 SM2 加密）
2. 后端返回 accessToken + refreshToken + userInfo
3. 前端存储到 uni.setStorageSync
4. 后续请求自动附加 Authorization: Bearer {accessToken}

Token 刷新：
1. 请求返回 401
2. 前端自动使用 refreshToken 调用 /auth/auth/refresh
3. 刷新期间其他请求排队等待
4. 刷新成功后依次重试排队请求
5. 刷新失败 → 清除 Token → 跳转登录页
```

### 8.2 请求签名

每个请求自动附加 SM3 签名头，防止参数篡改和重放攻击：

| 请求头 | 说明 | 防护目标 |
|--------|------|---------|
| `x-sign` | SM3 哈希签名 | 参数篡改检测 |
| `x-timestamp` | 请求时间戳 | 重放攻击防护（后端 60s 有效期） |
| `x-nonce` | 8位随机串 | 请求唯一性 |

### 8.3 数据加密

| 算法 | 用途 | 实现 |
|------|------|------|
| SM2 | 密码加密传输 | `encryptPassword()` → "04" + 密文 |
| SM3 | 请求签名 | `generateSign()` → { sign, timestamp, nonce } |

---

## 九、构建与部署

### 9.1 开发命令

```bash
pnpm install              # 安装依赖
pnpm dev:mp-weixin        # 开发模式 - 微信小程序
pnpm dev:h5               # 开发模式 - H5
pnpm build:mp-weixin      # 生产构建 - 微信小程序
pnpm type-check           # TypeScript 类型检查
```

### 9.2 构建配置

**vite.config.ts**：

```typescript
export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),  // @ → src 目录
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/static/scss" as *;`,  // 全局 SCSS 变量注入
      },
    },
  },
});
```

### 9.3 TypeScript 配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": false,  // 允许隐式 any
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*.d.ts", "src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

---

## 十、编码规范

### 10.1 文件命名

| 类型 | 命名规则 | 示例 |
|------|---------|------|
| 页面目录 | kebab-case | `class-manage/`、`fast-deduct/` |
| API 目录 | kebab-case | `course-record/` |
| 类型文件 | kebab-case | `course-record.d.ts` |
| 组件目录 | kebab-case | `search-filter-bar/` |
| 路由常量 | UPPER_SNAKE_CASE | `STUDENT_DETAIL` |

### 10.2 Vue 组件风格

```vue
<script setup lang="ts">
// 1. Composition API + <script setup>
import { ref, computed, watch } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { usePageData, jump, showToast } from "@/utils/common";
import { ROUTES } from "@/config/routes";

// 2. 使用 usePageData 接收页面参数
const { data } = usePageData<PageParams>();

// 3. 响应式数据
const loading = ref(false);
const list = ref<ItemType[]>([]);

// 4. 生命周期
onLoad(() => { /* 初始化 */ });
onShow(() => { /* 每次显示 */ });
</script>

<style lang="scss" scoped>
/* 使用 SCSS，全局变量自动注入 */
.container {
  padding: 24rpx;
}
</style>
```

### 10.3 API 函数风格

```typescript
// src/api/student/index.ts
import { post } from "@/utils/request";

export const getStudentById = (studentId: number) =>
  post<StudentDetailResponse>("/biz/student/get_by_student_id", { studentId });

export const insertStudent = (data: InsertStudentRequest) =>
  post<InsertStudentResponse>("/biz/student/insert", data);
```

**关键约定**：
- 路径必须以 `/auth/` 或 `/biz/` 开头
- 函数名使用 camelCase
- 导出箭头函数，不使用 `export function`
- 返回类型使用 `post<T>()` 泛型

### 10.4 条件编译

微信小程序特有代码使用 uni-app 条件编译：

```typescript
// #ifdef MP-WEIXIN
platform = "WEIXIN";
// #endif

// #ifdef H5
platform = "H5";
// #endif
```

### 10.5 路由跳转规范

```typescript
// ✅ 正确：使用 ROUTES 常量
jump(ROUTES.STUDENT_DETAIL, { studentId: 123 });

// ❌ 错误：硬编码路径
uni.navigateTo({ url: "/pages/main/teacher/student-detail/index" });
```

---

## 十一、新增功能指南

### 新增业务页面

1. 在 `src/pages/main/teacher/` 或 `parent/` 下创建目录
2. 创建 `index.vue` + `index.scss`（可选 `index.d.ts` 声明页面参数类型）
3. 在 `pages.json` 的 `subPackages → pages/main/pages` 中注册页面
4. 在 `src/config/routes.ts` 中添加路由常量
5. 如需 API 调用，在 `src/api/` 和 `src/types/` 中添加对应文件

### 新增 API 接口

1. 在 `src/types/` 对应 .d.ts 中定义 Request/Response 类型
2. 在 `src/api/{module}/index.ts` 中添加函数
3. 路径加 `/auth/` 或 `/biz/` 前缀
4. export 函数供页面使用

### 新增通用组件

1. 在 `src/components/` 下创建目录（kebab-case）
2. 创建 `index.vue` + `index.scss`（可选 `types.d.ts`）
3. 在页面中通过 import 使用（非 easycom 组件需手动导入）

---

## 十二、注意事项

1. **API 路径必须带 Gateway 前缀**：`/auth/` 或 `/biz/`，否则 Gateway 无法路由
2. **Token 格式**：`Authorization: Bearer xxx`，不是 `token: xxx`
3. **SM2 cipherMode**：前端使用 cipherMode=1（C1C3C2），需与后端一致
4. **类型文件无需 import**：`src/types/*.d.ts` 中的类型全局可用
5. **路由跳转用 ROUTES 常量**：不要硬编码页面路径
6. **SCSS 全局变量**：通过 vite.config.ts additionalData 自动注入，组件中直接使用
7. **分包加载**：主包控制在 2MB 以内，业务页面放 subPackages
8. **EventChannel 传参**：大对象使用 `jump(path, data, "navigate", true)` 传递，避免 URL 长度限制
9. **签名算法一致性**：前端 `stableStringify()` 必须模拟后端 Jackson 的 `SORT_PROPERTIES_ALPHABETICALLY + NON_NULL` 行为
10. **Token 存储**：使用 `uni.setStorageSync` / `uni.getStorageSync`，key 为 `accessToken` / `refreshToken`
