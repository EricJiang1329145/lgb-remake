# 龙高北重开模拟器 - 技术文档

## 一、项目概述

本项目采用纯原生前端技术栈（HTML + CSS + Vanilla JS），以 Vibe Coding 方式进行开发。技术选型遵循以下原则：

- **简单优先**：不引入任何构建工具和框架依赖
- **快速迭代**：修改代码后刷新浏览器即可生效
- **易于维护**：文件结构清晰，功能模块化
- **离线运行**：完全在浏览器端运行，无需后端服务

## 二、文件结构

```
lgb-remake/
├── index.html      # 入口文件，包含页面 DOM 结构
├── style.css       # 全局样式，响应式设计
├── game.js         # 游戏核心逻辑，主控制器
├── events.js       # 随机事件和关键事件的配置数据
├── data.js         # 静态数据定义（科目、属性常量等）
├── utils.js        # 工具函数（日期处理、随机数等）
└── README.md       # 项目说明
```

### 文件职责说明

| 文件 | 职责 |
|------|------|
| index.html | 定义所有 UI 面板的 DOM 结构，通过 CSS 控制显示/隐藏 |
| style.css | 全局样式、响应式布局、动画效果 |
| game.js | 游戏主循环、状态管理、事件触发、界面更新 |
| events.js | 所有事件的配置数据，包含触发条件、选项、效果 |
| data.js | 静态配置数据，如科目满分、难度系数等 |
| utils.js | 可复用的工具函数，减少重复代码 |

## 三、核心数据结构

### 3.1 玩家属性（PlayerStats）

```javascript
// 学业属性
academic: {
  chinese: number;      // 语文 (0-120)
  math: number;         // 数学 (0-100)
  english: number;      // 英语 (0-100)
  politics: number;     // 政治 (0-50)
  history: number;      // 历史 (0-70)
  physics: number;      // 物理 (0-70, 初二开始)
  chemistry: number;    // 化学 (0-70, 初三开始)
  biology: number;      // 生物 (0-100, 初一初二)
  geography: number;    // 地理 (0-100, 初一初二)
  sports: number;       // 体育 (0-50)
}

// 能力属性
abilities: {
  memory: number;       // 记忆力 (0-100)
  comprehension: number; // 理解力 (0-100)
  focus: number;        // 专注力 (0-100)
  examMindset: number;  // 考试心态 (0-100)
}

// 状态属性
status: {
  physical: number;     // 体力 (0-100)
  energy: number;       // 精力 (0-100)
  stress: number;       // 压力值 (0-100)
}

// 特殊属性
special: {
  lastStand?: number;   // 孤注一掷
  survival?: number;    // 绝地求生
  [key: string]: number | undefined;
}
```

### 3.2 时间状态（GameTime）

```javascript
interface GameTime {
  year: number;          // 学年 (如 2024)
  semester: number;      // 学期 (1=上学期, 2=下学期)
  week: number;          // 周数
  day: number;           // 日期 (1-31)
  phase: GamePhase;      // 当前阶段
}
```

### 3.3 游戏阶段（GamePhase）

```javascript
enum GamePhase {
  BEFORE_SCHOOL,     // 开学前
  FIRST_WEEK,        // 第一周
  REGULAR_CLASSES,   // 常规上课
  MONTHLY_EXAM,      // 月考
  MIDTERM,           // 期中
  FINAL,             // 期末
  SPORTS_MEETING,    // 运动会
  ARTS_FESTIVAL,     // 艺术节
  BIOLOGY_GEOGRAPHY_EXAM, // 生地会考
  MIDDLE_EXAM,       // 中考
  GRADUATION         // 毕业典礼
}
```

## 四、系统架构

### 4.1 主控制器（Game Controller）

游戏主控制器位于 `game.js`，负责：

- 初始化游戏状态
- 管理游戏主循环
- 处理用户交互
- 协调各子系统
- 保存/加载游戏进度

### 4.2 事件系统（Event System）

事件系统基于配置驱动，所有事件定义在 `events.js` 中：

```javascript
const events = {
  // 随机事件
  random: [
    {
      id: 'event_id',
      title: '事件标题',
      description: '事件描述文本',
      conditions: (gameState) => boolean,  // 触发条件
      probability: 0.1,                    // 触发概率
      options: [
        {
          text: '选项文本',
          effect: (gameState) => { /* 效果逻辑 */ }
        }
      ]
    }
  ],
  
  // 关键事件（时间触发）
  keyEvents: {
    '2024-09-01': { /* 开学事件 */ },
    '2024-10-15': { /* 月考事件 */ },
    // ...
  }
};
```

### 4.3 响应式布局

游戏支持横屏和竖屏两种布局，通过 CSS 媒体查询实现：

```css
/* 默认：横屏布局 */
.container {
  display: flex;
  flex-direction: row;
}

/* 移动端：竖屏布局 */
@media screen and (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}
```

## 五、模块交互

```
┌─────────────────────────────────────────────────┐
│                   Game Controller                │
│                  (game.js)                       │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Time     │  │ Player   │  │ Event        │  │
│  │ System   │  │ System   │  │ System       │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ Academic │  │ Social   │  │ UI           │  │
│  │ System   │  │ System   │  │ Controller   │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────┘
```

## 六、开发规范

### 6.1 命名规范

- 变量和函数：使用小驼峰命名法（camelCase）
- 常量：使用全大写加下划线（UPPER_SNAKE_CASE）
- CSS 类名：使用中划线（kebab-case）
- 文件名：使用小写加中划线（kebab-case）

### 6.2 代码风格

- 使用 ES6+ 语法
- 优先使用 `const`，必要时使用 `let`，禁止使用 `var`
- 使用模板字符串处理字符串拼接
- 使用箭头函数简化回调

### 6.3 注释规范

- 复杂逻辑必须添加注释
- 事件配置必须有中文说明
- 公共函数必须有 JSDoc 注释

## 七、测试方法

### 7.1 本地测试

```bash
# 使用 Python 启动简单服务器
python3 -m http.server 8888

# 或使用 Node.js
node server.js
```

然后在浏览器访问 `http://localhost:8888`

### 7.2 快速测试

直接用浏览器打开 `index.html` 文件即可（部分功能可能受限）

## 八、开发目标

### 当前阶段：核心框架搭建

- [ ] 玩家状态系统基础实现
- [ ] 时间线系统基础实现
- [ ] 基础 UI 框架搭建
- [ ] 事件系统框架搭建

### 下一阶段：核心玩法

- [ ] 学业系统完整实现
- [ ] 考试系统实现
- [ ] 随机事件系统完善
- [ ] 关键事件实现

### 后续阶段：内容丰富

- [ ] 社团活动系统
- [ ] 运动会系统
- [ ] 艺术节系统
- [ ] 人际关系系统
- [ ] 心理事件系统
- [ ] 多结局系统

## 九、参考资源

- 参考项目：`backup/` 目录下的 OI 重开模拟器
- 设计理念：模拟经营 + 文字剧情
- 开发方式：Vibe Coding（快速迭代，随时修改）

## 十、常见问题

### Q: 如何添加新事件？
A: 在 `events.js` 中按照既定格式添加事件配置即可。

### Q: 如何修改属性上限？
A: 在 `data.js` 中修改对应的常量定义。

### Q: 如何调整难度？
A: 在 `data.js` 中调整难度系数，或在游戏设置中提供难度选择。

## 十一、许可证

MIT License
