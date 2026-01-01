/**
 * 龙高北重开模拟器 - 工具函数
 * 包含随机数、日期处理、字符串处理等通用工具函数
 */

// 随机数工具
const RandomUtils = {
  // 生成指定范围内的随机整数 [min, max]
  randomInt: (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  
  // 生成指定范围内的随机浮点数 [min, max]
  randomFloat: (min, max, decimals = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  },
  
  // 从数组中随机选择一个元素
  randomChoice: (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  },
  
  // 按权重随机选择
  weightedRandom: (items) => {
    if (!items || items.length === 0) return null;
    
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
    let random = Math.random() * totalWeight;
    
    for (const item of items) {
      random -= item.weight || 1;
      if (random <= 0) return item;
    }
    
    return items[items.length - 1];
  },
  
  // 生成正态分布随机数（Box-Muller变换）
  normalRandom: (mean = 0, stdDev = 1) => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z * stdDev + mean;
  },
  
  // 按概率触发事件
  chance: (probability) => {
    return Math.random() < probability;
  },
  
  // 洗牌算法（Fisher-Yates）
  shuffle: (arr) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },
  
  // 生成随机ID
  generateId: (prefix = 'id') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

// 日期工具
const DateUtils = {
  // 创建日期对象（支持年份偏移）
  createDate: (year, month, day) => {
    return new Date(year, month - 1, day);
  },
  
  // 格式化日期为字符串
  formatDate: (date, format = 'yyyy年M月d日') => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 先替换长占位符，再替换短占位符，避免冲突
    return format
      .replace('yyyy', year)
      .replace('yy', year.toString().slice(-2))
      .replace('MM', month.toString().padStart(2, '0'))
      .replace('M', month)
      .replace('dd', day.toString().padStart(2, '0'))
      .replace('d', day);
  },
  
  // 获取日期是当年的第几周
  getWeekOfYear: (date) => {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date - start;
    const oneWeek = 604800000;
    return Math.ceil(diff / oneWeek);
  },
  
  // 获取日期是当月的第几周
  getWeekOfMonth: (date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const diff = date - start;
    const oneWeek = 604800000;
    return Math.ceil(diff / oneWeek);
  },
  
  // 添加天数
  addDays: (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
  
  // 添加周数
  addWeeks: (date, weeks) => {
    return DateUtils.addDays(date, weeks * 7);
  },
  
  // 添加月数
  addMonths: (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  },
  
  // 添加学年（学年从9月开始到次年8月）
  addAcademicYear: (date, years) => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  },
  
  // 计算两个日期相差天数
  diffDays: (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((date2 - date1) / oneDay);
  },
  
  // 获取学期信息
  getSemesterInfo: (date) => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    if (month >= 9 || month <= 1) {
      return {
        semester: 1,
        name: year + '-' + (year + 1) + '学年上学期',
        startYear: year,
        endYear: year + 1
      };
    } else {
      return {
        semester: 2,
        name: year + '-' + (year + 1) + '学年下学期',
        startYear: year,
        endYear: year + 1
      };
    }
  },
  
  // 获取年级（基于学年）
  getGrade: (academicYear, startYear) => {
    const yearDiff = academicYear - startYear;
    return Math.min(3, Math.max(1, yearDiff + 1));
  },
  
  // 检查是否是周末
  isWeekend: (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  },
  
  // 获取学期当前周数
  getCurrentWeek: (semesterStart, currentDate) => {
    const diff = DateUtils.diffDays(semesterStart, currentDate);
    return Math.floor(diff / 7) + 1;
  }
};

