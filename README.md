# 📖 学习搭子

一款中文学习打卡与互督 Web 应用，让你和搭子一起坚持学习、相互监督。

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-green?logo=sqlite)

## ✨ 功能一览

### 📋 任务管理
- 创建、编辑、完成、删除待办任务
- 支持标签分类（背单词、刷题、阅读、网课、运动、其他）
- 三级优先级（高 / 中 / 低），逾期任务自动标红
- 截止日期设置，按创建时间 / 优先级 / 截止日期 / 完成状态排序
- 拖拽排序（基于 @dnd-kit）
- 标签筛选栏，可拖拽调整顺序

### 👥 搭子系统
- 搜索用户名发起配对请求
- 接受 / 拒绝配对邀请
- 侧栏查看搭子的任务列表
- 为搭子已完成的任务点赞（搭子获得 +5 积分）
- 催更功能（催促搭子学习，24 小时冷却）

### 🍅 番茄钟
- 三种预设：25/5、50/10、15/3（专注 / 休息分钟）
- 滚轮与数字拨盘自定义时间
- SVG 圆形进度环，工作 / 休息自动切换
- 浏览器标题栏显示倒计时
- 页面刷新后自动恢复计时状态

### 🏆 积分与等级
| 行为 | 积分 |
|------|------|
| 创建任务 | +10 |
| 完成任务 | +20 |
| 收到搭子点赞 | +5 |

等级公式：`Level = floor(sqrt(points / 100)) + 1`

### 📊 学习统计
- 90 天活动热力图（类 GitHub 贡献图）
- 连续打卡天数
- 今日 / 昨日完成数与总完成率
- 侧栏实时显示等级、经验进度条

### 🌗 深色模式
- 一键切换日间 / 夜间主题
- 自动记忆偏好（localStorage）
- 防闪烁：`<head>` 内联脚本在首次绘制前应用主题
- 完整的 CSS 变量体系（35+ 设计令牌）

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 14（App Router） |
| 语言 | TypeScript 5 |
| 数据库 | SQLite via better-sqlite3（WAL 模式） |
| 认证 | JWT（jose）+ bcryptjs，httpOnly Cookie |
| 拖拽 | @dnd-kit/core + @dnd-kit/sortable |
| 样式 | Tailwind CSS + CSS 自定义属性 |
| 字体 | Noto Serif SC（思源宋体） |

## 📁 项目结构

```
study-buddy/src/
├── middleware.ts            # JWT 认证守卫
├── app/
│   ├── layout.tsx          # 根布局（主题、字体）
│   ├── page.tsx            # 首页
│   ├── globals.css         # 全局样式与设计令牌
│   ├── login/              # 登录页
│   ├── register/           # 注册页
│   ├── (app)/              # 需认证的路由组
│   │   ├── layout.tsx      # 侧栏布局
│   │   ├── dashboard/      # 仪表盘（任务管理 + 搭子）
│   │   └── stats/          # 学习统计
│   └── api/                # REST API
│       ├── auth/           #   注册、登录、登出、会话
│       ├── todos/          #   任务 CRUD + 排序 + 点赞
│       ├── pair/           #   配对请求 / 接受 / 解除 / 催更
│       ├── partner/        #   搭子任务查询
│       └── stats/          #   统计汇总 + 活动热力图
├── components/             # React 客户端组件
│   ├── AddTodoForm.tsx     # 新建任务表单
│   ├── EditTodoModal.tsx   # 编辑任务弹窗
│   ├── TodoItem.tsx        # 单个任务项
│   ├── TodoList.tsx        # 任务列表（拖拽排序）
│   ├── Pomodoro.tsx        # 番茄钟
│   ├── TagFilterBar.tsx    # 标签筛选栏
│   ├── Heatmap.tsx         # 活动热力图
│   ├── Navbar.tsx          # 导航栏
│   ├── Sidebar.tsx         # 侧栏（等级、进度）
│   └── ThemeToggle.tsx     # 主题切换
└── lib/
    ├── db.ts               # SQLite 单例，自动建表与迁移
    ├── auth.ts             # JWT 签发 / 验证，密码哈希
    ├── gamification.ts     # 积分与等级计算
    ├── streak.ts           # 连续打卡逻辑
    └── constants.ts        # 标签、优先级常量
```

## 🚀 快速开始

```bash
# 进入项目目录
cd study-buddy

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000) 即可使用。

## 📜 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | ESLint 检查 |

> TypeScript 类型检查在 `next build` 时自动执行，无需单独命令。

## 🔑 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `JWT_SECRET` | 生产环境必填 | JWT 签名密钥，默认为硬编码值（仅限开发） |

生产部署时务必设置 `JWT_SECRET`：

```bash
export JWT_SECRET="你的随机密钥"
```

## 🗄️ 数据库

使用 SQLite（WAL 模式），数据文件为项目根目录下的 `data.db`，首次启动时自动创建。

### 表结构

**users** — 用户表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| username | TEXT | 用户名，唯一 |
| passwordHash | TEXT | bcrypt 密码哈希 |
| points | INTEGER | 积分，默认 0 |
| level | INTEGER | 等级，默认 1 |

**todos** — 任务表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| userId | INTEGER | 外键 → users.id |
| title | TEXT | 任务标题 |
| description | TEXT | 描述 |
| tag | TEXT | 标签 |
| priority | TEXT | 优先级（high/medium/low） |
| dueDate | TEXT | 截止日期 |
| completed | INTEGER | 是否完成（0/1） |
| likes | INTEGER | 收到的点赞数 |
| sortOrder | REAL | 排序权重 |

**pairs** — 配对表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| user1Id | INTEGER | 发起人 |
| user2Id | INTEGER | 被邀请人 |
| status | TEXT | pending / accepted |
| nudgeAt | TEXT | 催更时间戳 |

Schema 变更通过 `src/lib/db.ts` 中的 `ALTER TABLE` 语句自动迁移（try/catch 包裹，幂等执行）。

## 🚢 部署

项目提供两种部署脚本（位于项目根目录，非 `study-buddy/` 内）：

### 方式一：Bash 脚本

```bash
bash deploy.sh
```

- 打包排除 `node_modules`、`.next`、`.git`、`data.db`
- SCP 上传到服务器并构建
- 通过 PM2 重启应用

### 方式二：Python 脚本

```bash
python deploy.py
```

- 支持首次部署时通过密码添加 SSH 密钥
- 自动检测并安装 Node.js、PM2
- 逐文件上传（保活远程数据库）
- 构建并在 PORT=3001 上启动 PM2 进程

> 部署不会覆盖远程 `data.db`，数据库结构变更需手动迁移或在 `db.ts` 中添加 `ALTER TABLE`。

## 📐 设计体系

应用采用水墨 / 印章风格设计：

- **主色调**：朱砂红（`#C41E3A` 亮色 / `#E85545` 暗色）
- **亮色背景**：暖白宣纸色（`#F9F6F0`）
- **暗色背景**：深碳灰（`#1C1A18`）
- **纹理叠加**：3.5% 透明度 SVG 纸张噪点
- **微交互**：墨迹悬停反馈（`ink-hover`，微上浮 + 阴影）
- **印章效果**：完成任务的金色印章（`seal-gold`）
- **字体**：Noto Serif SC 思源宋体

## 📄 许可证

MIT
