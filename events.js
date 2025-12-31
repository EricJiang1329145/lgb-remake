/**
 * 龙高北重开模拟器 - 事件配置
 * 包含随机事件、关键事件、考试事件等所有事件配置
 */

// 随机事件库
const RANDOM_EVENTS = [
  {
    id: 'study_late',
    title: '学到深夜',
    description: '今晚你决定多学一会儿，但是室友们都已经睡着了。台灯的光在黑暗中显得格外刺眼。',
    triggerConditions: (gameState) => gameState.player?.status?.energy > 30,
    probability: 0.15,
    options: [
      {
        text: '继续学到困为止',
        effects: { academic: { random: ['chinese', 'math', 'english'] }, abilities: { focus: -2 }, status: { energy: -30, stress: 5 } },
        nextEvent: null
      },
      {
        text: '收拾一下赶紧睡觉',
        effects: { abilities: { focus: 1 }, status: { energy: 10 } },
        nextEvent: null
      },
      {
        text: '躺床上玩会手机',
        effects: { abilities: { mindset: -2 }, status: { energy: -10 } },
        nextEvent: 'phone_addiction_check'
      }
    ]
  },
  {
    id: 'phone_addiction_check',
    title: '手机诱惑',
    description: '你躺在床上打开了手机，各种消息和视频让你欲罢不能。等你回过神来，已经凌晨2点了...',
    triggerConditions: (gameState) => true,
    probability: 0.3,
    options: [
      {
        text: '后悔地赶紧睡觉',
        effects: { status: { energy: -40, stress: 10 } },
        nextEvent: null
      },
      {
        text: '反正也睡不着，不如继续玩',
        effects: { status: { energy: -50, stress: 15 }, academic: { math: -2 } },
        nextEvent: null
      }
    ]
  },
  {
    id: 'classmate_help',
    title: '同学请教',
    description: '坐在你旁边的同学向你请教一道数学题。你看了眼题目，这道题对你来说很简单。',
    triggerConditions: (gameState) => {
      const scores = GameUtils.calculateSubjectScores(gameState.player.abilities, gameState.gameTime.grade);
      return scores.math > 60;
    },
    probability: 0.1,
    options: [
      {
        text: '耐心讲解',
        effects: { classmateship: { increase: 10 }, abilities: { comprehension: 1 } },
        nextEvent: null
      },
      {
        text: '随便说了两句',
        effects: { classmateship: { increase: 3 } },
        nextEvent: null
      },
      {
        text: '说自己在忙，让ta问老师',
        effects: { classmateship: { decrease: 5 } },
        nextEvent: null
      }
    ]
  },
  {
    id: 'teacher_praise',
    title: '老师表扬',
    description: '课堂上，老师当着全班同学的面表扬了你，说你的作业完成得非常出色。',
    triggerConditions: (gameState) => true,
    probability: 0.08,
    options: [
      {
        text: '谦虚地接受',
        effects: { abilities: { mindset: 3 }, status: { stress: -5 } },
        nextEvent: null
      },
      {
        text: '心里暗爽，更加努力',
        effects: { abilities: { focus: 2 }, academic: { random: ['chinese', 'math', 'english'] } },
        nextEvent: null
      }
    ]
  },
  {
    id: 'exam_anxiety',
    title: '考前焦虑',
    description: '考试前一天晚上，你躺在床上翻来覆去睡不着。脑子里全是明天考试的内容，压力好大。',
    triggerConditions: (gameState) => gameState.gameTime.phase === 'MONTHLY_EXAM' || gameState.gameTime.phase === 'MIDTERM' || gameState.gameTime.phase === 'FINAL',
    probability: 0.25,
    options: [
      {
        text: '深呼吸，放轻松',
        effects: { abilities: { mindset: 2 }, status: { stress: -10 } },
        nextEvent: null
      },
      {
        text: '起来再复习一会',
        effects: { academic: { random: ['chinese', 'math', 'english'] }, status: { energy: -20 } },
        nextEvent: null
      },
      {
        text: '给爸妈打个电话',
        effects: { status: { stress: -15 } },
        nextEvent: 'family_call'
      }
    ]
  },
  {
    id: 'family_call',
    title: '家人电话',
    description: '电话那头，妈妈叮嘱你注意身体，不要太累。爸爸说无论考得怎样，都没关系。',
    triggerConditions: (gameState) => true,
    probability: 0.5,
    options: [
      {
        text: '挂了电话，更有动力了',
        effects: { abilities: { mindset: 3 }, status: { stress: -20 } },
        nextEvent: null
      },
      {
        text: '挂了电话，有点想家',
        effects: { status: { stress: -10 } },
        nextEvent: null
      }
    ]
  },
  {
    id: 'cafeteria_food',
    title: '食堂美食',
    description: '今天食堂推出了新菜品，你决定尝尝。味道居然还不错！',
    triggerConditions: (gameState) => true,
    probability: 0.12,
    options: [
      {
        text: '多吃一碗饭',
        effects: { status: { physical: 15, energy: 10 } },
        nextEvent: null
      },
      {
        text: '拍个照发朋友圈',
        effects: { classmateship: { increase: 5 } },
        nextEvent: null
      }
    ]
  },
  {
    id: 'sports_injury',
    title: '运动受伤',
    description: '体育课上，你不小心在跑步时扭到了脚踝。有点疼，但应该不严重。',
    triggerConditions: (gameState) => true,
    probability: 0.05,
    options: [
      {
        text: '去校医室看看',
        effects: { status: { physical: -10, energy: -5 } },
        nextEvent: null
      },
      {
        text: '忍忍继续上课',
        effects: { status: { physical: -20 }, academic: { sports: -2 } },
        nextEvent: null
      }
    ]
  },
  {
    id: 'club_recruitment',
    title: '社团招新',
    description: '社团招新摊位在操场上摆了一排，各种社团都在招揽新成员。你被几个社团的人拦住了。',
    triggerConditions: (gameState) => gameState.player.club === null,
    probability: 0.2,
    options: [
      {
        text: '加入文学社',
        effects: { club: 'culture_literature', classmateship: { increase: 5 } },
        nextEvent: null
      },
      {
        text: '加入数学社',
        effects: { club: 'math', classmateship: { increase: 5 } },
        nextEvent: null
      },
      {
        text: '加入编程社',
        effects: { club: 'information', classmateship: { increase: 5 } },
        nextEvent: null
      },
      {
        text: '暂时不加入社团',
        effects: {},
        nextEvent: null
      }
    ]
  },
  {
    id: 'secret_crush',
    title: '心动的瞬间',
    description: '你在班上注意到了一个身影。每次看到ta，你的心跳都会不自觉地加快。',
    triggerConditions: (gameState) => !gameState.player.hasCrushEvent,
    probability: 0.1,
    once: true,
    options: [
      {
        text: '默默关注就好',
        effects: { special: { romance: 10 }, status: { stress: 5 } },
        nextEvent: null
      },
      {
        text: '找机会认识一下',
        effects: { classmateship: { increase: 15 }, status: { stress: 10 } },
        nextEvent: 'crush_interaction'
      },
      {
        text: '还是专注于学习吧',
        effects: { academic: { random: ['chinese', 'math', 'english'] }, abilities: { focus: 2 } },
        nextEvent: null
      }
    ]
  },
  {
    id: 'crush_interaction',
    title: '初次交流',
    description: '你鼓起勇气和ta说了话。ta对你笑了笑，你感觉整个世界都明亮了。',
    triggerConditions: (gameState) => true,
    probability: 0.6,
    options: [
      {
        text: '聊了很多，发现有很多共同话题',
        effects: { classmateship: { increase: 20 }, status: { stress: -10 } },
        nextEvent: null
      },
      {
        text: '简单聊了几句，有点紧张',
        effects: { classmateship: { increase: 10 } },
        nextEvent: null
      },
      {
        text: '表现得太紧张了，有点尴尬',
        effects: { classmateship: { increase: 5 }, abilities: { mindset: -2 } },
        nextEvent: null
      }
    ]
  },
  {
    id: 'peer_pressure',
    title: 'peer pressure',
    description: '你发现班上的同学都在偷偷内卷。你不努力，好像就会被落下。',
    triggerConditions: (gameState) => true,
    probability: 0.15,
    options: [
      {
        text: '跟着一起卷',
        effects: { academic: { random: ['chinese', 'math', 'english'] }, status: { stress: 15, energy: -20 } },
        nextEvent: null
      },
      {
        text: '保持自己的节奏',
        effects: { abilities: { mindset: 2 }, status: { stress: 5 } },
        nextEvent: null
      },
      {
        text: '完全不管，继续摸鱼',
        effects: { status: { stress: -5 }, academic: { random: ['chinese', 'math', 'english'] } },
        nextEvent: null
      }
    ]
  },
  {
    id: 'teacher_question',
    title: '被老师提问',
    description: '老师突然点名让你回答问题。你心里咯噔一下，知识点刚好没复习到...',
    triggerConditions: (gameState) => true,
    probability: 0.1,
    options: [
      {
        text: '硬着头皮回答',
        effects: { abilities: { mindset: 1 } },
        nextEvent: 'teacher_answer_result'
      },
      {
        text: '老实说不会',
        effects: { abilities: { mindset: -1 }, status: { stress: 5 } },
        nextEvent: null
      }
    ]
  },
  {
    id: 'teacher_answer_result',
    title: '回答结果',
    description: '',
    triggerConditions: (gameState) => true,
    probability: 0.5,
    options: [
      {
        text: '居然答对了！',
        effects: { abilities: { mindset: 3 }, status: { stress: -10 } },
        nextEvent: null
      },
      {
        text: '答错了，有点尴尬',
        effects: { abilities: { mindset: -2 }, status: { stress: 10 } },
        nextEvent: null
      }
    ]
  },
  {
    id: 'dorm_party',
    title: '宿舍夜谈',
    description: '熄灯后，宿舍里的小伙伴们开始聊天。从学习聊到八卦，从理想聊到人生。',
    triggerConditions: (gameState) => {
      const date = new Date(gameState.gameTime.year, gameState.gameTime.month - 1, gameState.gameTime.day);
      return DateUtils.isWeekend(date);
    },
    probability: 0.2,
    options: [
      {
        text: '积极参与讨论',
        effects: { dormmates: { increase: 15 }, status: { energy: -5 } },
        nextEvent: null
      },
      {
        text: '默默听着',
        effects: { dormmates: { increase: 5 } },
        nextEvent: null
      },
      {
        text: '太困了，先睡了',
        effects: { status: { energy: 10 } },
        nextEvent: null
      }
    ]
  },
  {
    id: 'rainy_day',
    title: '雨天',
    description: '窗外下起了大雨，教室里显得格外安静。你看着雨滴发呆...',
    triggerConditions: (gameState) => true,
    probability: 0.1,
    options: [
      {
        text: '适合学习',
        effects: { academic: { random: ['chinese', 'math', 'english'] }, abilities: { focus: 2 } },
        nextEvent: null
      },
      {
        text: '有点emo',
        effects: { status: { stress: 5 } },
        nextEvent: null
      },
      {
        text: '听雨声放松一下',
        effects: { status: { stress: -10 } },
        nextEvent: null
      }
    ]
  },
  {
    id: 'exam_good_grade',
    title: '成绩进步',
    description: '考试结果出来了，你的成绩比上次进步了不少！',
    triggerConditions: (gameState) => gameState.recentExamImprovement > 0.1,
    probability: 0.3,
    options: [
      {
        text: '继续保持！',
        effects: { abilities: { mindset: 3 }, status: { stress: -15 } },
        nextEvent: null
      },
      {
        text: '不能骄傲，要更努力',
        effects: { academic: { random: ['chinese', 'math', 'english'] }, abilities: { focus: 2 } },
        nextEvent: null
      }
    ]
  },
  {
    id: 'exam_bad_grade',
    title: '成绩下滑',
    description: '这次考试成绩不太理想，比上次退步了一些。',
    triggerConditions: (gameState) => gameState.recentExamImprovement < -0.1,
    probability: 0.3,
    options: [
      {
        text: '分析原因，加倍努力',
        effects: { academic: { random: ['chinese', 'math', 'english'] }, abilities: { focus: 2 }, status: { stress: 10 } },
        nextEvent: null
      },
      {
        text: '有点难过',
        effects: { status: { stress: 15 } },
        nextEvent: null
      },
      {
        text: '无所谓，继续摸鱼',
        effects: { abilities: { mindset: -2 } },
        nextEvent: null
      }
    ]
  },
  {
    id: 'sunny_day',
    title: '好天气',
    description: '今天阳光明媚，操场上充满了欢声笑语。',
    triggerConditions: (gameState) => true,
    probability: 0.1,
    options: [
      {
        text: '出去运动一下',
        effects: { status: { physical: 15, energy: 5 } },
        nextEvent: null
      },
      {
        text: '在教室里学习',
        effects: { academic: { random: ['chinese', 'math', 'english'] } },
        nextEvent: null
      }
    ]
  },
  {
    id: 'group_study',
    title: '小组学习',
    description: '老师安排了几个同学组成学习小组，一起讨论问题。',
    triggerConditions: (gameState) => true,
    probability: 0.1,
    options: [
      {
        text: '积极参与讨论',
        effects: { academic: { random: ['chinese', 'math', 'english'] }, classmateship: { increase: 10 } },
        nextEvent: null
      },
      {
        text: '主要听别人讲',
        effects: { abilities: { comprehension: 1 } },
        nextEvent: null
      },
      {
        text: '偷偷摸鱼',
        effects: { classmateship: { decrease: 5 } },
        nextEvent: null
      }
    ]
  }
];