// 数值工具
const NumberUtils = {
  // 限制数值范围
  clamp: (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  },
  
  // 四舍五入到指定小数位
  round: (value, decimals = 0) => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  },
  
  // 向上取整
  ceil: (value, decimals = 0) => {
    const factor = Math.pow(10, decimals);
    return Math.ceil(value * factor) / factor;
  },
  
  // 向下取整
  floor: (value, decimals = 0) => {
    const factor = Math.pow(10, decimals);
    return Math.floor(value * factor) / factor;
  },
  
  // 计算百分比
  percentage: (value, total, decimals = 1) => {
    if (total === 0) return 0;
    return NumberUtils.round((value / total) * 100, decimals);
  },
  
  // 映射数值范围
  mapRange: (value, inMin, inMax, outMin, outMax) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  },
  
  // 计算平均值
  average: (...numbers) => {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  },
  
  // 计算加权平均
  weightedAverage: (items) => {
    if (!items || items.length === 0) return 0;
    let totalWeight = 0;
    let totalValue = 0;
    for (const item of items) {
      totalWeight += item.weight || 1;
      totalValue += item.value * (item.weight || 1);
    }
    return totalWeight === 0 ? 0 : totalValue / totalWeight;
  },
  
  // 计算排名百分比
  rankPercentile: (rank, total) => {
    if (total === 0) return 1;
    return 1 - (rank - 1) / total;
  },
  
  // 格式化数字（加千分位）
  formatNumber: (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
};

// 字符串工具
const StringUtils = {
  // 去除首尾空格
  trim: (str) => {
    return str.trim();
  },
  
  // 转义HTML标签（防止XSS）
  escapeHtml: (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
  
  // 截断字符串
  truncate: (str, maxLength, suffix = '...') => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  },
  
  // 首字母大写
  capitalize: (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  
 // 将驼峰命名转换为中文
  camelToChinese: (camelCase) => {
    const charMap = {
      'chinese': '语文',
      'math': '数学',
      'english': '英语',
      'politics': '政治',
      'history': '历史',
      'physics': '物理',
      'chemistry': '化学',
      'biology': '生物',
      'geography': '地理',
      'sports': '体育',
      'memory': '记忆力',
      'comprehension': '理解力',
      'focus': '专注力',
      'mindset': '考试心态',
      'physical': '体力',
      'energy': '精力',
      'stress': '压力值'
    };
    return charMap[camelCase] || camelCase;
  },
  
  // 格式化数字为等级
  scoreToGrade: (score, fullScore) => {
    const percent = (score / fullScore) * 100;
    if (percent >= 90) return 'A';
    if (percent >= 80) return 'B';
    if (percent >= 70) return 'C';
    if (percent >= 60) return 'D';
    return 'E';
  },
  
  // 生成随机姓名
  randomName: (gender = 'random') => {
    const surnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林', '罗'];
    
    const boyNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀英', '华', '平', '刚'];
    const girlNames = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '涛', '明', '超', '秀英', '华', '平', '刚'];
    
    const surname = RandomUtils.randomChoice(surnames);
    const names = gender === 'boy' ? boyNames : (gender === 'girl' ? girlNames : RandomUtils.randomChoice([boyNames, girlNames]));
    const givenName = RandomUtils.randomChoice(names) + RandomUtils.randomChoice(names);
    
    return surname + givenName;
  }
};

