/**
 * 龙高北重开模拟器 - 静态数据配置
 * 包含科目定义、游戏阶段、难度设置等静态数据
 */

// 科目配置
const SUBJECTS = {
  chinese: {
    name: '语文',
    fullScore: 120,
    description: '中考语文满分120分',
    gradeVisible: [1, 2, 3] // 所有年级可见
  },
  math: {
    name: '数学',
    fullScore: 100,
    description: '中考数学满分100分',
    gradeVisible: [1, 2, 3]
  },
  english: {
    name: '英语',
    fullScore: 100,
    description: '中考英语满分100分',
    gradeVisible: [1, 2, 3]
  },
  politics: {
    name: '政治',
    fullScore: 50,
    description: '中考政治满分50分',
    gradeVisible: [1, 2, 3]
  },
  history: {
    name: '历史',
    fullScore: 70,
    description: '中考历史满分70分',
    gradeVisible: [1, 2, 3]
  },
  physics: {
    name: '物理',
    fullScore: 70,
    description: '初二开始加入，中考物理满分70分',
    gradeVisible: [2, 3] // 初二、初三可见
  },
  chemistry: {
    name: '化学',
    fullScore: 70,
    description: '初三开始加入，中考化学满分70分',
    gradeVisible: [3] // 仅初三可见
  },
  biology: {
    name: '生物',
    fullScore: 100,
    description: '生地会考前满分100，会考后移除',
    gradeVisible: [1, 2] // 初一、初二可见
  },
  geography: {
    name: '地理',
    fullScore: 100,
    description: '生地会考前满分100，会考后移除',
    gradeVisible: [1, 2] // 初一、初二可见
  },
  sports: {
    name: '体育',
    fullScore: 50,
    description: '中考体育满分50分',
    gradeVisible: [1, 2, 3]
  }
};

// 游戏阶段定义
const GAME_PHASES = {
  BEFORE_SCHOOL: {
    id: 'BEFORE_SCHOOL',
    name: '开学前',
    description: '开学前的准备时间',
    canSkip: true
  },
  FIRST_WEEK: {
    id: 'FIRST_WEEK',
    name: '第一周',
    description: '新学期的第一周，熟悉环境',
    canSkip: false
  },
  TEMPORARY_CLASS: {
    id: 'TEMPORARY_CLASS',
    name: '临时班级',
    description: '按照入学成绩临时分班',
    canSkip: false
  },
  FIRST_EXAM: {
    id: 'FIRST_EXAM',
    name: '入学考试',
    description: '军训第一天的语数英考试',
    canSkip: false
  },
  OFFICIAL_CLASS: {
    id: 'OFFICIAL_CLASS',
    name: '正式分班',
    description: '根据考试成绩正式分班',
    canSkip: false
  },
  REGULAR_CLASSES: {
    id: 'REGULAR_CLASSES',
    name: '常规上课',
    description: '日常上课时间',
    canSkip: false
  },
  MONTHLY_EXAM: {
    id: 'MONTHLY_EXAM',
    name: '月考',
    description: '每月一次的考试（可能被取消）',
    canSkip: false
  },
  MIDTERM: {
    id: 'MIDTERM',
    name: '期中考试',
    description: '学期中间的考试',
    canSkip: false
  },
  FINAL: {
    id: 'FINAL',
    name: '期末考试',
    description: '学期末的考试',
    canSkip: false
  },
  SPORTS_MEETING: {
    id: 'SPORTS_MEETING',
    name: '运动会',
    description: '一年一度的运动会',
    canSkip: true
  },
  ARTS_FESTIVAL: {
    id: 'ARTS_FESTIVAL',
    name: '艺术节',
    description: '校园艺术节活动',
    canSkip: true
  },
  BIOLOGY_GEOGRAPHY_EXAM: {
    id: 'BIOLOGY_GEOGRAPHY_EXAM',
    name: '生地会考',
    description: '生物地理学业水平考试',
    canSkip: false
  },
  THIRD_GRADE_RECLASS: {
    id: 'THIRD_GRADE_RECLASS',
    name: '初三重新分班',
    description: '初三根据成绩重新分班',
    canSkip: false
  },
  HIGH_SCHOOL_SIGNING: {
    id: 'HIGH_SCHOOL_SIGNING',
    name: '签约龙高',
    description: '可以签约龙城高级中学',
    canSkip: true
  },
  MIDDLE_EXAM: {
    id: 'MIDDLE_EXAM',
    name: '中考',
    description: '初中升高中的考试',
    canSkip: false
  },
  GRADUATION: {
    id: 'GRADUATION',
    name: '毕业典礼',
    description: '初中生活的终点',
    canSkip: false
  }
};