// 考试取消事件
const EXAM_CANCEL_EVENTS = {
  weather: {
    yellow_rainstorm: {
      id: 'yellow_rainstorm_cancel',
      title: '黄色暴雨预警',
      description: '气象台发布黄色暴雨预警，为了学生安全，学校决定取消今天的考试。',
      options: [
        {
          text: '太好了，可以多复习几天',
          effects: { academic: { random: ['chinese', 'math', 'english'] }, status: { stress: -10 } },
          nextEvent: null
        },
        {
          text: '有点遗憾',
          effects: { status: { stress: 5 } },
          nextEvent: null
        }
      ]
    },
    red_rainstorm: {
      id: 'red_rainstorm_cancel',
      title: '红色暴雨预警',
      description: '气象台发布红色暴雨预警，学校紧急通知停课，考试延期举行。',
      options: [
        {
          text: '安全第一',
          effects: { status: { stress: -15 } },
          nextEvent: null
        }
      ]
    },
    yellow_typhoon: {
      id: 'yellow_typhoon_cancel',
      title: '黄色台风预警',
      description: '气象台发布黄色台风预警，学校决定取消考试以确保学生安全。',
      options: [
        {
          text: '理解学校的决定',
          effects: {},
          nextEvent: null
        }
      ]
    },
    red_typhoon: {
      id: 'red_typhoon_cancel',
      title: '红色台风预警',
      description: '气象台发布红色台风预警，学校停课，考试无限期推迟。',
      options: [
        {
          text: '希望台风快点过去',
          effects: { status: { stress: 10 } },
          nextEvent: null
        }
      ]
    }
  }
};

