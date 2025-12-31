#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
龙高北重开模拟器 - 高级内容编辑器服务器
提供配置文件的读写 API
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime
import logging
import sys

app = Flask(__name__)
CORS(app)

# ANSI 颜色代码
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

# 自定义日志格式化器，支持颜色输出
class ColoredFormatter(logging.Formatter):
    """带颜色的日志格式化器"""
    
    def __init__(self, fmt=None, datefmt=None, style='%'):
        super().__init__(fmt, datefmt, style)
        
        # 定义不同日志级别的颜色
        self.level_colors = {
            logging.DEBUG: Colors.OKCYAN,
            logging.INFO: Colors.OKGREEN,
            logging.WARNING: Colors.WARNING,
            logging.ERROR: Colors.FAIL,
            logging.CRITICAL: Colors.FAIL + Colors.BOLD,
        }
    
    def format(self, record):
        # 获取对应日志级别的颜色
        color = self.level_colors.get(record.levelno, '')
        
        # 格式化消息
        message = super().format(record)
        
        # 应用颜色
        if color:
            return f"{color}{message}{Colors.ENDC}"
        return message

# 配置日志
log_format = '%(asctime)s | %(levelname)-8s | %(message)s'
date_format = '%Y-%m-%d %H:%M:%S'

# 创建日志记录器
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# 控制台处理器（带颜色）
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
console_formatter = ColoredFormatter(log_format, date_format)
console_handler.setFormatter(console_formatter)
logger.addHandler(console_handler)

# 文件处理器（不带颜色）
log_dir = 'logs'
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

log_file = os.path.join(log_dir, f'editor-server-{datetime.now().strftime("%Y%m%d")}.log')
file_handler = logging.FileHandler(log_file, encoding='utf-8')
file_handler.setLevel(logging.INFO)
file_formatter = logging.Formatter(log_format, date_format)
file_handler.setFormatter(file_formatter)
logger.addHandler(file_handler)

logger.info(f"日志文件: {log_file}")

# 配置文件路径
CONFIG_FILE = 'content-config.json'



@app.route('/')
def index():
    """返回编辑器页面"""
    logger.info("→ 访问编辑器页面")
    return send_from_directory('.', 'editor.html')


@app.route('/api/config', methods=['GET'])
def get_config():
    """获取配置文件内容"""
    try:
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                config = json.load(f)
            logger.info(f"✓ 获取配置文件: {CONFIG_FILE}")
            return jsonify({'success': True, 'data': config})
        else:
            logger.warning(f"✗ 配置文件不存在: {CONFIG_FILE}")
            return jsonify({'success': False, 'error': '配置文件不存在'}), 404
    except Exception as e:
        logger.error(f"✗ 获取配置文件失败: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/config', methods=['POST'])
def save_config():
    """保存配置文件"""
    try:
        config_data = request.json
        
        # 保存配置文件
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config_data, f, ensure_ascii=False, indent=2)
        
        size_kb = os.path.getsize(CONFIG_FILE) / 1024
        logger.info(f"✓ 保存配置文件: {CONFIG_FILE} ({size_kb:.2f} KB)")
        
        return jsonify({'success': True, 'message': '配置已保存'})
    except Exception as e:
        logger.error(f"✗ 保存配置文件失败: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500



if __name__ == '__main__':
    print()
    print(Colors.HEADER + "╔" + "═" * 58 + "╗" + Colors.ENDC)
    print(Colors.HEADER + "║" + " " * 12 + "龙高北重开模拟器" + " " * 12 + "║" + Colors.ENDC)
    print(Colors.HEADER + "║" + " " * 8 + "高级内容编辑器服务器" + " " * 9 + "║" + Colors.ENDC)
    print(Colors.HEADER + "╚" + "═" * 58 + "╝" + Colors.ENDC)
    print()
    print(Colors.OKBLUE + "📋 服务器配置:" + Colors.ENDC)
    print(f"   • 服务器地址: {Colors.OKCYAN}http://127.0.0.1:5000{Colors.ENDC}")
    print(f"   • 配置文件:   {Colors.OKCYAN}{CONFIG_FILE}{Colors.ENDC}")
    print(f"   • 日志目录:   {Colors.OKCYAN}{log_dir}/{Colors.ENDC}")
    print()
    print(Colors.OKBLUE + "🚀 可用 API 端点:" + Colors.ENDC)
    print(f"   • {Colors.OKGREEN}GET{Colors.ENDC}  /              - 访问编辑器页面")
    print(f"   • {Colors.OKGREEN}GET{Colors.ENDC}  /api/config    - 获取配置文件")
    print(f"   • {Colors.WARNING}POST{Colors.ENDC} /api/config    - 保存配置文件")
    print()
    print(Colors.WARNING + "💡 提示: 按 Ctrl+C 停止服务器" + Colors.ENDC)
    print()
    print(Colors.OKCYAN + "─" * 60 + Colors.ENDC)
    print()
    
    app.run(host='127.0.0.1', port=5000, debug=True)