// 年级配置
const GRADES = {
  1: {
    name: '初一',
    shortName: '七年级',
    subjects: ['chinese', 'math', 'english', 'politics', 'history', 'biology', 'geography', 'sports'],
    specialEvents: ['FIRST_EXAM', 'TEMPORARY_CLASS', 'OFFICIAL_CLASS']
  },
  2: {
    name: '初二',
    shortName: '八年级',
    subjects: ['chinese', 'math', 'english', 'politics', 'history', 'physics', 'biology', 'geography', 'sports'],
    specialEvents: ['THIRD_GRADE_RECLASS']
  },
  3: {
    name: '初三',
    shortName: '九年级',
    subjects: ['chinese', 'math', 'english', 'politics', 'history', 'physics', 'chemistry', 'sports'],
    specialEvents: ['HIGH_SCHOOL_SIGNING', 'BIOLOGY_GEOGRAPHY_EXAM', 'MIDDLE_EXAM', 'GRADUATION']
  }
};

// 难度设置
const DIFFICULTY_SETTINGS = {
  easy: {
    name: '简单',
    description: '适合想要轻松体验游戏',
    talentPoints: 15,
    examDifficulty: 0.7,
    eventFrequency: 0.3,
    stressRate: 0.8,
    scoreMultiplier: 1.2
  },
  normal: {
    name: '普通',
    description: '标准难度',
    talentPoints: 10,
    examDifficulty: 1.0,
    eventFrequency: 0.5,
    stressRate: 1.0,
    scoreMultiplier: 1.0
  },
  hard: {
    name: '困难',
    description: '挑战性较高',
    talentPoints: 8,
    examDifficulty: 1.2,
    eventFrequency: 0.7,
    stressRate: 1.2,
    scoreMultiplier: 0.9
  },
  nightmare: {
    name: '噩梦',
    description: '极限挑战',
    talentPoints: 5,
    examDifficulty: 1.5,
    eventFrequency: 1.0,
    stressRate: 1.5,
    scoreMultiplier: 0.8
  }
};

// 班级配置
const CLASS_CONFIG = {
  firstYear: {
    // 初一班级配置
    classNames: ['1班', '2班', '3班', '4班', '5班', '6班', '7班', '8班'],
    classTypes: {
      '1班': { type: 'excellent', description: '重点班' },
      '2班': { type: 'excellent', description: '重点班' },
      '3班': { type: 'good', description: '次重点班' },
      '4班': { type: 'good', description: '次重点班' },
      '5班': { type: 'normal', description: '平行班' },
      '6班': { type: 'normal', description: '平行班' },
      '7班': { type: 'weak', description: '普通班' },
      '8班': { type: 'weak', description: '普通班' }
    },
    reclassThreshold: {
      '1班': [0.85, 1.0],    // 前15%有机会进入
      '2班': [0.70, 0.85],
      '3班': [0.55, 0.70],
      '4班': [0.40, 0.55],
      '5班': [0.25, 0.40],
      '6班': [0.15, 0.25],
      '7班': [0.05, 0.15],
      '8班': [0, 0.05]
    }
  },
  thirdYear: {
    // 初三班级配置
    classNames: ['1班', '2班', '3班', '4班', '5班', '6班', '7班', '8班'],
    classTypes: {
      '1班': { type: '贯通班', description: '贯通班，可提前学习高中内容' },
      '2班': { type: '贯通班', description: '贯通班，可提前学习高中内容' },
      '3班': { type: 'excellent', description: '重点班' },
      '4班': { type: 'excellent', description: '重点班' },
      '5班': { type: 'good', description: '次重点班' },
      '6班': { type: 'good', description: '次重点班' },
      '7班': { type: 'normal', description: '平行班' },
      '8班': { type: 'normal', description: '平行班' }
    }
  }
};