// 心理事件
const PSYCHOLOGICAL_EVENTS = {
  depression_risk: {
    id: 'depression_risk',
    title: '情绪低落',
    description: '最近你总觉得提不起劲，对什么都提不起兴趣。有时候会莫名其妙想哭。',
    triggerConditions: (gameState) => gameState.player?.status?.stress > 80,
    probability: 0.3,
    options: [
      {
        text: '找朋友聊聊天',
        effects: { status: { stress: -20 }, classmateship: { increase: 10 } },
        nextEvent: null
      },
      {
        text: '找老师倾诉',
        effects: { status: { stress: -25 }, teachers: { increase: 10 } },
        nextEvent: null
      },
      {
        text: '自己扛着',
        effects: { status: { stress: 10 }, abilities: { mindset: -5 } },
        nextEvent: null
      }
    ]
  },
  burnout: {
    id: 'burnout',
    title: '学习倦怠',
    description: '你发现自己越来越不想学习，看到书就头疼。这段时间压力太大了...',
    triggerConditions: (gameState) => {
      const scores = GameUtils.calculateSubjectScores(gameState.player.abilities, gameState.gameTime.grade);
      const total = GameUtils.calculateTotalScore(scores, Object.keys(scores));
      return gameState.player?.status?.stress > 70 && total.percentage < 60;
    },
    probability: 0.25,
    options: [
      {
        text: '休息几天调整状态',
        effects: { status: { stress: -30, energy: 20 }, academic: { random: ['chinese', 'math', 'english'] } },
        nextEvent: null
      },
      {
        text: '强迫自己继续学',
        effects: { abilities: { focus: -5 }, status: { stress: 15 } },
        nextEvent: null
      },
      {
        text: '换个学习方法',
        effects: { abilities: { comprehension: 5 }, status: { stress: -10 } },
        nextEvent: null
      }
    ]
  },
  peer_competition: {
    id: 'peer_competition',
    title: '竞争对手',
    description: '你发现班上的${studentName}成绩一直比你高。每次考试你都会不自觉地和他比较，压力好大。',
    triggerConditions: (gameState) => true,
    probability: 0.15,
    options: [
      {
        text: '把压力变成动力',
        effects: { academic: { random: ['chinese', 'math', 'english'] }, abilities: { focus: 3 } },
        nextEvent: null
      },
      {
        text: '不要比较，做好自己',
        effects: { abilities: { mindset: 3 }, status: { stress: -10 } },
        nextEvent: null
      },
      {
        text: '有点嫉妒',
        effects: { status: { stress: 10 }, classmateship: { decrease: 5 } },
        nextEvent: null
      }
    ]
  }
};

