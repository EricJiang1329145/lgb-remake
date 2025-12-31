/**
 * 龙高北重开模拟器 - 内容加载器
 * 用于从 content-config.json 加载文本内容
 */

const ContentLoader = {
  config: null,
  loaded: false,

  async load() {
    if (this.loaded) return this.config;
    
    try {
      const response = await fetch('content-config.json');
      this.config = await response.json();
      this.loaded = true;
      console.log('内容配置加载成功');
      return this.config;
    } catch (e) {
      console.warn('内容配置加载失败，使用内置默认文本');
      this.config = this.getFallbackConfig();
      this.loaded = true;
      return this.config;
    }
  },

  getFallbackConfig() {
    return {
      game: {
        title: "龙高北重开模拟器",
        subtitle: "初中三年，重新来过"
      },
      ui: {
        startScreen: {
          newGame: "新游戏",
          continue: "继续游戏",
          changelog: "更新日志",
          backToMenu: "返回主菜单"
        },
        actions: {
          study: {
            name: "📚 认真学习",
            description: "选择一个科目进行学习，提升该科目成绩"
          },
          rest: {
            name: "😴 休息一下",
            description: "恢复精力和体力"
          },
          askTeacher: {
            name: "📖 问老师问题",
            description: "去办公室向老师请教问题"
          },
          club: {
            name: "🎨 社团活动",
            description: "参加社团活动"
          },
          exercise: {
            name: "🏃 锻炼身体",
            description: "进行体育锻炼"
          },
          social: {
            name: "👥 社交活动",
            description: "和同学交流，维护人际关系"
          }
        }
      },
      subjects: {},
      events: {},
      keyEvents: {},
      clubs: {},
      achievements: {},
      endings: {},
      messages: {
        welcome: "欢迎来到龙高北重开模拟器！",
        firstDay: "这是你初中生活的第一天...",
        saved: "游戏已保存"
      }
    };
  },

  // 获取游戏标题
  getGameTitle() {
    return this.config?.game?.title || "龙高北重开模拟器";
  },

  getGameSubtitle() {
    return this.config?.game?.subtitle || "初中三年，重新来过";
  },

  // 获取 UI 文本
  getUIText(path, defaultValue = '') {
    const keys = path.split('.');
    let result = this.config;
    for (const key of keys) {
      result = result?.[key];
      if (result === undefined) return defaultValue;
    }
    return result || defaultValue;
  },

  // 获取科目名称
  getSubjectName(subjectKey) {
    return this.config?.subjects?.[subjectKey]?.name || 
           SUBJECTS?.[subjectKey]?.name || 
           StringUtils.camelToChinese(subjectKey);
  },

  // 获取科目提示
  getSubjectTooltip(subjectKey) {
    return this.config?.subjects?.[subjectKey]?.tooltip || 
           SUBJECTS?.[subjectKey]?.description || '';
  },

  // 获取事件文本
  getEventText(eventKey, field = 'title') {
    return this.config?.events?.[eventKey]?.[field] || '';
  },

  // 获取关键事件文本
  getKeyEventText(eventKey, field = 'title') {
    return this.config?.keyEvents?.[eventKey]?.[field] || '';
  },

  // 获取社团列表
  getClubs(categoryKey) {
    return this.config?.clubs?.[categoryKey]?.clubs || [];
  },

  // 获取所有社团分类
  getAllClubCategories() {
    return this.config?.clubs || {};
  },

  // 获取成就文本
  getAchievementText(achievementKey, field = 'name') {
    return this.config?.achievements?.[achievementKey]?.[field] || '';
  },

  // 获取结局文本
  getEndingText(endingKey, field = 'name') {
    return this.config?.endings?.[endingKey]?.[field] || '';
  },

  // 获取消息
  getMessage(messageKey) {
    return this.config?.messages?.[messageKey] || '';
  },

  // 获取更新日志
  getChangelog() {
    return this.config?.changelog || [];
  },

  // 格式化文本（支持变量替换）
  format(text, variables = {}) {
    if (!text) return '';
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    return result;
  }
};

// 便捷函数
function getContent(path, defaultValue = '') {
  return ContentLoader.getUIText(path, defaultValue);
}

function getEventText(eventKey, field = 'title') {
  return ContentLoader.getEventText(eventKey, field);
}

function getKeyEventText(eventKey, field = 'title') {
  return ContentLoader.getKeyEventText(eventKey, field);
}

function formatText(text, variables = {}) {
  return ContentLoader.format(text, variables);
}

// 导出
window.ContentLoader = ContentLoader;
window.getContent = getContent;
window.getEventText = getEventText;
window.getKeyEventText = getKeyEventText;
window.formatText = formatText;