// 社团分类
const CLUBS = {
  culture: {
    name: '文化类',
    clubs: ['文学社', '辩论社', '历史社', '哲学社', '日语社']
  },
  math: {
    name: '数学类',
    clubs: ['数学社', '数独社', '逻辑推理社']
  },
  information: {
    name: '信息类',
    clubs: ['编程社', '机器人社', '电子制作社']
  },
  art: {
    name: '美术类',
    clubs: ['美术社', '漫画社', '书法社', '摄影社']
  },
  music: {
    name: '音乐类',
    clubs: ['合唱团', '器乐社', '舞蹈社', '街舞社']
  },
  sports: {
    name: '体育类',
    clubs: ['篮球社', '足球社', '羽毛球社', '乒乓球社', '田径社']
  }
};

// 默认舍友性格
const DORMMATE_PERSONALITIES = {
  study: {
    name: '学霸型',
    description: '热爱学习，经常熬夜',
    effects: { studyBonus: 0.1, sleepPenalty: 0.2 }
  },
  social: {
    name: '社交型',
    description: '朋友多，经常串门',
    effects: { socialBonus: 0.2, studyPenalty: 0.1 }
  },
  quiet: {
    name: '安静型',
    description: '很少说话，互不干扰',
    effects: { studyBonus: 0.05, sleepBonus: 0.1 }
  },
  messy: {
    name: '混乱型',
    description: '生活不规律',
    effects: { sleepPenalty: 0.2, stressBonus: 0.1 }
  },
  normal: {
    name: '普通型',
    description: '正常的舍友',
    effects: {}
  }
};

// 考试类型配置
const EXAM_TYPES = {
  monthly: {
    name: '月考',
    subjects: ['chinese', 'math', 'english'],
    duration: 3,
    cancelConditions: {
      weather: ['yellow_rainstorm', 'red_rainstorm', 'yellow_typhoon', 'red_typhoon'],
      holiday: true
    }
  },
  midterm: {
    name: '期中考试',
    subjects: ['chinese', 'math', 'english', 'politics', 'history'],
    duration: 5,
    cancelConditions: null
  },
  final: {
    name: '期末考试',
    subjects: ['chinese', 'math', 'english', 'politics', 'history'],
    duration: 5,
    cancelConditions: null
  },
  biology_geography: {
    name: '生地会考',
    subjects: ['biology', 'geography'],
    duration: 2,
    cancelConditions: null
  },
  middle: {
    name: '中考',
    subjects: ['chinese', 'math', 'english', 'politics', 'history', 'physics', 'chemistry', 'sports'],
    duration: 6,
    cancelConditions: null
  }
};

// 学期时间配置
const SEMESTER_CONFIG = {
  firstSemester: {
    name: '上学期',
    startMonth: 9,
    startDay: 1,
    weeks: 20,
    months: [9, 10, 11, 12, 1]
  },
  secondSemester: {
    name: '下学期',
    startMonth: 2,
    startDay: 17,
    weeks: 20,
    months: [2, 3, 4, 5, 6, 7]
  }
};

// 行动类型
const ACTION_TYPES = {
  study: {
    name: '学习',
    icon: '📚',
    description: '提升学业成绩',
    energyCost: 20,
    timeCost: 1
  },
  rest: {
    name: '休息',
    icon: '😴',
    description: '恢复精力和体力',
    energyCost: -10,
    timeCost: 1
  },
  social: {
    name: '社交',
    icon: '👥',
    description: '维护人际关系',
    energyCost: 5,
    timeCost: 1
  },
  club: {
    name: '社团',
    icon: '🎨',
    description: '参加社团活动',
    energyCost: 15,
    timeCost: 1
  },
  exercise: {
    name: '锻炼',
    icon: '🏃',
    description: '提升体育成绩',
    energyCost: 25,
    timeCost: 1
  },
  ask_teacher: {
    name: '问老师',
    icon: '📖',
    description: '去办公室问问题',
    energyCost: 10,
    timeCost: 1
  },
  exam: {
    name: '考试',
    icon: '📝',
    description: '参加考试',
    energyCost: 30,
    timeCost: 1
  }
};