// 社团活动事件
const CLUB_EVENTS = {
  regular_meeting: {
    id: 'club_regular_meeting',
    title: '社团例会',
    description: '今天社团有例会活动。社长分享了一些有趣的内容。',
    triggerConditions: (gameState) => gameState.player.club !== null,
    probability: 0.2,
    options: [
      {
        text: '积极参与讨论',
        effects: { academic: { random: ['chinese', 'math', 'english'] }, clubExperience: 10, classmateship: { increase: 5 } },
        nextEvent: null
      },
      {
        text: '默默听着',
        effects: { clubExperience: 5 },
        nextEvent: null
      },
      {
        text: '偷偷写作业',
        effects: { academic: { random: ['chinese', 'math', 'english'] }, clubExperience: -5 },
        nextEvent: null
      }
    ]
  },
  club_competition: {
    id: 'club_competition',
    title: '社团比赛',
    description: '学校要举办社团展示比赛，社长问大家要不要参加。',
    triggerConditions: (gameState) => gameState.player.club !== null,
    probability: 0.1,
    options: [
      {
        text: '我要参加！',
        effects: { clubExperience: 20, status: { stress: 15 } },
        nextEvent: 'competition_result'
      },
      {
        text: '太累了，不想参加',
        effects: { clubExperience: -5 },
        nextEvent: null
      }
    ]
  },
  competition_result: {
    id: 'competition_result',
    title: '比赛结果',
    description: '',
    triggerConditions: (gameState) => true,
    probability: 0.5,
    options: [
      {
        text: '我们获奖了！',
        effects: { clubExperience: 30, classmateship: { increase: 15 }, status: { stress: -20 } },
        nextEvent: null
      },
      {
        text: '虽然没有获奖，但过程很有趣',
        effects: { clubExperience: 15, status: { stress: -10 } },
        nextEvent: null
      }
    ]
  },
  club_election: {
    id: 'club_election',
    title: '社团换届',
    description: '社团要选举新一届干部，你想参加竞选吗？',
    triggerConditions: (gameState) => gameState.player.clubExperience > 50,
    probability: 0.1,
    options: [
      {
        text: '竞选社长',
        effects: { status: { stress: 20 } },
        nextEvent: 'election_result'
      },
      {
        text: '竞选其他职位',
        effects: { status: { stress: 10 } },
        nextEvent: 'election_result'
      },
      {
        text: '还是不参加了',
        effects: {},
        nextEvent: null
      }
    ]
  },
  election_result: {
    id: 'election_result',
    title: '选举结果',
    description: '',
    triggerConditions: (gameState) => true,
    probability: 0.6,
    options: [
      {
        text: '恭喜你当选了！',
        effects: { clubRole: 'president', clubExperience: 50 },
        nextEvent: null
      },
      {
        text: '很遗憾，这次没有选上',
        effects: { status: { stress: 10 } },
        nextEvent: null
      }
    ]
  }
};