// 数组工具
const ArrayUtils = {
  // 检查数组是否包含指定元素
  includes: (arr, item) => {
    return arr.includes(item);
  },
  
  // 去除数组重复元素
  unique: (arr) => {
    return [...new Set(arr)];
  },
  
  // 过滤空值
  filterEmpty: (arr) => {
    return arr.filter(item => item !== null && item !== undefined && item !== '');
  },
  
  // 分组
  groupBy: (arr, key) => {
    return arr.reduce((groups, item) => {
      const group = typeof key === 'function' ? key(item) : item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  },
  
  // 获取子集
  sample: (arr, size) => {
    return RandomUtils.shuffle(arr).slice(0, size);
  },
  
  // 查找最大值索引
  maxIndex: (arr, mapper = v => v) => {
    let maxIndex = 0;
    let maxValue = mapper(arr[0]);
    for (let i = 1; i < arr.length; i++) {
      const value = mapper(arr[i]);
      if (value > maxValue) {
        maxValue = value;
        maxIndex = i;
      }
    }
    return maxIndex;
  },
  
  // 查找最小值索引
  minIndex: (arr, mapper = v => v) => {
    let minIndex = 0;
    let minValue = mapper(arr[0]);
    for (let i = 1; i < arr.length; i++) {
      const value = mapper(arr[i]);
      if (value < minValue) {
        minValue = value;
        minIndex = i;
      }
    }
    return minIndex;
  }
};

// 对象工具
const ObjectUtils = {
  // 深拷贝
  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj));
  },
  
  // 合并对象
  merge: (target, ...sources) => {
    for (const source of sources) {
      for (const key in source) {
        if (source[key] instanceof Object && key in target) {
          ObjectUtils.merge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
    return target;
  },
  
  // 获取对象所有键
  keys: (obj) => {
    return Object.keys(obj);
  },
  
  // 获取对象所有值
  values: (obj) => {
    return Object.values(obj);
  },
  
  // 检查对象是否为空
  isEmpty: (obj) => {
    return Object.keys(obj).length === 0;
  },
  
  // 过滤对象
  filter: (obj, predicate) => {
    const result = {};
    for (const key in obj) {
      if (predicate(obj[key], key)) {
        result[key] = obj[key];
      }
    }
    return result;
  },
  
  // 映射对象
  map: (obj, mapper) => {
    const result = {};
    for (const key in obj) {
      result[key] = mapper(obj[key], key);
    }
    return result;
  }
};

// 本地存储工具
const StorageUtils = {
  // 保存数据
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('保存失败:', e);
      return false;
    }
  },
  
  // 加载数据
  load: (key, defaultValue = null) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error('加载失败:', e);
      return defaultValue;
    }
  },
  
  // 删除数据
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('删除失败:', e);
      return false;
    }
  },
  
  // 清空所有数据
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('清空失败:', e);
      return false;
    }
  }
};

// 事件工具
const EventUtils = {
  // 事件监听器存储
  listeners: {},
  
  // 添加事件监听
  on: (event, callback) => {
    if (!EventUtils.listeners[event]) {
      EventUtils.listeners[event] = [];
    }
    EventUtils.listeners[event].push(callback);
  },
  
  // 移除事件监听
  off: (event, callback) => {
    if (!EventUtils.listeners[event]) return;
    if (callback) {
      EventUtils.listeners[event] = EventUtils.listeners[event].filter(cb => cb !== callback);
    } else {
      EventUtils.listeners[event] = [];
    }
  },
  
  // 触发事件
  emit: (event, data) => {
    if (!EventUtils.listeners[event]) return;
    EventUtils.listeners[event].forEach(callback => callback(data));
  }
};