// 成就系统
const ACHIEVEMENTS = {
  perfect_score: {
    id: 'perfect_score',
    name: '满分传奇',
    description: '单科满分',
    condition: (stats) => Object.values(stats.academic).some(score => score === 100 || score === 120)
  },
  top_student: {
    id: 'top_student',
    name: '年级第一',
    description: '考试排名年级第一',
    condition: (stats) => stats.rank === 1
  },
  all_passed: {
    id: 'all_passed',
    name: '全部及格',
    description: '所有科目都及格',
    condition: (stats) => Object.values(stats.academic).every(score => score >= 60)
  },
  sports_full: {
    id: 'sports_full',
    name: '体育满分',
    description: '体育获得满分',
    condition: (stats) => stats.academic.sports >= 50
  },
  club_president: {
    id: 'club_president',
    name: '社团社长',
    description: '成为社团社长',
    condition: (stats) => stats.clubRole === 'president'
  },
  popular: {
    id: 'popular',
    name: '人气王',
    description: '人缘最好',
    condition: (stats) => stats.socialStats.maxFriendliness >= 80
  },
  survive: {
    id: 'survive',
    name: '极限生存',
    description: '压力值满值后存活',
    condition: (stats) => stats.status.stress >= 100 && stats.isAlive
  },
  love_story: {
    id: 'love_story',
    name: '青春记忆',
    description: '触发暗恋事件',
    condition: (stats) => stats.hasCrushEvent
  },
  high_school_sign: {
    id: 'high_school_sign',
    name: '签约成功',
    description: '签约龙城高级中学',
    condition: (stats) => stats.highSchoolSigned
  },
  graduate: {
    id: 'graduate',
    name: '顺利毕业',
    description: '完成初中三年',
    condition: (stats) => stats.phase === 'GRADUATION'
  }
};

// 结局类型
const ENDINGS = {
  perfect: {
    id: 'perfect',
    name: '完美结局',
    description: '考入理想高中，收获美好回忆',
    condition: (stats) => stats.finalScore >= 0.9
  },
  good: {
    id: 'good',
    name: '良好结局',
    description: '考入不错的高中',
    condition: (stats) => stats.finalScore >= 0.75 && stats.finalScore < 0.9
  },
  normal: {
    id: 'normal',
    name: '普通结局',
    description: '顺利毕业',
    condition: (stats) => stats.finalScore >= 0.6 && stats.finalScore < 0.75
  },
  bad: {
    id: 'bad',
    name: '遗憾结局',
    description: '未能考上理想学校',
    condition: (stats) => stats.finalScore >= 0.5 && stats.finalScore < 0.6
  },
  fail: {
    id: 'fail',
    name: '失败结局',
    description: '未能考上高中',
    condition: (stats) => stats.finalScore < 0.5
  },
  special: {
    id: 'special',
    name: '特殊结局',
    description: '特殊剧情结局',
    condition: (stats) => stats.hasSpecialEnding
  }
};

// 导出配置
window.SUBJECTS = SUBJECTS;
window.GAME_PHASES = GAME_PHASES;
window.GRADES = GRADES;
window.DIFFICULTY_SETTINGS = DIFFICULTY_SETTINGS;
window.CLASS_CONFIG = CLASS_CONFIG;
window.CLUBS = CLUBS;
window.DORMMATE_PERSONALITIES = DORMMATE_PERSONALITIES;
window.EXAM_TYPES = EXAM_TYPES;
window.SEMESTER_CONFIG = SEMESTER_CONFIG;
window.ACTION_TYPES = ACTION_TYPES;
window.ACHIEVEMENTS = ACHIEVEMENTS;
window.ENDINGS = ENDINGS;