// 运动会事件
const SPORTS_MEETING_EVENTS = {
  sports_meeting_start: {
    id: 'sports_meeting_start',
    title: '运动会开始',
    description: '一年一度的运动会开始了！操场上彩旗飘扬，气氛热烈。',
    options: [
      {
        text: '参加比赛项目',
        effects: { academic: { sports: 10 }, status: { physical: -30 } },
        nextEvent: 'sports_event'
      },
      {
        text: '当啦啦队',
        effects: { classmateship: { increase: 15 }, status: { energy: 10 } },
        nextEvent: null
      },
      {
        text: '趁机学习',
        effects: { academic: { random: ['chinese', 'math', 'english'] }, classmateship: { decrease: 5 } },
        nextEvent: null
      }
    ]
  },
  sports_event: {
    id: 'sports_event',
    title: '比赛进行中',
    description: '比赛如火如荼地进行着。轮到你的项目了！',
    options: [
      {
        text: '拼尽全力',
        effects: { academic: { sports: 15 }, status: { physical: -40 } },
        nextEvent: 'sports_result'
      },
      {
        text: '重在参与',
        effects: { academic: { sports: 5 }, status: { physical: -20 } },
        nextEvent: null
      }
    ]
  },
  sports_result: {
    id: 'sports_result',
    title: '比赛结果',
    description: '',
    triggerConditions: (gameState) => true,
    probability: 0.4,
    options: [
      {
        text: '我获得了好名次！',
        effects: { classmateship: { increase: 20 }, status: { stress: -30 } },
        nextEvent: null
      },
      {
        text: '虽然没有得名次，但尽力了',
        effects: { classmateship: { increase: 5 }, status: { stress: -10 } },
        nextEvent: null
      }
    ]
  }
};

