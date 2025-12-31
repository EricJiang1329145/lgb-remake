# 龙高北重开模拟器 - 高级内容编辑器服务器

## 功能说明

这是一个用于管理游戏配置文件的 Python Flask 服务器，提供以下功能：

- 配置文件的读取和保存
- RESTful API 接口
- 彩色日志输出
- 文件日志记录

## 安装依赖

```bash
pip3 install flask flask-cors
```

## 启动服务器

```bash
python3 editor-server.py
```

服务器将在 `http://127.0.0.1:5000` 上运行。

## API 端点

### 获取配置文件
```
GET /api/config
```

### 保存配置文件
```
POST /api/config
Content-Type: application/json

{
  "quotes": [...],
  "events": [...],
  ...
}
```

## 目录结构

```
.
├── editor-server.py          # 服务器主程序
├── content-config.json       # 配置文件
└── logs/                     # 日志目录（自动创建）
    └── editor-server-YYYYMMDD.log
```

## 日志说明

### 控制台日志（带颜色）

- 🟢 **INFO** (绿色) - 正常操作日志
- 🟡 **WARNING** (黄色) - 警告信息
- 🔴 **ERROR** (红色) - 错误信息

### 文件日志

日志文件按日期命名，格式为 `editor-server-YYYYMMDD.log`，包含所有操作记录，不带颜色代码。

## 注意事项

1. 服务器运行时会自动创建 `logs/` 目录
2. 日志文件按日期分割，便于管理和查看
3. 按 `Ctrl+C` 停止服务器

## 故障排除

### 端口被占用

如果端口 5000 被占用，可以：

1. 找到并停止占用端口的进程：
   ```bash
   lsof -ti:5000 | xargs kill -9
   ```

2. 或者修改 `editor-server.py` 中的端口号

### 依赖安装失败

如果安装依赖时遇到问题，可以尝试：

```bash
pip3 install --upgrade pip
pip3 install flask flask-cors
```

### 日志文件权限问题

确保当前用户对 `logs/` 目录有读写权限。