// 游戏专用工具
const GameUtils = {
  // 计算成绩加权总分
  calculateTotalScore: (academic, subjects) => {
    let total = 0;
    let fullTotal = 0;
    
    for (const subject of subjects) {
      if (SUBJECTS[subject]) {
        total += academic[subject] || 0;
        fullTotal += SUBJECTS[subject].fullScore;
      }
    }
    
    return {
      score: total,
      fullScore: fullTotal,
      percentage: fullTotal > 0 ? (total / fullTotal) * 100 : 0
    };
  },
  
  // 计算年级排名
  calculateRank: (playerAcademic, allAcademics) => {
    const scores = allAcademics.map(academic => {
      const result = GameUtils.calculateTotalScore(academic, Object.keys(academic));
      return { academic, score: result.score };
    });
    
    scores.sort((a, b) => b.score - a.score);
    
    const playerIndex = scores.findIndex(s => s.academic === playerAcademic);
    return playerIndex + 1;
  },
  
  // 检查是否及格
  isPass: (score, fullScore) => {
    return (score / fullScore) >= 0.6;
  },
  
  // 根据能力计算学习效率
  learningEfficiency: (abilities) => {
    const base = 1.0;
    const memoryFactor = abilities.memory / 100;
    const comprehensionFactor = abilities.comprehension / 100;
    const focusFactor = abilities.focus / 100;
    
    return base * (0.5 + 0.5 * (memoryFactor + comprehensionFactor + focusFactor) / 3);
  },
  
  // 根据abilities计算各科成绩
  calculateSubjectScores: (abilities, grade) => {
    const scores = {};
    const subjects = GRADES[grade].subjects;
    
    // 定义各科与能力的权重关系
    const subjectWeights = {
      chinese: { memory: 0.4, comprehension: 0.4, focus: 0.1, mindset: 0.1 },
      math: { memory: 0.2, comprehension: 0.4, focus: 0.3, mindset: 0.1 },
      english: { memory: 0.4, comprehension: 0.3, focus: 0.2, mindset: 0.1 },
      politics: { memory: 0.3, comprehension: 0.3, focus: 0.2, mindset: 0.2 },
      history: { memory: 0.4, comprehension: 0.3, focus: 0.1, mindset: 0.2 },
      physics: { memory: 0.2, comprehension: 0.4, focus: 0.3, mindset: 0.1 },
      chemistry: { memory: 0.2, comprehension: 0.4, focus: 0.3, mindset: 0.1 },
      biology: { memory: 0.4, comprehension: 0.3, focus: 0.2, mindset: 0.1 },
      geography: { memory: 0.3, comprehension: 0.3, focus: 0.2, mindset: 0.2 },
      sports: { memory: 0.1, comprehension: 0.2, focus: 0.3, mindset: 0.4 }
    };
    
    for (const subject of subjects) {
      const weights = subjectWeights[subject] || { memory: 0.25, comprehension: 0.25, focus: 0.25, mindset: 0.25 };
      const fullScore = SUBJECTS[subject].fullScore;
      
      // 计算加权能力值
      const weightedAbility = 
        (abilities.memory * weights.memory) +
        (abilities.comprehension * weights.comprehension) +
        (abilities.focus * weights.focus) +
        (abilities.mindset * weights.mindset);
      
      // 添加一些随机波动，使成绩更自然
      const volatility = 10;
      const randomFactor = RandomUtils.normalRandom(0, volatility);
      
      // 计算最终成绩
      let score = weightedAbility + randomFactor;
      
      // 确保成绩在合理范围内
      score = Math.max(0, Math.min(fullScore, score));
      
      scores[subject] = Math.round(score);
    }
    
    return scores;
  },
  
  // 压力对成绩的影响
  stressEffect: (stress, score) => {
    // 压力越大，成绩波动越大，可能降低
    const stressFactor = stress / 100;
    const volatility = stressFactor * 0.2; // 最多影响20%
    const randomFactor = RandomUtils.normalRandom(0, volatility);
    
    return score * (1 - randomFactor);
  },
  
  // 生成随机同学
  generateClassmate: (grade) => {
    const genders = ['boy', 'girl'];
    const gender = RandomUtils.randomChoice(genders);
    
    return {
      id: RandomUtils.generateId('classmate'),
      name: StringUtils.randomName(gender),
      gender: gender,
      grade: grade,
      academic: GameUtils.generateRandomAcademic(grade),
      personality: RandomUtils.randomChoice(['study', 'social', 'quiet', 'messy', 'normal']),
      friendliness: RandomUtils.randomInt(30, 100),
      competitiveness: RandomUtils.randomInt(20, 100)
    };
  },
  
  // 生成随机学业成绩
  generateRandomAcademic: (grade) => {
    const academic = {};
    const subjects = GRADES[grade].subjects;
    
    for (const subject of subjects) {
      const fullScore = SUBJECTS[subject].fullScore;
      academic[subject] = RandomUtils.randomInt(Math.floor(fullScore * 0.4), fullScore);
    }
    
    return academic;
  },
  
  // 生成随机舍友
  generateDormmate: () => {
    const genders = ['boy', 'girl'];
    const gender = RandomUtils.randomChoice(genders);
    const personalities = Object.keys(DORMMATE_PERSONALITIES);
    const personality = RandomUtils.randomChoice(personalities);
    
    return {
      id: RandomUtils.generateId('dormmate'),
      name: StringUtils.randomName(gender),
      gender: gender,
      personality: personality,
      ...DORMMATE_PERSONALITIES[personality]
    };
  },
  
  // 生成随机老师
  generateTeacher: (subject) => {
    const genders = ['male', 'female'];
    const gender = RandomUtils.randomChoice(genders);
    const titles = ['老师', '教授', '讲师'];
    
    return {
      id: RandomUtils.generateId('teacher'),
      name: StringUtils.randomName(gender),
      subject: subject,
      title: RandomUtils.randomChoice(titles),
      friendliness: RandomUtils.randomInt(40, 100),
      strictness: RandomUtils.randomInt(30, 100),
      helpfulness: RandomUtils.randomInt(50, 100)
    };
  },

  // 生成年级前30名学生
  generateTopStudents: () => {
    const topStudents = [];
    const surnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '高', '罗'];
    const maleNames = ['伟', '强', '磊', '洋', '勇', '军', '杰', '涛', '超', '明', '刚', '平', '辉', '鹏', '华', '飞', '鑫', '波', '斌', '宇'];
    const femaleNames = ['静', '婷', '丽', '敏', '燕', '艳', '娟', '莉', '芳', '萍', '玲', '娜', '丹', '梅', '秀', '英', '红', '霞', '玉', '凤'];
    
    for (let i = 0; i < 30; i++) {
      const gender = RandomUtils.randomChoice(['boy', 'girl']);
      const surname = RandomUtils.randomChoice(surnames);
      const givenName = RandomUtils.randomChoice(gender === 'boy' ? maleNames : femaleNames);
      
      const student = {
        id: i + 1,
        name: surname + givenName,
        gender: gender,
        abilities: {
          memory: RandomUtils.normalRandom(75, 10),
          comprehension: RandomUtils.normalRandom(75, 10),
          focus: RandomUtils.normalRandom(75, 10),
          mindset: RandomUtils.normalRandom(75, 10)
        },
        factors: {
          baseStrength: RandomUtils.normalRandom(80, 8),
          currentForm: RandomUtils.normalRandom(75, 10),
          motivation: RandomUtils.normalRandom(80, 10),
          stress: RandomUtils.normalRandom(30, 15),
          growthRoom: RandomUtils.normalRandom(40, 15),
          fatigue: RandomUtils.normalRandom(20, 10),
          luck: 0
        },
        history: {
          exams: [],
          averageRank: 0,
          bestRank: 999,
          worstRank: 0
        },
        flags: {
          isDarkhorse: false,
          isDeclining: false,
          hasPotential: true
        }
      };
      
      topStudents.push(student);
    }
    
    return topStudents;
  },

  // 更新学生因子
  updateStudentFactors: (student) => {
    const factors = student.factors;
    
    factors.currentForm += RandomUtils.normalRandom(0, 3);
    factors.currentForm = Math.max(0, Math.min(100, factors.currentForm));
    
    if (RandomUtils.chance(0.1)) {
      factors.motivation += RandomUtils.normalRandom(0, 5);
      factors.motivation = Math.max(0, Math.min(100, factors.motivation));
    }
    
    factors.stress += RandomUtils.normalRandom(0, 2);
    if (factors.stress > 80) {
      factors.stress -= 10;
    }
    factors.stress = Math.max(0, Math.min(100, factors.stress));
    
    factors.fatigue = Math.max(0, factors.fatigue - 2);
    
    factors.growthRoom = Math.max(0, factors.growthRoom - 0.5);
  },

  // 使用多因子计算学生成绩
  calculateStudentScoreWithFactors: (student, grade, examIndex) => {
    GameUtils.updateStudentFactors(student);
    
    const baseScores = GameUtils.calculateSubjectScores(student.abilities, grade);
    
    let modifier = 0;
    
    modifier += (student.factors.currentForm - 50) * 0.3;
    modifier += (student.factors.motivation - 50) * 0.2;
    
    const stressFactor = 1 - Math.abs(student.factors.stress - 50) / 100;
    modifier *= stressFactor;
    
    modifier -= student.factors.fatigue * 0.15;
    
    student.factors.luck = RandomUtils.normalRandom(0, 5);
    modifier += student.factors.luck;
    
    if (student.flags.hasPotential && 
        student.factors.growthRoom > 60 && 
        RandomUtils.chance(0.05)) {
      modifier += RandomUtils.randomInt(10, 20);
      student.flags.isDarkhorse = true;
    }
    
    if (student.factors.currentForm < 40 && 
        RandomUtils.chance(0.03)) {
      modifier -= RandomUtils.randomInt(8, 15);
      student.flags.isDeclining = true;
    }
    
    const finalScores = {};
    for (const subject in baseScores) {
      let score = baseScores[subject] + modifier;
      // 确保分数在0到科目满分之间，并精确到两位小数
      score = Math.max(0, Math.min(SUBJECTS[subject].fullScore, score));
      finalScores[subject] = parseFloat(score.toFixed(2));
    }
    
    const totalScore = Object.values(finalScores).reduce((a, b) => a + b, 0);
    
    student.history.exams.push({
      examIndex,
      scores: finalScores,
      totalScore: parseFloat(totalScore.toFixed(2))
    });
    
    return finalScores;
  },

  // 生成年级完整排名
  generateGradeRanking: (topStudents, playerScores, grade, examIndex, totalStudents, examSubjects = null) => {
    const allScores = [];
    
    // 获取当前年级的科目和满分信息
    const gradeSubjects = GRADES[grade].subjects;
    // 如果指定了考试科目，只使用这些科目；否则使用年级所有科目
    const currentSubjects = examSubjects || gradeSubjects;
    const subjectFullScores = {};
    let totalFullScore = 0;
    
    currentSubjects.forEach(subject => {
      subjectFullScores[subject] = SUBJECTS[subject].fullScore;
      totalFullScore += SUBJECTS[subject].fullScore;
    });
    
    // 用于生成其他学生姓名的数组
    const surnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '马', '朱', '胡', '郭', '何', '林', '高', '罗'];
    const maleNames = ['伟', '强', '磊', '洋', '勇', '军', '杰', '涛', '超', '明', '刚', '平', '辉', '鹏', '华', '飞', '鑫', '波', '斌', '宇'];
    const femaleNames = ['静', '婷', '丽', '敏', '燕', '艳', '娟', '莉', '芳', '萍', '玲', '娜', '丹', '梅', '秀', '英', '红', '霞', '玉', '凤'];
    
    topStudents.forEach(student => {
      // 获取学生所有科目的分数
      const studentScores = GameUtils.calculateStudentScoreWithFactors(student, grade, examIndex);
      // 只筛选当前考试的科目
      const examScores = {};
      currentSubjects.forEach(subject => {
        examScores[subject] = studentScores[subject] || 0;
      });
      // 计算当前考试科目的总分
      const total = Object.values(examScores).reduce((a, b) => a + b, 0);
      allScores.push({
        id: student.id,
        name: student.name,
        scores: examScores,
        totalScore: parseFloat(total.toFixed(2)),
        isPlayer: false
      });
    });
    
    // 计算玩家总分，确保精确到两位小数
    const playerTotal = Object.values(playerScores).reduce((a, b) => a + b, 0);
    allScores.push({
      id: 'player',
      name: '玩家',
      scores: playerScores,
      totalScore: parseFloat(playerTotal.toFixed(2)),
      isPlayer: true
    });
    
    const otherCount = totalStudents - topStudents.length - 1;
    const mean = allScores.reduce((sum, s) => sum + s.totalScore, 0) / allScores.length;
    
    for (let i = 0; i < otherCount; i++) {
      // 生成随机总分，确保不超过满分总和
      const totalScore = Math.max(0, Math.min(totalFullScore, RandomUtils.normalRandom(mean, 15)));
      
      // 生成合理的科目成绩，确保每个科目成绩不超过满分
      const scores = {};
      let remainingScore = totalScore;
      const subjectsCount = currentSubjects.length;
      
      // 为每个考试科目分配分数
      for (let j = 0; j < currentSubjects.length; j++) {
        const subject = currentSubjects[j];
        const fullScore = subjectFullScores[subject];
        
        if (j === currentSubjects.length - 1) {
          // 最后一个科目分配剩余所有分数
          scores[subject] = parseFloat(Math.max(0, Math.min(fullScore, remainingScore)).toFixed(2));
        } else {
          // 其他科目分配随机分数，留一些分数给剩余科目
          const maxPossible = Math.min(fullScore, remainingScore - (subjectsCount - j - 1) * 10);
          const minPossible = Math.max(0, remainingScore - (subjectsCount - j - 1) * fullScore);
          const score = minPossible + Math.random() * (maxPossible - minPossible);
          scores[subject] = parseFloat(score.toFixed(2));
          remainingScore -= score;
        }
      }
      
      // 生成姓名
      const gender = RandomUtils.randomChoice(['boy', 'girl']);
      const surname = RandomUtils.randomChoice(surnames);
      const givenName = RandomUtils.randomChoice(gender === 'boy' ? maleNames : femaleNames);
      const name = surname + givenName;
      
      allScores.push({
        id: `other_${i}`,
        name: name,
        scores: scores,
        totalScore: parseFloat(totalScore.toFixed(2)),
        isPlayer: false
      });
    }
    
    allScores.sort((a, b) => b.totalScore - a.totalScore);
    
    return allScores;
  },

  // 计算单科等级
  calculateSubjectGrade: (score, totalStudents, rank) => {
    const percentage = rank / totalStudents;
    if (percentage <= 0.05) return 'A+';
    if (percentage <= 0.15) return 'A';
    if (percentage <= 0.25) return 'B';
    if (percentage <= 0.70) return 'C';
    return 'D';
  },

  // 计算总成绩等级
  calculateTotalGrade: (totalScore, totalStudents, rank) => {
    const percentage = rank / totalStudents;
    if (percentage <= 0.05) return 'A+';
    if (percentage <= 0.15) return 'A';
    if (percentage <= 0.25) return 'B';
    if (percentage <= 0.70) return 'C';
    return 'D';
  },

  // 格式化游戏时间
  formatGameTime: (gameTime) => {
    const date = new Date(gameTime.year, gameTime.month - 1, gameTime.day);
    const semesterInfo = DateUtils.getSemesterInfo(date);
    
    let timeStr = DateUtils.formatDate(date, 'yyyy年M月d日');
    let phaseStr = '';
    
    if (GAME_PHASES[gameTime.phase]) {
      phaseStr = GAME_PHASES[gameTime.phase].name;
    }
    
    return {
      dateStr: timeStr,
      phaseStr: phaseStr,
      week: gameTime.week,
      semester: semesterInfo.semester,
      academicYear: semesterInfo.name,
      grade: gameTime.grade
    };
  },
  
  // 创建初始游戏存档
  createInitialSave: () => {
    return {
      version: '0.0.1',
      createdAt: new Date().toISOString(),
      gameTime: {
        year: 2022,
        month: 8,
        day: 23,
        week: 1,
        grade: 1,
        semester: 1,
        phase: 'BEFORE_SCHOOL'
      },
      player: {
        name: '玩家',
        talent: {
          memory: 0,
          comprehension: 0,
          focus: 0,
          mindset: 0
        },
        abilities: {
          memory: 50,
          comprehension: 50,
          focus: 50,
          mindset: 50
        },
        status: {
          physical: 100,
          energy: 100,
          stress: 0
        },
        special: {}
      },
      classmates: [],
      dormmates: [],
      teachers: [],
      club: null,
      clubRole: null,
      classmateship: {},
      events: [],
      achievements: [],
      gradeStudentCount: RandomUtils.randomInt(375, 395),
      settings: {
        difficulty: 'normal',
        music: true,
        sound: true
      },
      // 初始考试机制配置
      examMechanics: {
        clickLimit: {
          monthly: 33,
          midterm: 33,
          final: 33,
          mock: 33,
          middle: 33
        },
        timeLimit: {
          monthly: 4,
          midterm: 4,
          final: 4,
          mock: 4,
          middle: 4
        }
      }
    };
  }
};

// 导出所有工具
window.RandomUtils = RandomUtils;
window.DateUtils = DateUtils;
window.NumberUtils = NumberUtils;
window.StringUtils = StringUtils;
window.ArrayUtils = ArrayUtils;
window.ObjectUtils = ObjectUtils;
window.StorageUtils = StorageUtils;
window.EventUtils = EventUtils;
window.GameUtils = GameUtils;