// 艺术节事件
const ARTS_FESTIVAL_EVENTS = {
  arts_festival_start: {
    id: 'arts_festival_start',
    title: '艺术节',
    description: '校园艺术节开始了！有节目表演、美术作品展、摄影展等多种活动。',
    options: [
      {
        text: '去看表演',
        effects: { status: { stress: -15 }, classmateship: { increase: 10 } },
        nextEvent: null
      },
      {
        text: '参观美术展',
        effects: { status: { stress: -10 } },
        nextEvent: null
      },
      {
        text: '参加节目表演',
        effects: { status: { stress: 20 }, classmateship: { increase: 20 } },
        nextEvent: 'arts_performance'
      },
      {
        text: '在教室学习',
        effects: { academic: { random: ['chinese', 'math', 'english'] } },
        nextEvent: null
      }
    ]
  },
  arts_performance: {
    id: 'arts_performance',
    title: '表演准备',
    description: '你要上台表演了！有点紧张，但更多的是期待。',
    options: [
      {
        text: '好好表现',
        effects: { status: { stress: 10 } },
        nextEvent: 'arts_result'
      }
    ]
  },
  arts_result: {
    id: 'arts_result',
    title: '表演结束',
    description: '表演结束了！台下响起了热烈的掌声。',
    options: [
      {
        text: '表演很成功！',
        effects: { classmateship: { increase: 25 }, status: { stress: -30 } },
        nextEvent: null
      },
      {
        text: '有点小失误',
        effects: { classmateship: { increase: 10 }, abilities: { mindset: -2 } },
        nextEvent: null
      }
    ]
  }
};

// 导出事件数据
window.RANDOM_EVENTS = RANDOM_EVENTS;
window.EXAM_CANCEL_EVENTS = EXAM_CANCEL_EVENTS;
window.PSYCHOLOGICAL_EVENTS = PSYCHOLOGICAL_EVENTS;
window.CLUB_EVENTS = CLUB_EVENTS;
window.SPORTS_MEETING_EVENTS = SPORTS_MEETING_EVENTS;
window.ARTS_FESTIVAL_EVENTS = ARTS_FESTIVAL_EVENTS;
