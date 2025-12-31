/**
 * 龙高北重开模拟器 - 核心游戏逻辑
 * 游戏主控制器，负责协调所有子系统
 */

class GameController {
  constructor() {
    this.gameState = null;
    this.currentEvent = null;
    this.isEventActive = false;
    this.settings = {
      difficulty: 'normal',
      music: true,
      sound: true
    };
    this.examSystem = null; // 考试系统实例
    this.dailyEventQueue = []; // 每日事件队列
    this.processingDailyEvents = false; // 是否正在处理每日事件
    this.activeMultiDayEvent = null; // 当前活跃的多日事件
    this.multiDayEventProgress = 0; // 多日事件进度
    
    // 语录管理
    this.defaultQuotes = [
      '学习如逆水行舟，不进则退。',
      '宝剑锋从磨砺出，梅花香自苦寒来。',
      '书山有路勤为径，学海无涯苦作舟。',
      '少壮不努力，老大徒伤悲。',
      '业精于勤，荒于嬉；行成于思，毁于随。',
      '千里之行，始于足下。',
      '路漫漫其修远兮，吾将上下而求索。',
      '天行健，君子以自强不息。',
      '学而不思则罔，思而不学则殆。',
      '知之者不如好之者，好之者不如乐之者。',
      '不积跬步，无以至千里；不积小流，无以成江海。',
      '锲而舍之，朽木不折；锲而不舍，金石可镂。',
      '读书破万卷，下笔如有神。',
      '温故而知新，可以为师矣。',
      '三人行，必有我师焉。',
      '学而时习之，不亦说乎？',
      '己所不欲，勿施于人。',
      '志不强者智不达，言不信者行不果。',
      '工欲善其事，必先利其器。',
      '凡事预则立，不预则废。'
    ];
    this.customQuotes = []; // 玩家自定义语录
    this.currentQuote = null; // 当前显示的语录
    this.lastQuoteDate = null; // 上次刷新语录的日期
  }

  init() {
    this.loadSettings();
    this.bindEvents();
    this.updateUI();
    // 初始化考试系统
    this.initExamSystem();
    // 加载语录配置
    this.loadContentConfigQuotes();
    // 初始化语录显示
    this.initializeQuote();
  }

  loadSettings() {
    const savedSettings = StorageUtils.load('lgb_settings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...savedSettings };
    }
  }

  saveSettings() {
    StorageUtils.save('lgb_settings', this.settings);
  }

  bindEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllPanels();
      }
    });
  }

  closeAllPanels() {
    const gamePanels = [
      'event-panel',
      'exam-panel',
      'result-panel'
    ];
    gamePanels.forEach(panelId => {
      const panel = document.getElementById(panelId);
      if (panel) {
        panel.style.display = 'none';
      }
    });
    this.isEventActive = false;
  }

  async startNewGame() {
    this.gameState = GameUtils.createInitialSave();
    this.gameState.settings = { ...this.settings };
    await this.loadKeyEvents(); // 加载关键事件
    this.generateInitialNPCs();
    this.initializeTopStudents(); // 初始化年级前30名学生
    this.initializeQuote(); // 初始化今日语录
    this.showStory('start');
  }

  // 加载关键事件
  async loadKeyEvents() {
    // 加载content-config.json中的事件
    await this.loadContentConfigEvents();
  }
  
  // 单独加载语录配置
  async loadContentConfigQuotes() {
    try {
      const response = await fetch('content-config.json');
      const config = await response.json();
      
      // 加载语录
      if (config.quotes) {
        if (config.quotes.default && Array.isArray(config.quotes.default)) {
          this.defaultQuotes = config.quotes.default;
          console.log('从content-config.json加载语录成功，共', this.defaultQuotes.length, '条');
        }
        // 注意：自定义语录只从localStorage加载，不在配置文件中设置
        // 这样可以避免配置文件覆盖用户添加的自定义语录
      }
    } catch (e) {
      console.warn('无法加载content-config.json中的语录:', e);
    }
  }

  // 加载content-config.json中的事件
  async loadContentConfigEvents() {
    try {
      const response = await fetch('content-config.json');
      const config = await response.json();
      
      if (config.timeline && config.timeline.events) {
        for (const event of config.timeline.events) {
          if (event.type === 'exam') {
            // 考试事件需要转换为游戏事件格式
            const dateParts = event.date.split('-').map(Number);
            const [year, month, day] = dateParts;
            
            // 创建考试事件，设定开始和结束时间为同一天
            const gameEvent = {
              id: event.id,
              title: event.title,
              description: event.description,
              type: 'exam',
              examType: event.examType,
              subjects: event.subjects,
              startTime: {
                year,
                month,
                day
              },
              endTime: {
                year,
                month,
                day
              },
              options: event.options || [
                {
                  text: '认真对待',
                  effects: { academic: {}, status: { stress: 10 } },
                  nextEvent: null
                },
                {
                  text: '尽力而为',
                  effects: { academic: {}, status: { stress: 5 } },
                  nextEvent: null
                }
              ]
            };
            
            this.gameState.events.push(gameEvent);
          } else {
            // 处理其他类型事件
            const dateParts = event.date.split('-').map(Number);
            const [year, month, day] = dateParts;
            
            const gameEvent = {
              ...event,
              specificDate: {
                year,
                month,
                day
              },
              type: event.type || 'key_event'
            };
            
            this.gameState.events.push(gameEvent);
          }
        }
      }
    } catch (e) {
      console.warn('无法加载content-config.json中的事件:', e);
    }
  }

  generateInitialNPCs() {
    const grade = 1;
    const classSize = RandomUtils.randomInt(40, 50);

    for (let i = 0; i < classSize; i++) {
      this.gameState.classmates.push(GameUtils.generateClassmate(grade));
    }

    for (let i = 0; i < 4; i++) {
      this.gameState.dormmates.push(GameUtils.generateDormmate());
    }

    const subjects = GRADES[grade].subjects;
    for (const subject of subjects) {
      if (SUBJECTS[subject]) {
        this.gameState.teachers.push(GameUtils.generateTeacher(subject));
      }
    }
  }

  // 初始化年级前30名学生
  initializeTopStudents() {
    this.gameState.topStudents = GameUtils.generateTopStudents();
    this.gameState.examHistory = []; // 玩家考试历史
    this.gameState.examCount = 0; // 考试次数计数器
  }

  // 生成年级排名
  generateGradeRanking(playerScores) {
    const grade = this.gameState.gameTime.grade;
    const examIndex = this.gameState.examCount;
    const totalStudents = this.gameState.gradeStudentCount;
    
    const ranking = GameUtils.generateGradeRanking(
      this.gameState.topStudents,
      playerScores,
      grade,
      examIndex,
      totalStudents,
      this.currentExamSubjects // 传递当前考试的科目列表，只计算这些科目的排名
    );
    
    return ranking;
  }

  // 计算玩家排名信息
  calculatePlayerRanking(ranking) {
    const playerEntry = ranking.find(r => r.isPlayer);
    if (!playerEntry) return null;
    
    const playerRank = ranking.indexOf(playerEntry) + 1;
    const totalStudents = ranking.length;
    
    const subjectRankings = {};
    for (const subject in playerEntry.scores) {
      const subjectScores = ranking
        .filter(r => r.scores[subject] !== undefined)
        .sort((a, b) => b.scores[subject] - a.scores[subject]);
      
      const subjectRank = subjectScores.findIndex(r => r.isPlayer) + 1;
      const grade = GameUtils.calculateSubjectGrade(
        playerEntry.scores[subject],
        totalStudents,
        subjectRank
      );
      
      subjectRankings[subject] = {
        score: playerEntry.scores[subject],
        rank: subjectRank,
        grade: grade
      };
    }
    
    const totalGrade = GameUtils.calculateTotalGrade(
      playerEntry.totalScore,
      totalStudents,
      playerRank
    );
    
    return {
      totalScore: playerEntry.totalScore,
      totalRank: playerRank,
      totalGrade: totalGrade,
      subjects: subjectRankings,
      totalStudents: totalStudents
    };
  }

  // 保存考试结果到历史
  saveExamResult(ranking, playerRanking) {
    const examResult = {
      examIndex: this.gameState.examCount,
      date: { ...this.gameState.gameTime },
      ranking: ranking,
      playerRanking: playerRanking
    };
    
    this.gameState.examHistory.push(examResult);
    this.gameState.examCount++;
  }

  showStory(storyId) {
    const storyPanels = {
      start: {
        title: '故事开始',
        content: `
          <p>你是一名即将踏入初中校门的学生。</p>
          <p>三年前，你小学毕业，对未来充满期待。</p>
          <p>三年后，你将面临人生中第一次重要的考试——中考。</p>
          <p>现在，一切都将重新开始。</p>
          <p>你会如何度过这三年？是努力学习，还是享受青春？</p>
          <p>是专注于学业，还是全面发展？</p>
          <p>所有的选择，都在你手中。</p>
        `
      }
    };

    const story = storyPanels[storyId] || storyPanels.start;

    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('story-panel').style.display = 'block';
    document.getElementById('story-title').textContent = story.title;
    document.getElementById('story-content').innerHTML = story.content;
  }

  proceedToNext() {
    document.getElementById('story-panel').style.display = 'none';
    document.getElementById('allocate-panel').style.display = 'block';
    document.getElementById('talent-points').textContent = DIFFICULTY_SETTINGS[this.settings.difficulty].talentPoints;
  }

  confirmTalentAllocation() {
    const inputs = ['memory', 'comprehension', 'focus', 'mindset'];
    let total = 0;
    const talentPoints = DIFFICULTY_SETTINGS[this.settings.difficulty].talentPoints;

    for (const key of inputs) {
      const value = parseInt(document.getElementById(`talent-${key}`).value) || 0;
      this.gameState.player.talent[key] = value;
      this.gameState.player.abilities[key] = 50 + value * 5;
      total += value;
    }

    if (total !== talentPoints) {
      alert(`请分配完所有天赋点！还需分配 ${talentPoints - total} 点`);
      return;
    }

    this.enterGame();
  }

  enterGame() {
    document.getElementById('allocate-panel').style.display = 'none';
    // 显示游戏界面和日志面板，但不直接显示旧的玩家属性面板
    document.getElementById('log-panel').style.display = 'block';
    document.getElementById('game-interface').style.display = 'block';

    // 初始化语录（如果还没有初始化）
    if (!this.currentQuote) {
      this.initializeQuote();
    } else {
      this.displayQuote(this.currentQuote);
    }

    // 确保导航面板可见并激活玩家属性部分
    const navSections = document.querySelectorAll('.nav-section');
    navSections.forEach(section => {
      section.style.display = 'none';
    });
    
    // 重置所有导航项的激活状态
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
    });
    
    // 激活玩家属性部分
    const playerStatsItem = document.querySelector('[onclick*="toggleNavSection(\'player-stats\')"]');
    const playerStatsSection = document.getElementById('player-stats-section');
    
    if (playerStatsItem && playerStatsSection) {
      playerStatsItem.classList.add('active');
      playerStatsSection.style.display = 'block';
    }

    this.updateTimeDisplay();
    this.updatePlayerStats();
    this.updateAcademicDisplay();
    this.updateEventPreview(); // 更新事件预告
    this.addLog('欢迎来到龙高北重开模拟器！');
    this.addLog('这是你初中生活的第一天...');
  }

  initExamSystem() {
    // 动态加载考试系统
    if (typeof ExamEmbedSystem !== 'undefined') {
      this.examSystem = new ExamEmbedSystem(this);
    } else {
      console.warn('ExamEmbedSystem未定义，请确保exam-embed.js已加载');
    }
  }

  // 语录管理方法
  loadQuotes() {
    // 先从 localStorage 加载自定义语录（优先级更高）
    const savedQuotes = StorageUtils.load('lgb_custom_quotes');
    if (savedQuotes && Array.isArray(savedQuotes)) {
      this.customQuotes = savedQuotes;
    }
    
    const savedQuoteDate = StorageUtils.load('lgb_last_quote_date');
    if (savedQuoteDate) {
      this.lastQuoteDate = new Date(savedQuoteDate);
    }
    
    const savedQuote = StorageUtils.load('lgb_current_quote');
    if (savedQuote) {
      this.currentQuote = savedQuote;
    }
  }

  saveQuotes() {
    StorageUtils.save('lgb_custom_quotes', this.customQuotes);
    StorageUtils.save('lgb_last_quote_date', this.lastQuoteDate);
    StorageUtils.save('lgb_current_quote', this.currentQuote);
  }

  refreshQuote() {
    // 获取当前时间（优先使用游戏内时间，否则使用系统时间）
    let currentTime;
    let timeKey;
    
    if (this.gameState && this.gameState.gameTime) {
      // 使用游戏内时间
      const { year, month, day } = this.gameState.gameTime;
      currentTime = new Date(year, month - 1, day);
      timeKey = `${year}-${month}-${day}`;
    } else {
      // 备选：使用系统时间
      currentTime = new Date();
      timeKey = currentTime.toDateString();
    }
    
    // 确保lastQuoteDate是对象，否则初始化为null
    if (!this.lastQuoteDate || typeof this.lastQuoteDate !== 'object') {
      this.lastQuoteDate = null;
    }
    
    // 合并默认语录和自定义语录
    const allQuotes = [...this.defaultQuotes, ...this.customQuotes];
    
    // 如果没有语录，显示默认提示
    if (allQuotes.length === 0) {
      this.displayQuote('点击刷新获取今日语录');
      return;
    }
    
    // 检查是否需要刷新语录
    const needRefresh = !this.lastQuoteDate || 
                       !this.currentQuote || 
                       (this.gameState && this.gameState.gameTime ? 
                         `${this.lastQuoteDate.year}-${this.lastQuoteDate.month}-${this.lastQuoteDate.day}` !== timeKey : 
                         this.lastQuoteDate.toDateString() !== timeKey);
    
    if (needRefresh) {
      // 随机选择一条语录
      const randomIndex = Math.floor(Math.random() * allQuotes.length);
      this.currentQuote = allQuotes[randomIndex];
      
      // 保存当前时间
      if (this.gameState && this.gameState.gameTime) {
        this.lastQuoteDate = { ...this.gameState.gameTime };
      } else {
        this.lastQuoteDate = new Date();
      }
      
      // 保存语录信息
      this.saveQuotes();
    }
    
    // 显示语录
    this.displayQuote(this.currentQuote);
  }

  displayQuote(quote) {
    const quoteContent = document.getElementById('quote-content');
    if (quoteContent) {
      quoteContent.innerHTML = `<p class="quote-text">${quote}</p>`;
    }
  }

  editQuote() {
    const newQuote = prompt('请输入你想写的语录：');
    if (newQuote && newQuote.trim()) {
      this.customQuotes.push(newQuote.trim());
      this.currentQuote = newQuote.trim();
      this.lastQuoteDate = new Date();
      this.saveQuotes();
      this.displayQuote(this.currentQuote);
      this.addLog('你添加了一条新语录', 'success');
    }
  }

  initializeQuote() {
    this.loadQuotes();
    this.refreshQuote();
  }

  startExam(examType, subject) {
    if (this.examSystem) {
      this.examSystem.startExam(examType, subject);
    } else {
      console.error('考试系统未初始化');
    }
  }

  submitExam() {
    if (this.examSystem) {
      this.examSystem.submitExam();
    } else {
      console.error('考试系统未初始化');
    }
  }

  // 检查是否在考试期间
  isInExamPeriod() {
    if (!this.gameState || !this.gameState.events) return false;
    
    const currentTime = this.gameState.gameTime;
    const nowDate = new Date(
      currentTime.year, 
      currentTime.month - 1, 
      currentTime.day
    );
    
    // 检查是否有考试事件在当前日期
    for (const event of this.gameState.events) {
      if (event.type === 'exam') {
        const startDate = new Date(event.startTime.year, event.startTime.month - 1, event.startTime.day);
        const endDate = new Date(event.endTime.year, event.endTime.month - 1, event.endTime.day);
        
        if (nowDate >= startDate && nowDate <= endDate) {
          return true;
        }
      }
    }
    
    return false;
  }



  triggerEvent(event) {
    this.isEventActive = true;
    this.currentEvent = event;

    // 如果是考试事件，直接启动考试
    if (event.type === 'exam') {
      this.startExamEvent(event);
      return;
    }

    // 非考试事件，显示事件面板和选项
    const panel = document.getElementById('event-panel');
    const titleEl = document.getElementById('event-title');
    const descEl = document.getElementById('event-description');
    const effectEl = document.getElementById('event-effect');
    const choicePanel = document.getElementById('event-choice-panel');

    titleEl.textContent = event.title;
    descEl.textContent = event.description;
    effectEl.textContent = '';
    choicePanel.innerHTML = '';

    event.options.forEach((option, index) => {
      const btn = document.createElement('button');
      btn.className = 'event-choice-btn';
      btn.textContent = option.text;
      btn.onclick = () => this.selectEventOption(index);
      choicePanel.appendChild(btn);
    });

    panel.style.display = 'flex';
  }
  
  // 启动考试事件
  startExamEvent(event) {
    // 保存当前考试事件的科目列表
    this.currentExamEvent = event;
    this.currentExamSubjects = [...event.subjects]; // 复制科目列表
    this.currentExamIndex = 0; // 当前考试科目索引

    // 设置活跃的多日事件
    this.activeMultiDayEvent = event;
    this.multiDayEventProgress = 0;

    // 显示考试说明面板，提供开始考试的选项
    const panel = document.getElementById('event-panel');
    const titleEl = document.getElementById('event-title');
    const descEl = document.getElementById('event-description');
    const effectEl = document.getElementById('event-effect');
    const choicePanel = document.getElementById('event-choice-panel');

    titleEl.textContent = event.title;
    
    // 计算考试持续天数
    const startDate = new Date(event.startTime.year, event.startTime.month - 1, event.startTime.day);
    const endDate = new Date(event.endTime.year, event.endTime.month - 1, event.endTime.day);
    const durationDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    descEl.textContent = `${event.description}\n\n考试将持续${durationDays}天，包含${event.subjects.length}门科目。`;
    effectEl.textContent = '';
    choicePanel.innerHTML = '';

    // 添加开始考试按钮
    const startExamBtn = document.createElement('button');
    startExamBtn.className = 'event-choice-btn';
    startExamBtn.textContent = '开始考试';
    startExamBtn.onclick = () => {
      // 如果事件有预设的考试类型和科目，使用它们
      if (event.examType && event.subjects && event.subjects.length > 0) {
        // 启动第一门考试
        this.startExam(event.examType, event.subjects[0]);
        
        // 关闭事件面板
        document.getElementById('event-panel').style.display = 'none';
        this.isEventActive = false;
        this.currentEvent = null;
      } else {
        // 如果没有预设的考试信息，显示考试选择界面
        this.showExamActivities();
        
        // 关闭事件面板
        document.getElementById('event-panel').style.display = 'none';
        this.isEventActive = false;
        this.currentEvent = null;
      }
    };
    choicePanel.appendChild(startExamBtn);

    panel.style.display = 'flex';
  }

  selectEventOption(optionIndex) {
    const option = this.currentEvent.options[optionIndex];

    if (option.effects) {
      this.applyEffects(option.effects);
    }

    if (option.nextEvent && option.nextEvent.startsWith('signing_check')) {
      this.checkHighSchoolSigning();
    } else if (option.nextEvent && option.nextEvent.startsWith('competition_result')) {
      this.handleCompetitionResult();
    } else if (option.nextEvent && option.nextEvent.startsWith('election_result')) {
      this.handleElectionResult();
    } else if (option.nextEvent && option.nextEvent.startsWith('sports_result')) {
      this.handleSportsResult();
    } else if (option.nextEvent && option.nextEvent.startsWith('arts_result')) {
      this.handleArtsResult();
    } else if (option.nextEvent && option.nextEvent.startsWith('admission_result')) {
      this.showAdmissionResult();
    }

    // 关闭事件面板
    document.getElementById('event-panel').style.display = 'none';
    this.isEventActive = false;
    this.currentEvent = null;

    if (option.once && this.currentEvent.id) {
      this.gameState.triggeredEvents = this.gameState.triggeredEvents || [];
      this.gameState.triggeredEvents.push(this.currentEvent.id);
      
      // 事件完成后检查成就
      this.checkAchievements();
    }

    // 检查当天是否还有其他事件可以触发
    if (this.processingDailyEvents) {
      this.processNextDailyEvent();
    } else {
      this.checkDailyEvents();
    }
  }

  applyEffects(effects) {
    let logMessages = [];

    if (effects.academic) {
      if (effects.academic.random) {
        const subject = RandomUtils.randomChoice(effects.academic.random);
        const increase = RandomUtils.randomInt(1, 3);
        
        // 定义科目与能力的对应关系
        const subjectAbilityMapping = {
          chinese: { memory: 0.6, comprehension: 0.4 },
          math: { comprehension: 0.6, focus: 0.4 },
          english: { memory: 0.5, comprehension: 0.5 },
          politics: { memory: 0.5, comprehension: 0.5 },
          history: { memory: 0.6, comprehension: 0.4 },
          physics: { comprehension: 0.6, focus: 0.4 },
          chemistry: { comprehension: 0.6, focus: 0.4 },
          biology: { memory: 0.5, comprehension: 0.5 },
          geography: { memory: 0.5, comprehension: 0.5 },
          sports: { focus: 0.5, mindset: 0.5 }
        };

        const mapping = subjectAbilityMapping[subject] || { memory: 0.25, comprehension: 0.25, focus: 0.25, mindset: 0.25 };

        // 根据权重增加对应的能力
        for (const [ability, weight] of Object.entries(mapping)) {
          const abilityIncrease = Math.floor(increase * weight);
          this.gameState.player.abilities[ability] = NumberUtils.clamp(
            this.gameState.player.abilities[ability] + abilityIncrease, 0, 100
          );
        }
        
        logMessages.push(`${StringUtils.camelToChinese(subject)}能力提升`);
      }
    }

    if (effects.abilities) {
      for (const [key, value] of Object.entries(effects.abilities)) {
        this.gameState.player.abilities[key] = NumberUtils.clamp(
          this.gameState.player.abilities[key] + value, 0, 100
        );
        if (value !== 0) {
          logMessages.push(`${StringUtils.camelToChinese(key)}${value > 0 ? '+' : ''}${value}`);
        }
      }
    }

    if (effects.status) {
      for (const [key, value] of Object.entries(effects.status)) {
        this.gameState.player.status[key] = NumberUtils.clamp(
          this.gameState.player.status[key] + value, 0, 100
        );
        if (value !== 0) {
          logMessages.push(`${StringUtils.camelToChinese(key)}${value > 0 ? '+' : ''}${value}`);
        }
      }
    }

    if (effects.classmateship) {
      const change = effects.classmateship.increase || effects.classmateship.decrease || 0;
      if (effects.classmateship.reset) {
        this.gameState.classmateship = {};
      } else if (change !== 0) {
        this.gameState.classmateship = this.gameState.classmateship || {};
        logMessages.push(`同学关系${change > 0 ? '+' : ''}${change}`);
      }
    }

    if (effects.dormmates) {
      const change = effects.dormmates.increase || 0;
      if (change !== 0) {
        logMessages.push(`舍友关系+${change}`);
      }
    }

    if (effects.teachers) {
      const change = effects.teachers.increase || 0;
      if (change !== 0) {
        logMessages.push(`师生关系+${change}`);
      }
    }

    if (effects.club) {
      this.gameState.player.club = effects.club;
      logMessages.push(`加入了社团`);
    }

    if (effects.clubRole) {
      this.gameState.player.clubRole = effects.clubRole;
      logMessages.push(`成为社团${effects.clubRole}`);
    }

    if (effects.clubExperience) {
      this.gameState.clubExperience = (this.gameState.clubExperience || 0) + effects.clubExperience;
      logMessages.push(`社团经验+${effects.clubExperience}`);
    }

    if (effects.special) {
      for (const [key, value] of Object.entries(effects.special)) {
        this.gameState.player.special[key] = (this.gameState.player.special[key] || 0) + value;
      }
    }

    if (effects.highSchoolSigned !== undefined) {
      this.gameState.highSchoolSigned = effects.highSchoolSigned;
      logMessages.push(effects.highSchoolSigned ? '签约成功' : '放弃签约');
    }

    if (effects.hasCrushEvent !== undefined) {
      this.gameState.player.hasCrushEvent = effects.hasCrushEvent;
    }

    if (logMessages.length > 0) {
      this.addLog(`效果: ${logMessages.join(', ')}`, 'success');
    }

    this.updatePlayerStats();
    this.updateAcademicDisplay();
  }


  showDailyActions() {
    const panel = document.getElementById('daily-action-panel');
    const optionsContainer = document.getElementById('action-options');

    optionsContainer.innerHTML = '';

    // 检查是否在考试期间
    const inExamPeriod = this.isInExamPeriod();

    // 如果在考试期间，只显示考试相关活动
    let actions = [];
    if (inExamPeriod) {
      actions = [
        {
          id: 'exam',
          title: '📝 参加考试',
          description: '进入当前考试，完成考试科目',
          effects: () => this.showExamActivities(),
          showCondition: () => true
        },
        {
          id: 'rest',
          title: '😴 休息一下',
          description: '恢复精力和体力，为考试做准备',
          effects: () => {
            this.applyEffects({
              status: { physical: 20, energy: 25, stress: -10 }
            });
            this.addLog('你好好休息了一会儿，感觉精力充沛！', 'success');
          },
          showCondition: () => true
        }
      ];
    } else {
      actions = [
        {
          id: 'study',
          title: '📚 认真学习',
          description: '选择一个科目进行学习，提升该科目成绩',
          effects: () => this.showSubjectSelection('study'),
          showCondition: () => true
        },
        {
          id: 'rest',
          title: '😴 休息一下',
          description: '恢复精力和体力',
          effects: () => {
            this.applyEffects({
              status: { physical: 20, energy: 25, stress: -10 }
            });
            this.addLog('你好好休息了一会儿，感觉精力充沛！', 'success');
          },
          showCondition: () => true
        },
        {
          id: 'ask_teacher',
          title: '📖 问老师问题',
          description: '去办公室向老师请教问题',
          effects: () => this.showTeacherSelection(),
          showCondition: () => true
        },
        {
          id: 'club',
          title: '🎨 社团活动',
          description: '参加社团活动',
          effects: () => this.showClubActivities(),
          showCondition: () => this.gameState.player.club !== null
        },
        {
          id: 'exercise',
          title: '🏃 锻炼身体',
          description: '进行体育锻炼',
          effects: () => {
            const sportsBonus = RandomUtils.randomInt(1, 3);
            this.applyEffects({
              academic: { sports: sportsBonus },
              status: { physical: -15, energy: -10 }
            });
            this.addLog(`锻炼完成，体育+${sportsBonus}`, 'success');
          },
          showCondition: () => true
        },
        {
          id: 'social',
          title: '👥 社交活动',
          description: '和同学交流，维护人际关系',
          effects: () => {
            const friendBonus = RandomUtils.randomInt(5, 15);
            this.applyEffects({
              classmateship: { increase: friendBonus },
              status: { energy: -5 }
            });
            this.addLog(`社交活动完成，同学关系+${friendBonus}`, 'success');
          },
          showCondition: () => true
        }
      ];
    }

    actions.forEach(action => {
      if (action.showCondition()) {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'action-option';
        optionDiv.innerHTML = `
          <h4>${action.title}</h4>
          <p>${action.description}</p>
        `;
        optionDiv.onclick = action.effects;
        optionsContainer.appendChild(optionDiv);
      }
    });

    // 显示导航面板并激活日常行动部分
    this.activateNavSection('daily-actions');
  }

  // 显示考试活动
  showExamActivities() {
    // 获取当前时间段内的考试事件
    if (!this.gameState || !this.gameState.events) return;
    
    const currentTime = this.gameState.gameTime;
    const nowDate = new Date(
      currentTime.year, 
      currentTime.month - 1, 
      currentTime.day
    );
    
    // 查找当前日期的考试事件
    const currentExamEvents = this.gameState.events.filter(event => {
      if (event.type !== 'exam') return false;
      
      const startDate = new Date(event.startTime.year, event.startTime.month - 1, event.startTime.day);
      const endDate = new Date(event.endTime.year, event.endTime.month - 1, event.endTime.day);
      
      return nowDate >= startDate && nowDate <= endDate;
    });
    
    if (currentExamEvents.length > 0) {
      // 显示考试选择界面
      const panel = document.getElementById('academic-panel');
      const subjectList = document.getElementById('subject-list');
      
      subjectList.innerHTML = '<h3>当前考试</h3>';
      
      currentExamEvents.forEach(event => {
        const examEl = document.createElement('div');
        examEl.className = 'exam-item';
        
        // 构建科目列表字符串
        const subjectNames = event.subjects.map(subject => SUBJECTS[subject]?.name || subject).join('、');
        
        examEl.innerHTML = `
          <div class="exam-info">
            <h4>${this.getExamTypeName(event.examType)}</h4>
            <p>科目: ${subjectNames}</p>
          </div>
          <button class="btn blue" onclick="game.startExamEventById('${event.id}')">开始考试</button>
        `;
        subjectList.appendChild(examEl);
      });
      
      panel.style.display = 'block';
    } else {
      this.addLog('当前没有可参加的考试', 'info');
    }
  }

  // 通过事件ID启动考试
  startExamEventById(eventId) {
    const event = this.gameState.events.find(e => e.id === eventId);
    if (event && event.type === 'exam') {
      this.startExamEvent(event);
    } else {
      this.addLog('未找到考试事件', 'error');
    }
  }

  showSubjectSelection(actionType) {
    const subjects = GRADES[this.gameState.gameTime.grade].subjects;
    
    // 根据abilities计算各科成绩
    const scores = GameUtils.calculateSubjectScores(this.gameState.player.abilities, this.gameState.gameTime.grade);

    const panel = document.getElementById('academic-panel');
    const subjectList = document.getElementById('subject-list');

    subjectList.innerHTML = '';

    subjects.forEach(subject => {
      const subjectEl = document.createElement('div');
      subjectEl.className = 'subject-item';
      subjectEl.innerHTML = `
        <span class="subject-name">${SUBJECTS[subject].name}</span>
        <span>
          <span class="subject-score">${scores[subject] || 0}</span>
          <span class="subject-full">/${SUBJECTS[subject].fullScore}</span>
        </span>
      `;
      subjectEl.onclick = () => {
        this.handleStudyAction(subject, actionType);
      };
      subjectList.appendChild(subjectEl);
    });

    panel.style.display = 'block';
  }

  handleStudyAction(subject, actionType) {
    const efficiency = GameUtils.learningEfficiency(this.gameState.player.abilities);
    let increase = Math.floor(RandomUtils.randomFloat(1, 4) * efficiency);

    if (this.gameState.player.status.energy < 20) {
      increase = Math.floor(increase * 0.5);
      this.addLog('精力不足，学习效率降低', 'warning');
    }

    // 定义科目与能力的对应关系
    const subjectAbilityMapping = {
      chinese: { memory: 0.6, comprehension: 0.4 },
      math: { comprehension: 0.6, focus: 0.4 },
      english: { memory: 0.5, comprehension: 0.5 },
      politics: { memory: 0.5, comprehension: 0.5 },
      history: { memory: 0.6, comprehension: 0.4 },
      physics: { comprehension: 0.6, focus: 0.4 },
      chemistry: { comprehension: 0.6, focus: 0.4 },
      biology: { memory: 0.5, comprehension: 0.5 },
      geography: { memory: 0.5, comprehension: 0.5 },
      sports: { focus: 0.5, mindset: 0.5 }
    };

    const mapping = subjectAbilityMapping[subject] || { memory: 0.25, comprehension: 0.25, focus: 0.25, mindset: 0.25 };

    // 根据权重增加对应的能力
    for (const [ability, weight] of Object.entries(mapping)) {
      const abilityIncrease = Math.floor(increase * weight);
      this.gameState.player.abilities[ability] = NumberUtils.clamp(
        this.gameState.player.abilities[ability] + abilityIncrease, 0, 100
      );
    }

    this.applyEffects({
      status: { energy: -20, stress: 5 }
    });

    this.addLog(`学习了${StringUtils.camelToChinese(subject)}，能力提升`, 'success');
    this.updateAcademicDisplay();

    document.getElementById('academic-panel').style.display = 'none';
  }

  showTeacherSelection() {
    const panel = document.getElementById('academic-panel');
    const subjectList = document.getElementById('subject-list');

    subjectList.innerHTML = '';

    this.gameState.teachers.forEach(teacher => {
      const subjectEl = document.createElement('div');
      subjectEl.className = 'subject-item';
      subjectEl.innerHTML = `
        <span class="subject-name">${teacher.name}（${SUBJECTS[teacher.subject].name}老师）</span>
        <span>亲和力: ${teacher.helpfulness}</span>
      `;
      subjectEl.onclick = () => {
        this.handleAskTeacher(teacher);
      };
      subjectList.appendChild(subjectEl);
    });

    panel.style.display = 'block';
  }

  handleAskTeacher(teacher) {
    const subject = teacher.subject;
    const increase = RandomUtils.randomInt(2, 5);
    
    // 定义科目与能力的对应关系
    const subjectAbilityMapping = {
      chinese: { memory: 0.6, comprehension: 0.4 },
      math: { comprehension: 0.6, focus: 0.4 },
      english: { memory: 0.5, comprehension: 0.5 },
      politics: { memory: 0.5, comprehension: 0.5 },
      history: { memory: 0.6, comprehension: 0.4 },
      physics: { comprehension: 0.6, focus: 0.4 },
      chemistry: { comprehension: 0.6, focus: 0.4 },
      biology: { memory: 0.5, comprehension: 0.5 },
      geography: { memory: 0.5, comprehension: 0.5 },
      sports: { focus: 0.5, mindset: 0.5 }
    };

    const mapping = subjectAbilityMapping[subject] || { memory: 0.25, comprehension: 0.25, focus: 0.25, mindset: 0.25 };

    // 根据权重增加对应的能力
    for (const [ability, weight] of Object.entries(mapping)) {
      const abilityIncrease = Math.floor(increase * weight);
      this.gameState.player.abilities[ability] = NumberUtils.clamp(
        this.gameState.player.abilities[ability] + abilityIncrease, 0, 100
      );
    }

    this.applyEffects({
      status: { energy: -10 },
      teachers: { increase: 5 }
    });

    this.addLog(`向${teacher.name}请教了${StringUtils.camelToChinese(subject)}，${StringUtils.camelToChinese(subject)}+${increase}，师生关系+5`, 'success');
    this.updateAcademicDisplay();

    document.getElementById('academic-panel').style.display = 'none';
  }

  showClubActivities() {
    const activities = CLUB_EVENTS;

    Object.keys(activities).forEach(key => {
      if (key.startsWith('club_') && activities[key].triggerConditions) {
        if (activities[key].triggerConditions(this.gameState)) {
          const event = activities[key];
          this.triggerEvent(event);
        }
      }
    });
  }

  showAcademicPanel() {
    const panel = document.getElementById('academic-panel');
    const subjectList = document.getElementById('subject-list');

    subjectList.innerHTML = '';

    const grade = this.gameState.gameTime.grade;
    const scores = GameUtils.calculateSubjectScores(this.gameState.player.abilities, grade);
    const subjects = GRADES[grade].subjects;

    subjects.forEach(subject => {
      const subjectEl = document.createElement('div');
      subjectEl.className = 'subject-item';
      subjectEl.innerHTML = `
        <span class="subject-name">${SUBJECTS[subject].name}</span>
        <span>
          <span class="subject-score">${scores[subject] || 0}</span>
          <span class="subject-full">/${SUBJECTS[subject].fullScore}</span>
        </span>
      `;
      subjectList.appendChild(subjectEl);
    });

    // 显示导航面板并激活学业面板部分
    this.activateNavSection('academic-panel');
  }

  showSocialPanel() {
    const panel = document.getElementById('social-panel');

    const classmatesList = document.getElementById('classmates-list');
    const dormmatesList = document.getElementById('dormmates-list');
    const teachersList = document.getElementById('teachers-list');

    classmatesList.innerHTML = '';
    dormmatesList.innerHTML = '';
    teachersList.innerHTML = '';

    this.gameState.classmates.slice(0, 10).forEach(classmate => {
      const personEl = document.createElement('div');
      personEl.className = 'social-person';
      personEl.innerHTML = `
        <span class="person-name">${classmate.name}</span>
        <span class="person-relation">${classmate.personality}</span>
      `;
      classmatesList.appendChild(personEl);
    });

    this.gameState.dormmates.forEach(dormmate => {
      const personEl = document.createElement('div');
      personEl.className = 'social-person';
      personEl.innerHTML = `
        <span class="person-name">${dormmate.name}</span>
        <span class="person-relation">${dormmate.personality}</span>
      `;
      dormmatesList.appendChild(personEl);
    });

    this.gameState.teachers.forEach(teacher => {
      const personEl = document.createElement('div');
      personEl.className = 'social-person';
      personEl.innerHTML = `
        <span class="person-name">${teacher.name}</span>
        <span class="person-relation">${teacher.subject}</span>
      `;
      teachersList.appendChild(personEl);
    });

    // 显示导航面板并激活社交面板部分
    this.activateNavSection('social-panel');
  }

  // 推进一天
  advanceDay() {
    if (this.isEventActive) {
      this.addLog('请先处理当前事件', 'warning');
      return;
    }

    // 推进日期
    this.advanceGameTime();

    // 更新UI
    this.updateTimeDisplay();
    this.updatePlayerStats();
    this.updateEventPreview(); // 更新事件预告
    this.refreshQuote(); // 刷新今日语录

    // 检查成就
    this.checkAchievements();
    
    // 检查当天是否应该触发随机事件
    this.checkDailyEvents();
    
    this.addLog('时间推进了一天', 'info');
  }
  
  // 推进游戏时间
  advanceGameTime() {
    const time = this.gameState.gameTime;
    
    // 如果有活跃的多日事件，跳过多天时间
    if (this.activeMultiDayEvent) {
      const event = this.activeMultiDayEvent;
      const startDate = new Date(event.startTime.year, event.startTime.month - 1, event.startTime.day);
      const endDate = new Date(event.endTime.year, event.endTime.month - 1, event.endTime.day);
      
      // 计算事件持续天数
      const durationDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      // 直接跳到事件结束日期
      time.year = endDate.getFullYear();
      time.month = endDate.getMonth() + 1;
      time.day = endDate.getDate();
      
      // 更新周数
      time.week += Math.floor(durationDays / 7);
      
      this.addLog(`时间推进了${durationDays}天（${event.title}）`, 'info');
      return;
    }
    
    // 计算当前日期的下一天
    let nextDate = new Date(time.year, time.month - 1, time.day + 1);
    
    // 更新游戏时间
    time.year = nextDate.getFullYear();
    time.month = nextDate.getMonth() + 1;
    time.day = nextDate.getDate();
    
    // 更新周数（如果跨周）
    if (DateUtils.isWeekend(nextDate)) {
      // 如果是周末，检查是否需要更新周数
      const prevDate = new Date(time.year, time.month - 1, time.day - 1);
      if (prevDate.getDay() === 6) { // 上一天是周六
        time.week += 1;
      }
    }
  }
  
  // 检查每日事件（替代原来的随机事件检查）
  // 检查每日事件（替代原来的随机事件检查）
  checkDailyEvents() {
    // 检查是否有特殊事件
    const availableEvents = this.getDailyEvents();
    
    if (availableEvents.length > 0) {
      // 按优先级处理事件：非考试事件优先，同级按字母序优先
      const sortedEvents = this.sortEventsByPriority(availableEvents);
      
      // 设置每日事件队列
      this.dailyEventQueue = [...sortedEvents];
      this.processingDailyEvents = true;
      
      // 触发第一个事件
      this.processNextDailyEvent();
    } else {
      // 如果没有特殊事件，进行日常活动
      this.performDailyRoutine();
    }
  }
  
  // 处理下一个每日事件
  processNextDailyEvent() {
    if (this.dailyEventQueue.length > 0 && this.processingDailyEvents) {
      // 获取下一个事件
      const nextEvent = this.dailyEventQueue.shift();
      this.triggerEvent(nextEvent);
    } else {
      // 如果队列为空，结束每日事件处理
      this.processingDailyEvents = false;
      this.dailyEventQueue = [];
    }
  }
  
  // 按优先级排序事件：非考试事件优先，同级按字母序优先
  sortEventsByPriority(events) {
    return events.sort((a, b) => {
      // 非考试事件优先
      const aIsExam = a.type === 'exam';
      const bIsExam = b.type === 'exam';
      
      if (aIsExam && !bIsExam) return 1;  // a是考试，b不是，b优先
      if (!aIsExam && bIsExam) return -1; // a不是考试，b是，a优先
      
      // 同为考试或非考试事件，按ID字母序排序
      return a.id.localeCompare(b.id);
    });
  }
  
  // 获取每日可能触发的事件
  getDailyEvents() {
    if (!this.gameState || !this.gameState.events) return [];
    
    const currentTime = this.gameState.gameTime;
    const nowDate = new Date(
      currentTime.year, 
      currentTime.month - 1, 
      currentTime.day
    );
    
    // 检查特定日期事件
    const dailyEvents = this.gameState.events.filter(event => {
      // 检查是否为特定日期事件
      if (event.specificDate) {
        const eventDate = new Date(
          event.specificDate.year,
          event.specificDate.month - 1,
          event.specificDate.day
        );
        
        if (nowDate.getTime() === eventDate.getTime()) {
          // 检查触发条件
          if (event.triggerConditions) {
            return event.triggerConditions(this.gameState);
          }
          return true;
        }
      }
      
      // 检查考试事件（包括时间范围内的考试事件）
      if (event.type === 'exam') {
        const startDate = new Date(event.startTime.year, event.startTime.month - 1, event.startTime.day);
        const endDate = new Date(event.endTime.year, event.endTime.month - 1, event.endTime.day);
        
        if (nowDate >= startDate && nowDate <= endDate) {
          // 只在事件开始的第一天触发
          if (nowDate.getTime() === startDate.getTime()) {
            return true;
          }
          // 如果是多日事件且已经触发过，不重复触发
          return false;
        }
      }
      
      // 检查概率事件（仅在校期间且非考试期间）
      if (event.type !== 'exam' && !this.isInExamPeriod()) {
        // 检查是否为在校时间（非假期）
        if (this.gameState.gameTime.phase === 'SCHOOL_TIME') {
          if (event.triggerConditions) {
            return event.triggerConditions(this.gameState) && RandomUtils.chance(event.probability || 0.05);
          } else if (event.probability !== undefined) {
            return RandomUtils.chance(event.probability);
          }
        }
      }
      
      return false;
    });
    
    return dailyEvents;
  }
  
  // 执行日常活动（如果没有事件发生）
  performDailyRoutine() {
    // 进行日常维护
    this.maintainStatus();
    
    // 添加日志
    this.addLog('平静的一天过去了...', 'info');
  }
  
  // 维护状态（体力、精力等的自然变化）
  maintainStatus() {
    // 体力和精力自然恢复
    this.gameState.player.status.physical = Math.min(100, this.gameState.player.status.physical + 5);
    this.gameState.player.status.energy = Math.min(100, this.gameState.player.status.energy + 10);
    
    // 压力值自然降低
    this.gameState.player.status.stress = Math.max(0, this.gameState.player.status.stress - 2);
  }
  
  activateNavSection(sectionName) {
    // 首先关闭所有面板
    this.closeAllPanels();
    
    // 获取导航项和面板部分
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.nav-section');
    
    // 重置所有导航项的激活状态
    navItems.forEach(item => {
      item.classList.remove('active');
    });
    
    // 隐藏所有面板部分
    sections.forEach(section => {
      section.style.display = 'none';
    });
    
    // 激活对应的导航项和显示对应的面板部分
    const targetNavItems = {
      'daily-actions': 'daily-actions',
      'academic-panel': 'academic-panel',
      'social-panel': 'social-panel'
    };
    
    // 根据传入的sectionName找到对应的导航项名称
    let navSectionName = sectionName;
    if (sectionName === 'academic-panel') {
      navSectionName = 'academic-panel';
    } else if (sectionName === 'social-panel') {
      navSectionName = 'social-panel';
    } else if (sectionName === 'daily-actions') {
      navSectionName = 'daily-actions';
    }
    
    const navItem = document.querySelector(`[onclick*="toggleNavSection('${navSectionName}')"]`);
    const section = document.getElementById(`${navSectionName}-section`);
    
    if (navItem && section) {
      navItem.classList.add('active');
      section.style.display = 'block';
    }
  }
  
  // 检查成就达成情况
  checkAchievements() {
    if (!this.gameState) return;
    
    // 确保成就列表已初始化
    if (!this.gameState.achievements) {
      this.gameState.achievements = [];
    }
    
    // 遍历所有成就定义
    const allAchievements = Object.values(window.ACHIEVEMENTS);
    
    allAchievements.forEach(achievement => {
      // 如果成就已解锁，跳过
      if (this.gameState.achievements.includes(achievement.id)) {
        return;
      }
      
      // 检查成就条件
      if (achievement.condition && typeof achievement.condition === 'function') {
        try {
          const isAchieved = achievement.condition(this.gameState.player);
          if (isAchieved) {
            // 解锁成就
            this.gameState.achievements.push(achievement.id);
            this.addLog(`🎉 解锁成就：${achievement.name} - ${achievement.description}`);
            
            // 保存游戏状态
            StorageUtils.save('lgb_save', this.gameState);
          }
        } catch (e) {
          console.warn(`检查成就${achievement.id}时出错：`, e);
        }
      }
    });
    
    // 检查content-config.json中的成就（包括"我是龙高人"）
    this.checkConfigAchievements();
  }
  
  // 检查content-config.json中的成就
  checkConfigAchievements() {
    // 检查"我是龙高人"成就（pre_school_exam事件完成）
    if (!this.gameState.achievements.includes('i_am_longgao_student')) {
      // 检查是否完成了学前考试
      const hasCompletedPreSchoolExam = this.gameState.triggeredEvents && 
                                       this.gameState.triggeredEvents.includes('pre_school_exam');
      
      if (hasCompletedPreSchoolExam) {
        // 解锁成就
        this.gameState.achievements.push('i_am_longgao_student');
        this.addLog('🎉 解锁成就：我是龙高人 - 完成学前考试，正式成为龙高北的一员');
        
        // 保存游戏状态
        StorageUtils.save('lgb_save', this.gameState);
      }
    }
  }
  
  backToGame() {
    // 检查结果面板是否显示
    const resultPanel = document.getElementById('result-panel');
    const confirmBtn = resultPanel ? resultPanel.querySelector('button') : null;
    
    // 关闭所有面板
    this.closeAllPanels();
    
    // 如果确认按钮存在且文字为"确认"，则推进一天
    // 这表示当前是成绩单界面，且没有下一场考试
    if (confirmBtn && confirmBtn.textContent === '确认') {
      this.advanceDay();
    }
    
    // 检查成就
    this.checkAchievements();
  }

  updateTimeDisplay() {
    const date = DateUtils.createDate(
      this.gameState.gameTime.year,
      this.gameState.gameTime.month,
      this.gameState.gameTime.day
    );

    const dateStr = DateUtils.formatDate(date, 'yyyy年M月d日');
    const phaseInfo = GAME_PHASES[this.gameState.gameTime.phase];

    document.getElementById('current-date').textContent = dateStr;
    document.getElementById('current-phase').textContent = `${GRADES[this.gameState.gameTime.grade].name}${phaseInfo?.name || ''}`;
    
    // 更新多日事件状态显示
    this.updateMultiDayEventDisplay();
  }
  
  // 更新多日事件状态显示
  updateMultiDayEventDisplay() {
    const statusPanel = document.getElementById('multi-day-event-status');
    
    if (this.activeMultiDayEvent) {
      const event = this.activeMultiDayEvent;
      const startDate = new Date(event.startTime.year, event.startTime.month - 1, event.startTime.day);
      const endDate = new Date(event.endTime.year, event.endTime.month - 1, event.endTime.day);
      const currentDate = new Date(this.gameState.gameTime.year, this.gameState.gameTime.month - 1, this.gameState.gameTime.day);
      
      const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      const elapsedDays = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      const remainingDays = totalDays - elapsedDays;
      
      document.getElementById('multi-day-event-title').textContent = event.title;
      document.getElementById('multi-day-event-progress').textContent = 
        `第${elapsedDays}/${totalDays}天，剩余${remainingDays}天`;
      statusPanel.style.display = 'block';
    } else {
      statusPanel.style.display = 'none';
    }
  }

  updatePlayerStats() {
    document.getElementById('ability-memory').textContent = this.gameState.player.abilities.memory;
    document.getElementById('ability-comprehension').textContent = this.gameState.player.abilities.comprehension;
    document.getElementById('ability-focus').textContent = this.gameState.player.abilities.focus;
    document.getElementById('ability-mindset').textContent = this.gameState.player.abilities.mindset;

    document.getElementById('status-physical').textContent = this.gameState.player.status.physical;
    document.getElementById('status-energy').textContent = this.gameState.player.status.energy;
    document.getElementById('status-stress').textContent = this.gameState.player.status.stress;
  }

  updateAcademicDisplay() {
    const grade = this.gameState.gameTime.grade;
    
    // 根据abilities计算各科成绩
    const scores = GameUtils.calculateSubjectScores(this.gameState.player.abilities, grade);

    document.getElementById('academic-chinese').textContent = scores.chinese || 0;
    document.getElementById('academic-math').textContent = scores.math || 0;
    document.getElementById('academic-english').textContent = scores.english || 0;
    document.getElementById('academic-politics').textContent = scores.politics || 0;
    document.getElementById('academic-history').textContent = scores.history || 0;
    document.getElementById('academic-sports').textContent = scores.sports || 0;

    const physicsEl = document.getElementById('academic-physics');
    const physicsValEl = document.getElementById('academic-physics-val');
    if (grade >= 2) {
      physicsEl.style.display = 'block';
      physicsValEl.textContent = scores.physics || 0;
    } else {
      physicsEl.style.display = 'none';
    }

    const chemistryEl = document.getElementById('academic-chemistry');
    const chemistryValEl = document.getElementById('academic-chemistry-val');
    if (grade >= 3) {
      chemistryEl.style.display = 'block';
      chemistryValEl.textContent = scores.chemistry || 0;
    } else {
      chemistryEl.style.display = 'none';
    }

    const biologyEl = document.getElementById('academic-biology');
    const biologyValEl = document.getElementById('academic-biology-val');
    if (grade <= 2) {
      biologyEl.style.display = 'block';
      biologyValEl.textContent = scores.biology || 0;
    } else {
      biologyEl.style.display = 'none';
    }

    const geographyEl = document.getElementById('academic-geography');
    const geographyValEl = document.getElementById('academic-geography-val');
    if (grade <= 2) {
      geographyEl.style.display = 'block';
      geographyValEl.textContent = scores.geography || 0;
    } else {
      geographyEl.style.display = 'none';
    }
  }

  addLog(message, type = 'normal') {
    const logPanel = document.getElementById('game-log');
    
    // 使用游戏时间的year、month、day属性创建正确的日期对象
    const { year, month, day } = this.gameState.gameTime;
    const currentDate = DateUtils.createDate(year, month, day);
    const formattedDate = DateUtils.formatDate(currentDate, 'yyyy年M月d日');
    
    
    const logEntry = document.createElement('p');
    logEntry.className = type;
    
    const dateSpan = document.createElement('span');
    dateSpan.className = 'log-date';
    dateSpan.textContent = `[${formattedDate}] `;
    
    const messageSpan = document.createElement('span');
    messageSpan.className = 'log-message';
    messageSpan.textContent = message;
    
    logEntry.appendChild(dateSpan);
    logEntry.appendChild(messageSpan);

    logPanel.appendChild(logEntry);
    logPanel.scrollTop = logPanel.scrollHeight;
  }

  // 更新事件预告
  updateEventPreview() {
    const previewContent = document.getElementById('event-preview-content');
    
    // 获取未来几天内的事件
    const upcomingEvents = this.getUpcomingEvents(7); // 获取未来7天的事件
    
    if (upcomingEvents.length > 0) {
      let content = '';
      upcomingEvents.forEach(event => {
        const { year, month, day } = event.specificDate || event.startTime;
        const eventDate = DateUtils.createDate(year, month, day);
        const formattedDate = DateUtils.formatDate(eventDate, 'M月d日');
        
        content += `<p><strong>${formattedDate}:</strong> ${event.title}</p>`;
      });
      previewContent.innerHTML = content;
    } else {
      previewContent.innerHTML = '<p>暂无事件预告</p>';
    }
  }

  // 获取未来指定天数内的事件
  getUpcomingEvents(days) {
    if (!this.gameState || !this.gameState.events) return [];
    
    const currentTime = this.gameState.gameTime;
    const currentDate = DateUtils.createDate(
      currentTime.year,
      currentTime.month,
      currentTime.day
    );
    
    const endDate = DateUtils.addDays(currentDate, days);
    
    // 筛选出未来几天内的事件
    const upcomingEvents = this.gameState.events.filter(event => {
      let eventDate;
      if (event.specificDate) {
        eventDate = DateUtils.createDate(
          event.specificDate.year,
          event.specificDate.month,
          event.specificDate.day
        );
      } else if (event.startTime) {
        eventDate = DateUtils.createDate(
          event.startTime.year,
          event.startTime.month,
          event.startTime.day
        );
      } else {
        return false;
      }
      
      // 事件日期在当前日期之后，且在结束日期之前或当天
      return eventDate > currentDate && eventDate <= endDate;
    });
    
    // 按日期排序
    upcomingEvents.sort((a, b) => {
      const aDate = a.specificDate ? 
        DateUtils.createDate(a.specificDate.year, a.specificDate.month, a.specificDate.day) :
        DateUtils.createDate(a.startTime.year, a.startTime.month, a.startTime.day);
      
      const bDate = b.specificDate ? 
        DateUtils.createDate(b.specificDate.year, b.specificDate.month, b.specificDate.day) :
        DateUtils.createDate(b.startTime.year, b.startTime.month, b.startTime.day);
      
      return aDate - bDate;
    });
    
    return upcomingEvents;
  }

  updateUI() {
    document.getElementById('start-screen').style.display = 'block';
    document.getElementById('story-panel').style.display = 'none';
    document.getElementById('allocate-panel').style.display = 'none';
    document.getElementById('game-interface').style.display = 'none';
    // 不再使用旧的player-stats-panel，而是使用新的导航面板
    document.getElementById('log-panel').style.display = 'none';
    
    // 确保导航面板部分都隐藏
    const navSections = document.querySelectorAll('.nav-section');
    navSections.forEach(section => {
      section.style.display = 'none';
    });
    
    // 重置所有导航项的激活状态
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
    });
  }

  showChangelog() {
    // 不要隐藏整个start-screen，只隐藏开始按钮
    document.querySelector('.start-buttons').style.display = 'none';
    
    // 动态加载更新日志
    const changelogEntries = ContentLoader.getChangelog();
    const entriesContainer = document.getElementById('changelog-entries');
    
    // 清空容器
    entriesContainer.innerHTML = '';
    
    // 生成更新日志HTML
    changelogEntries.forEach(entry => {
      const entryDiv = document.createElement('div');
      entryDiv.className = 'changelog-entry';
      
      // 生成版本标题
      const title = document.createElement('h4');
      title.textContent = `${entry.version} - ${entry.title} (${entry.date})`;
      entryDiv.appendChild(title);
      
      // 生成更新内容列表
      const changesList = document.createElement('ul');
      entry.changes.forEach(change => {
        const changeItem = document.createElement('li');
        changeItem.textContent = change;
        changesList.appendChild(changeItem);
      });
      entryDiv.appendChild(changesList);
      
      entriesContainer.appendChild(entryDiv);
    });
    
    document.getElementById('changelog-content').style.display = 'block';
  }

  backToMainMenu() {
    document.getElementById('start-screen').style.display = 'block';
    document.querySelector('.start-buttons').style.display = 'flex';
    document.getElementById('changelog-content').style.display = 'none';
  }

  checkHighSchoolSigning() {
    const totalScore = this.calculateTotalAcademicScore();
    const threshold = 0.85;

    if (totalScore.percentage >= threshold) {
      this.gameState.highSchoolSigned = true;
      this.addLog('恭喜你成功签约龙城高级中学！', 'success');
    } else {
      this.addLog('很遗憾，你的成绩未达到签约标准', 'warning');
    }
  }

  handleCompetitionResult() {
    if (RandomUtils.chance(0.5)) {
      this.addLog('你们的表演在比赛中获奖了！', 'success');
      this.gameState.clubExperience = (this.gameState.clubExperience || 0) + 30;
    } else {
      this.addLog('虽然没有获奖，但大家玩得很开心', 'normal');
      this.gameState.clubExperience = (this.gameState.clubExperience || 0) + 15;
    }
  }

  handleElectionResult() {
    if (RandomUtils.chance(0.6)) {
      this.gameState.player.clubRole = 'president';
      this.addLog('恭喜你当选为社团社长！', 'success');
    } else {
      this.addLog('很遗憾，这次没有选上', 'normal');
    }
  }

  handleSportsResult() {
    if (RandomUtils.chance(0.4)) {
      this.addLog('你在比赛中获得了好名次！', 'success');
      const increase = 15;
      this.gameState.player.abilities.focus = NumberUtils.clamp(
        this.gameState.player.abilities.focus + Math.floor(increase * 0.6), 0, 100
      );
      this.gameState.player.abilities.mindset = NumberUtils.clamp(
        this.gameState.player.abilities.mindset + Math.floor(increase * 0.4), 0, 100
      );
    } else {
      this.addLog('虽然没有得名次，但重在参与', 'normal');
      const increase = 5;
      this.gameState.player.abilities.focus = NumberUtils.clamp(
        this.gameState.player.abilities.focus + Math.floor(increase * 0.6), 0, 100
      );
      this.gameState.player.abilities.mindset = NumberUtils.clamp(
        this.gameState.player.abilities.mindset + Math.floor(increase * 0.4), 0, 100
      );
    }
    this.updateAcademicDisplay();
  }

  handleArtsResult() {
    if (RandomUtils.chance(0.6)) {
      this.addLog('你的表演非常成功！', 'success');
    } else {
      this.addLog('虽然有点小失误，但大家都为你鼓掌', 'normal');
    }
  }

  showAdmissionResult() {
    const totalScore = this.calculateTotalAcademicScore();
    let result = '';
    let resultClass = '';

    if (totalScore.percentage >= 0.9) {
      result = '恭喜你被第一志愿录取！';
      resultClass = 'pass';
    } else if (totalScore.percentage >= 0.75) {
      result = '恭喜你被录取了！';
      resultClass = 'pass';
    } else if (totalScore.percentage >= 0.6) {
      result = '你被普通高中录取了';
      resultClass = 'pass';
    } else {
      result = '很遗憾，未能达到录取分数线';
      resultClass = 'fail';
    }

    if (this.gameState.highSchoolSigned && totalScore.percentage >= 0.75) {
      result = '由于你签约了龙高，已被该校录取！';
      resultClass = 'pass';
    }

    const resultPanel = document.getElementById('result-panel');
    const resultContent = document.getElementById('result-content');

    resultContent.innerHTML = `
      <div class="result-item ${resultClass}">
        <span class="item-name">中考总分</span>
        <span class="item-value">${totalScore.score}/${totalScore.fullScore}</span>
      </div>
      <div class="result-item ${resultClass}">
        <span class="item-name">排名</span>
        <span class="item-value">第${this.gameState.rank || '?'}名</span>
      </div>
      <div class="result-item ${resultClass}">
        <span class="item-name">录取结果</span>
        <span class="item-value">${result}</span>
      </div>
    `;

    document.getElementById('result-title').textContent = '中考结果';
    resultPanel.style.display = 'block';
  }

  // 获取考试类型名称
  getExamTypeName(examType) {
    const examTypes = {
      'entry': '入学考试',
      'monthly': '月考',
      'midterm': '期中考试',
      'final': '期末考试',
      'biology_geography': '生地会考',
      'sports': '体育中考',
      'mock': '模拟考试',
      'middle': '中考'
    };
    
    return examTypes[examType] || examType;
  }

  calculateTotalAcademicScore() {
    const grade = this.gameState.gameTime.grade;
    const scores = GameUtils.calculateSubjectScores(this.gameState.player.abilities, grade);
    const subjects = Object.keys(scores);

    let total = 0;
    let fullTotal = 0;

    for (const subject of subjects) {
      if (SUBJECTS[subject]) {
        total += scores[subject] || 0;
        fullTotal += SUBJECTS[subject].fullScore;
      }
    }

    return {
      score: total,
      fullScore: fullTotal,
      percentage: fullTotal > 0 ? total / fullTotal : 0
    };
  }

  // 考试完成回调
  examCompleted() {
    // 检查是否还有剩余的考试科目需要完成
    if (this.currentExamSubjects && this.currentExamIndex !== null) {
      this.currentExamIndex++;
      
      // 如果还有剩余的科目，启动下一门考试
      if (this.currentExamIndex < this.currentExamSubjects.length) {
        const nextSubject = this.currentExamSubjects[this.currentExamIndex];
        const examType = this.currentExamEvent ? this.currentExamEvent.examType : 'monthly';
        
        // 延迟一下再启动下一门考试，让用户看到当前考试的结果
        setTimeout(() => {
          this.startExam(examType, nextSubject);
        }, 1500);
        
        return;
      } else {
        // 所有科目考试完成，生成排名
        this.generateExamRanking();
        
        // 如果当前有考试事件，将其标记为已触发
        if (this.currentExamEvent) {
          this.gameState.triggeredEvents = this.gameState.triggeredEvents || [];
          if (!this.gameState.triggeredEvents.includes(this.currentExamEvent.id)) {
            this.gameState.triggeredEvents.push(this.currentExamEvent.id);
            this.addLog(`${this.currentExamEvent.title}已完成`);
          }
        }
        
        // 检查成就
        this.checkAchievements();
        
        // 清理状态
        this.currentExamEvent = null;
        this.currentExamSubjects = null;
        this.currentExamIndex = null;
        
        // 结束多日事件
        if (this.activeMultiDayEvent) {
          this.endMultiDayEvent();
        }
      }
    }
    
    // 考试完成后，检查是否还有其他每日事件需要处理
    if (this.processingDailyEvents) {
      this.processNextDailyEvent();
    } else {
      // 如果不是在处理每日事件队列中，则检查是否有新的每日事件
      this.checkDailyEvents();
    }
  }
  
  // 生成考试排名
  generateExamRanking() {
    // 收集玩家所有科目的成绩
    const playerScores = {};
    if (this.gameState.player.examResults) {
      for (const [subject, result] of Object.entries(this.gameState.player.examResults)) {
        playerScores[subject] = result.score;
      }
    }
    
    // 生成年级排名
    const ranking = this.generateGradeRanking(playerScores);
    
    // 计算玩家排名信息
    const playerRanking = this.calculatePlayerRanking(ranking);
    
    // 保存考试历史
    this.gameState.examCount++;
    this.gameState.examHistory.push({
      examIndex: this.gameState.examCount,
      date: new Date(this.gameState.gameTime.date).toLocaleDateString('zh-CN'),
      playerRanking: playerRanking,
      topStudents: ranking.slice(0, 30).map(r => ({
        name: r.name,
        totalScore: r.totalScore
      }))
    });
    
    // 显示成绩单
    this.showReportCard(playerRanking, ranking);
  }
  
  // 生成年级排名
  generateGradeRanking(playerScores) {
    const grade = this.gameState.gameTime.grade;
    const examIndex = this.gameState.examCount;
    const totalStudents = this.gameState.gradeStudentCount;
    
    const ranking = GameUtils.generateGradeRanking(
      this.gameState.topStudents,
      playerScores,
      grade,
      examIndex,
      totalStudents,
      this.currentExamSubjects // 传递当前考试的科目列表，只计算这些科目的排名
    );
    
    return ranking;
  }
  
  // 计算玩家排名信息
  calculatePlayerRanking(ranking) {
    const playerEntry = ranking.find(r => r.isPlayer);
    if (!playerEntry) return null;
    
    const playerRank = ranking.indexOf(playerEntry) + 1;
    const totalStudents = ranking.length;
    
    const subjectRankings = {};
    for (const subject in playerEntry.scores) {
      const subjectScores = ranking
        .filter(r => r.scores[subject] !== undefined)
        .sort((a, b) => b.scores[subject] - a.scores[subject]);
      
      const subjectRank = subjectScores.findIndex(r => r.isPlayer) + 1;
      const grade = GameUtils.calculateSubjectGrade(
        playerEntry.scores[subject],
        totalStudents,
        subjectRank
      );
      
      subjectRankings[subject] = {
        score: playerEntry.scores[subject],
        rank: subjectRank,
        grade: grade
      };
    }
    
    const totalGrade = GameUtils.calculateTotalGrade(
      playerEntry.totalScore,
      totalStudents,
      playerRank
    );
    
    return {
      totalScore: playerEntry.totalScore,
      totalRank: playerRank,
      totalGrade: totalGrade,
      subjects: subjectRankings,
      totalStudents: totalStudents
    };
  }
  
  // 显示成绩单
  showReportCard(playerRanking, ranking) {
    const resultPanel = document.getElementById('result-panel');
    const resultTitle = document.getElementById('result-title');
    const resultContent = document.getElementById('result-content');
    const confirmBtn = resultPanel.querySelector('button');
    
    // 隐藏其他面板
    this.closeAllPanels();
    
    // 显示结果面板
    resultTitle.textContent = '考试成绩单';
    
    // 构建成绩单HTML
    let html = `
      <div class="report-card">
        <div class="report-header">
          <h3>考试结果</h3>
          <p>考试日期: ${new Date(this.gameState.gameTime.year, this.gameState.gameTime.month - 1, this.gameState.gameTime.day).toLocaleDateString('zh-CN')}</p>
        </div>
        
        <div class="total-score-section">
          <h4>总成绩</h4>
          <div class="score-display">
            <span class="score-value">${playerRanking.totalScore}</span>
            <span class="score-grade grade-${playerRanking.totalGrade}">${playerRanking.totalGrade}</span>
          </div>
          <p>年级排名: <strong>${playerRanking.totalRank}</strong> / ${playerRanking.totalStudents}</p>
        </div>
        
        <div class="subjects-section">
          <h4>各科成绩</h4>
          <table class="subject-table">
            <thead>
              <tr>
                <th>科目</th>
                <th>成绩</th>
                <th>等级</th>
                <th>排名</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    // 添加各科成绩
    const subjectNames = {
      chinese: '语文',
      math: '数学',
      english: '英语',
      politics: '政治',
      history: '历史',
      physics: '物理',
      chemistry: '化学',
      biology: '生物',
      geography: '地理',
      sports: '体育'
    };
    
    for (const [subject, data] of Object.entries(playerRanking.subjects)) {
      html += `
        <tr>
          <td>${subjectNames[subject] || subject}</td>
          <td>${data.score}</td>
          <td class="grade-${data.grade}">${data.grade}</td>
          <td>${data.rank}</td>
        </tr>
      `;
    }
    
    html += `
            </tbody>
          </table>
        </div>
        
        <div class="top-students-section">
          <h4>年级前三十</h4>
          <div class="top-students-list">
    `;
    
    // 添加年级前三十
    const topStudents = ranking.slice(0, 30);
    for (let i = 0; i < topStudents.length; i++) {
      const student = topStudents[i];
      const isPlayer = student.isPlayer;
      html += `
        <div class="top-student-item ${isPlayer ? 'player-highlight' : ''}">
          <span class="rank">${i + 1}</span>
          <span class="name">${isPlayer ? '玩家' : student.name}</span>
          <span class="score">${student.totalScore}</span>
        </div>
      `;
    }
    
    html += `
          </div>
        </div>
        
        <div class="chart-section">
          <h4>排名趋势</h4>
          <canvas id="ranking-chart" width="600" height="300"></canvas>
        </div>
      </div>
    `;
    
    resultContent.innerHTML = html;
    
    // 设置按钮文字
    if (confirmBtn) {
      confirmBtn.textContent = '确认';
    }
    
    resultPanel.style.display = 'block';
    
    // 设置事件为活跃状态，防止在成绩单显示时推进一天
    this.isEventActive = true;
    
    // 绘制排名折线图
    setTimeout(() => {
      this.drawRankingChart();
    }, 100);
  }
  
  // 绘制排名折线图
  drawRankingChart() {
    const canvas = document.getElementById('ranking-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const examHistory = this.gameState.examHistory;
    
    if (examHistory.length === 0) return;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 设置图表边距
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = canvas.width - margin.left - margin.right;
    const chartHeight = canvas.height - margin.top - margin.bottom;
    
    // 获取数据
    const labels = examHistory.map((_, index) => `第${index + 1}次`);
    const data = examHistory.map(h => h.playerRanking.totalRank);
    const maxRank = this.gameState.gradeStudentCount;
    
    // 计算比例
    const xStep = chartWidth / (labels.length - 1 || 1);
    const yScale = chartHeight / maxRank;
    
    // 绘制坐标轴
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    
    // Y轴
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, canvas.height - margin.bottom);
    ctx.stroke();
    
    // X轴
    ctx.beginPath();
    ctx.moveTo(margin.left, canvas.height - margin.bottom);
    ctx.lineTo(canvas.width - margin.right, canvas.height - margin.bottom);
    ctx.stroke();
    
    // 绘制Y轴刻度和标签
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    const yStep = Math.ceil(maxRank / 10);
    for (let i = 0; i <= maxRank; i += yStep) {
      const y = canvas.height - margin.bottom - i * yScale;
      ctx.fillText(i.toString(), margin.left - 10, y);
      
      // 绘制网格线
      ctx.strokeStyle = '#eee';
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(canvas.width - margin.right, y);
      ctx.stroke();
    }
    
    // 绘制X轴标签
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    labels.forEach((label, index) => {
      const x = margin.left + index * xStep;
      ctx.fillText(label, x, canvas.height - margin.bottom + 10);
    });
    
    // 绘制折线
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((rank, index) => {
      const x = margin.left + index * xStep;
      const y = canvas.height - margin.bottom - rank * yScale;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // 绘制数据点
    ctx.fillStyle = '#2196F3';
    data.forEach((rank, index) => {
      const x = margin.left + index * xStep;
      const y = canvas.height - margin.bottom - rank * yScale;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // 添加标题
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('考试排名趋势图', canvas.width / 2, 10);
  }
  
  // 结束多日事件
  endMultiDayEvent() {
    if (this.activeMultiDayEvent) {
      this.addLog(`${this.activeMultiDayEvent.title}已完成`, 'success');
      this.activeMultiDayEvent = null;
      this.multiDayEventProgress = 0;
      
      // 推进时间到下一天
      this.advanceGameTime();
      this.updateTimeDisplay();
      this.updatePlayerStats();
    }
  }
  
  // 跳过当前多日事件
  skipMultiDayEvent() {
    if (this.activeMultiDayEvent) {
      this.addLog(`跳过了${this.activeMultiDayEvent.title}`, 'warning');
      this.activeMultiDayEvent = null;
      this.multiDayEventProgress = 0;
      
      // 推进时间到下一天
      this.advanceGameTime();
      this.updateTimeDisplay();
      this.updatePlayerStats();
    }
  }
}

const game = new GameController();

function startNewGame() {
  game.startNewGame();
}

function showChangelog() {
  game.showChangelog();
}

function backToMainMenu() {
  game.backToMainMenu();
}

function proceedToNext() {
  game.proceedToNext();
}

function confirmTalentAllocation() {
  game.confirmTalentAllocation();
}

function showDailyActions() {
  game.showDailyActions();
}

function showAcademicPanel() {
  game.showAcademicPanel();
}

function showSocialPanel() {
  game.showSocialPanel();
}

function backToGame() {
  game.backToGame();
}

// 切换导航面板部分
function toggleNavSection(sectionName) {
  // 获取当前点击的导航项
  const navItems = document.querySelectorAll('.nav-item');
  const clickedItem = event.currentTarget;
  
  // 切换激活状态
  navItems.forEach(item => {
    if (item === clickedItem) {
      item.classList.toggle('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // 隐藏所有面板部分
  const sections = document.querySelectorAll('.nav-section');
  sections.forEach(section => {
    section.style.display = 'none';
  });
  
  // 显示对应的部分，如果该项是激活状态
  const sectionElement = document.getElementById(`${sectionName}-section`);
  if (clickedItem.classList.contains('active')) {
    sectionElement.style.display = 'block';
  } else {
    sectionElement.style.display = 'none';
  }
}

// 更新面板内容的函数
function updateNavPanels() {
  // 确保玩家属性面板始终显示最新数据
  if (game && game.gameState) {
    game.updatePlayerStats();
  }
}

function advanceDay() {
  game.advanceDay();
}

function refreshQuote() {
  game.refreshQuote();
}

function editQuote() {
  game.editQuote();
}

// 切换左侧导航面板折叠状态
function toggleNavPanel() {
  const navPanel = document.getElementById('nav-panel');
  const collapseIcon = document.getElementById('nav-collapse-icon');
  
  navPanel.classList.toggle('collapsed');
  
  if (navPanel.classList.contains('collapsed')) {
    collapseIcon.textContent = '▶';
  } else {
    collapseIcon.textContent = '◀';
  }
}

// 切换右侧日志面板折叠状态
function toggleLogPanel() {
  const logPanel = document.getElementById('log-panel');
  const collapseIcon = document.getElementById('log-collapse-icon');
  
  logPanel.classList.toggle('collapsed');
  
  if (logPanel.classList.contains('collapsed')) {
    collapseIcon.textContent = '◀';
  } else {
    collapseIcon.textContent = '▶';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  game.init();
});
