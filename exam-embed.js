// 考试嵌入模块 - 将exam-test中的策略游戏嵌入到主游戏中
class ExamEmbedSystem {
  constructor(gameController) {
    this.gameController = gameController;
    this.currentExam = null;
    this.examResults = {};
    
    // 游戏状态变量
    this.grid = [];
    this.clicksLeft = 0;
    this.clickLimit = 0;
    this.timeLeft = 240; // 4分钟 = 240秒
    this.currentScore = 0.00;
    this.flippedCount = 0;
    this.timer = null;
    this.gameActive = false;
  }

  // 开始考试
  startExam(examType, subject) {
    this.currentExam = {
      type: examType,
      subject: subject,
      startTime: Date.now()
    };
    
    // 显示考试界面
    this.showExamInterface(examType, subject);
  }

  // 显示考试界面
  showExamInterface(examType, subject) {
    // 隐藏其他面板
    this.gameController.closeAllPanels();
    
    // 隐藏推进一天按钮
    const quickActions = document.querySelector('.quick-actions');
    if (quickActions) {
      quickActions.style.display = 'none';
    }
    
    // 显示考试面板
    const examPanel = document.getElementById('exam-panel');
    const examTitle = document.getElementById('exam-title');
    const examSubjects = document.getElementById('exam-subjects');
    
    // 设置考试标题
    examTitle.textContent = `${this.getExamTypeName(examType)} - ${this.getSubjectName(subject)}`;
    
    // 嵌入考试游戏 - 直接集成游戏逻辑
    examSubjects.innerHTML = `
      <div class="exam-game-container">
        <div class="game-info">
          <div class="info-item">
            <span>剩余点击次数:</span>
            <span id="clicks-left">0</span>
          </div>
          <div class="info-item">
            <span>剩余时间:</span>
            <span id="time-left">240</span>
          </div>
          <div class="info-item">
            <span>当前得分:</span>
            <span id="current-score">0.00</span>
          </div>
          <div class="info-item">
            <span>目标分数:</span>
            <span id="target-score">70+</span>
          </div>
          <div class="info-item">
            <span>已翻开格子:</span>
            <span id="flipped-count">0</span>/49
          </div>
        </div>
        
        <div class="game-board">
          <div id="grid" class="grid"></div>
        </div>

        <div class="controls">
          <button id="reset-btn" class="btn gray">重新开始</button>
          <button id="auto-solve-btn" class="btn blue">自动答题</button>
          <button id="submit-btn" class="btn green">交卷</button>
        </div>

        <div class="instructions">
          <h3>游戏说明</h3>
          <ul>
            <li>点击格子可减少其代价值，代价值降为0或以下时格子变为AC状态并获得分数</li>
            <li>每次点击不仅减少当前格子的代价，还会随机影响2-4个周围格子（包括对角线方向）的代价</li>
            <li>特殊格子（4分）随机出现，优先处理高分格子可获得更高分数</li>
            <li>WA状态得0分，NEC状态获得部分分数，AC状态获得满分</li>
            <li>仅有<span id="click-limit-info">0</span>次点击机会，合理规划点击顺序，利用随机连锁影响机制最大化得分</li>
          </ul>
        </div>

        <div id="game-over" class="game-over hidden">
          <h2>游戏结束</h2>
          <p>最终得分: <span id="final-score">0.00</span></p>
          <p id="game-over-message"></p>
          <p id="performance-message"></p>
        </div>
      </div>
    `;
    
    examPanel.style.display = 'block';
    
    // 初始化游戏
    this.initGame();
  }

  // 获取考试类型名称
  getExamTypeName(examType) {
    const examTypeMap = {
      'monthly': '月考',
      'midterm': '期中考试',
      'final': '期末考试',
      'biology_geography': '生地会考',
      'middle': '中考'
    };
    return examTypeMap[examType] || examType;
  }

  // 获取科目名称
  getSubjectName(subject) {
    const subjectMap = {
      'chinese': '语文',
      'math': '数学',
      'english': '英语',
      'politics': '政治',
      'history': '历史',
      'physics': '物理',
      'chemistry': '化学',
      'biology': '生物',
      'geography': '地理',
      'sports': '体育'
    };
    return subjectMap[subject] || subject;
  }

  // 提交考试
  async submitExam() {
    if (!this.currentExam) return;

    try {
      // 直接从当前游戏状态获取结果
      const gameResult = this.getCurrentGameResult();
      
      // 计算考试成绩
      const examScore = this.calculateExamScore(gameResult, this.currentExam.subject);
 // 保存考试结果
      this.examResults[`${this.currentExam.type}_${this.currentExam.subject}`] = {
        score: examScore,
        rawResult: gameResult,
        timestamp: Date.now()
      };
      
      // 更新玩家成绩
      this.updatePlayerAcademic(this.currentExam.subject, examScore);
      
      // 显示结果
      this.showExamResults(examScore);
      
      // 结束当前考试
      this.endCurrentExam();
      
    } catch (error) {
      console.error('提交考试失败:', error);
      // 如果无法获取结果，使用默认计算方法
      const defaultScore = this.calculateDefaultExamScore();
      this.showExamResults(defaultScore);
    }
  }

  // 获取当前游戏结果
  getCurrentGameResult() {
    // 基于当前游戏状态返回结果
    return {
      score: this.currentScore, // 使用当前游戏得分
      maxScore: 100, // 最大可能分数
      timeSpent: 240 - this.timeLeft, // 花费时间
      clicksUsed: this.clickLimit - this.clicksLeft, // 使用的点击次数
      flippedCount: this.flippedCount, // 翻开的格子数
      totalCells: 49, // 总格子数
      hasClicked: (this.clickLimit - this.clicksLeft) > 0 // 是否点击过格子
    };
  }

  // 计算考试成绩
  calculateExamScore(gameResult, subject) {
    // 如果玩家没有点击过格子，直接给0分
    if (!gameResult.hasClicked) {
      return 0;
    }
    
    // 基于游戏表现计算基础分数
    let baseScore = gameResult.score || 70; // 默认70分
    
    // 定义科目与能力的权重关系
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
    
    const weights = subjectWeights[subject] || { memory: 0.25, comprehension: 0.25, focus: 0.25, mindset: 0.25 };
    
    // 根据玩家能力调整分数
    const playerStats = this.gameController.gameState.player;
    if (playerStats && playerStats.abilities) {
      const { abilities } = playerStats;
      
      // 计算加权能力值
      const weightedAbility = 
        (abilities.memory * weights.memory) +
        (abilities.comprehension * weights.comprehension) +
        (abilities.focus * weights.focus) +
        (abilities.mindset * weights.mindset);
      
      // 调整权重：让游戏表现分数占主导（80%），能力值作为辅助（20%）
      // 这样玩家点格子获得的分数对最终成绩影响更大，更符合直觉
      baseScore = (baseScore * 0.8) + (weightedAbility * 0.2);
    }
    
    // 应用角色特殊效果标签增益
    baseScore = this.applySpecialEffects(baseScore, subject);
    
    // 确保分数在合理范围内
    baseScore = Math.max(0, Math.min(100, baseScore));
    
    // 根据科目满分进行换算
    const subjectFullScore = this.getSubjectFullScore(subject);
    const convertedScore = (baseScore / 100) * subjectFullScore;
    
    return Math.round(convertedScore);
  }

  // 获取科目满分
  getSubjectFullScore(subject) {
    const subjects = window.SUBJECTS || {
      chinese: { name: '语文', fullScore: 120 },
      math: { name: '数学', fullScore: 100 },
      english: { name: '英语', fullScore: 100 },
      politics: { name: '政治', fullScore: 50 },
      history: { name: '历史', fullScore: 70 },
      physics: { name: '物理', fullScore: 70 },
      chemistry: { name: '化学', fullScore: 70 },
      biology: { name: '生物', fullScore: 100 },
      geography: { name: '地理', fullScore: 100 },
      sports: { name: '体育', fullScore: 50 }
    };
    
    return subjects[subject]?.fullScore || 100;
  }

  // 计算默认考试成绩
  calculateDefaultExamScore() {
    // 检查当前考试是否存在
    if (!this.currentExam || !this.currentExam.subject) {
      console.warn('当前考试信息不存在，返回默认分数');
      return 70;
    }
    
    // 基于玩家当前能力计算默认分数
    const playerStats = this.gameController.gameState.player;
    if (!playerStats) return 70;
    
    const { abilities } = playerStats;
    
    // 定义科目与能力的权重关系
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
    
    const weights = subjectWeights[this.currentExam.subject] || { memory: 0.25, comprehension: 0.25, focus: 0.25, mindset: 0.25 };
    
    // 计算加权能力值
    const weightedAbility = 
      (abilities.memory * weights.memory) +
      (abilities.comprehension * weights.comprehension) +
      (abilities.focus * weights.focus) +
      (abilities.mindset * weights.mindset);
    
    // 添加随机因素
    let score = weightedAbility + (Math.random() - 0.5) * 15;
    
    return Math.max(0, Math.min(100, score));
  }

  // 更新玩家学术成绩
  updatePlayerAcademic(subject, score) {
    if (!this.gameController.gameState.player) return;
    
    // 初始化examResults对象
    if (!this.gameController.gameState.player.examResults) {
      this.gameController.gameState.player.examResults = {};
    }
    
    // 保存考试结果
    this.gameController.gameState.player.examResults[subject] = {
      score: score,
      timestamp: Date.now()
    };
    
    // 更新UI显示
    const scoreElement = document.getElementById(`academic-${subject}`) || 
                         document.getElementById(`academic-${subject}-val`);
    if (scoreElement) {
      scoreElement.textContent = score;
    }
    
    // 记录到游戏日志
    this.gameController.addLog(`${this.getSubjectName(subject)}考试完成，得分：${score}`, 'exam');
  }

  // 应用角色特殊效果标签增益
  applySpecialEffects(baseScore, subject) {
    const playerStats = this.gameController.gameState.player;
    if (!playerStats || !playerStats.special) {
      return baseScore;
    }
    
    let adjustedScore = baseScore;
    const specialEffects = playerStats.special;
    
    // 根据不同特殊效果调整分数
    for (const [effectName, effectValue] of Object.entries(specialEffects)) {
      switch (effectName) {
        case 'examBonus':
          // 通用考试增益
          adjustedScore += effectValue;
          break;
        case 'subjectBonus':
          // 科目特定增益（需要更详细的数据结构）
          if (effectValue && effectValue[subject]) {
            adjustedScore += effectValue[subject];
          }
          break;
        case 'mindsetBonus':
          // 考试心态增益
          const mindsetBonus = (playerStats.abilities.mindset || 50) * 0.02;
          adjustedScore += mindsetBonus * effectValue;
          break;
        case 'focusBonus':
          // 专注力增益
          const focusBonus = (playerStats.abilities.focus || 50) * 0.015;
          adjustedScore += focusBonus * effectValue;
          break;
        default:
          // 其他特殊效果可以在这里添加
          break;
      }
    }
    
    return adjustedScore;
  }

  // 初始化游戏
  initGame() {
    // 重置游戏状态
    // 获取考试配置
    const defaultClickLimit = 333;
    const defaultTimeLimit = 240;
    let clickLimit = defaultClickLimit;
    let timeLimit = defaultTimeLimit;
    
    // 尝试从游戏控制器获取考试配置
    if (this.gameController && this.gameController.gameState && this.gameController.gameState.examMechanics) {
      const examConfig = this.gameController.gameState.examMechanics;
      // 使用统一的点击次数设置，不再区分考试类型
      if (examConfig.clickLimit) {
        // 优先使用统一配置，如果没有则使用默认值
        clickLimit = examConfig.clickLimit.unified || Object.values(examConfig.clickLimit)[0] || defaultClickLimit;
      }
      if (examConfig.timeLimit) {
        // 统一时间设置，不再区分考试类型
        timeLimit = (examConfig.timeLimit.unified || Object.values(examConfig.timeLimit)[0] || defaultTimeLimit / 60) * 60; // 转换为秒
      }
    }
    
    this.clickLimit = clickLimit;
    this.clicksLeft = clickLimit;
    this.timeLeft = timeLimit;
    this.currentScore = 0.00;
    this.flippedCount = 0;
    this.grid = [];
    this.gameActive = true;
    
    // 更新点击次数限制信息
    const clickLimitInfoElement = document.getElementById('click-limit-info');
    if (clickLimitInfoElement) {
      clickLimitInfoElement.textContent = clickLimit;
    }
    
    // 清空网格
    const gridElement = document.getElementById('grid');
    if (gridElement) {
      gridElement.innerHTML = '';
    }
    
    // 隐藏游戏结束界面
    const gameOverElement = document.getElementById('game-over');
    if (gameOverElement) {
      gameOverElement.classList.add('hidden');
    }
    
    // 更新UI
    this.updateUI();
    
    // 创建7x7网格
    this.createGrid();
    
    // 启动计时器
    this.startTimer();
    
    // 添加按钮事件监听器
    this.addEventListeners();
  }

  // 添加事件监听器
  addEventListeners() {
    const resetButton = document.getElementById('reset-btn');
    if (resetButton) {
      resetButton.addEventListener('click', () => this.initGame());
    }

    const autoSolveButton = document.getElementById('auto-solve-btn');
    let autoSolveInterval = null;
    if (autoSolveButton) {
      autoSolveButton.addEventListener('click', () => {
        if (autoSolveInterval) {
          // 如果正在自动答题，则停止
          clearInterval(autoSolveInterval);
          autoSolveInterval = null;
          autoSolveButton.classList.remove('running');
          autoSolveButton.textContent = '自动答题';
        } else {
          // 开始自动答题
          if (this.gameActive && this.clicksLeft > 0) {
            autoSolveButton.classList.add('running');
            autoSolveButton.textContent = '停止自动答题';
            
            // 获取自动答题速度配置
            let autoSolveSpeed = 50; // 默认0.05秒
            if (this.gameController && this.gameController.gameState && this.gameController.gameState.examMechanics) {
              const examConfig = this.gameController.gameState.examMechanics;
              if (examConfig.autoSolveSpeed) {
                autoSolveSpeed = examConfig.autoSolveSpeed;
              }
            }
            
            autoSolveInterval = setInterval(() => {
              if (!this.gameActive || this.clicksLeft <= 0) {
                // 如果游戏结束或点击次数用完，停止自动答题
                clearInterval(autoSolveInterval);
                autoSolveInterval = null;
                autoSolveButton.classList.remove('running');
                autoSolveButton.textContent = '自动答题';
                return;
              }
              
              // 随机点击一个非AC的格子
              const nonACCells = [];
              for (let row = 0; row < 7; row++) {
                for (let col = 0; col < 7; col++) {
                  const index = row * 7 + col;
                  if (this.grid[index].status !== 'ac') {
                    nonACCells.push({row, col});
                  }
                }
              }
              
              if (nonACCells.length > 0) {
                const randomIndex = Math.floor(Math.random() * nonACCells.length);
                const cell = nonACCells[randomIndex];
                this.handleCellClick(cell.row, cell.col);
              } else {
                // 如果没有非AC格子，停止自动答题
                clearInterval(autoSolveInterval);
                autoSolveInterval = null;
                autoSolveButton.classList.remove('running');
                autoSolveButton.textContent = '自动答题';
              }
            }, autoSolveSpeed); // 使用配置的自动答题速度
          }
        }
      });
    }

    // 添加交卷按钮事件监听器
    const submitButton = document.getElementById('submit-btn');
    if (submitButton) {
      submitButton.addEventListener('click', () => this.submitExam());
    }
  }

  // 创建7x7网格
  createGrid() {
    // 生成随机的格子代价和类型
    this.generateGridData();
    
    const gridElement = document.getElementById('grid');
    if (!gridElement) return;
    
    // 创建网格元素
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const cellIndex = row * 7 + col;
        const cellData = this.grid[cellIndex];
        
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = cellIndex;
        
        // 不显示代价值
        const costElement = document.createElement('div');
        costElement.className = 'cost';
        costElement.textContent = '';
        cell.appendChild(costElement);
        
        // 添加点击事件
        cell.addEventListener('click', () => this.handleCellClick(row, col));
        
        gridElement.appendChild(cell);
      }
    }
  }

  // 生成网格数据
  generateGridData() {
    this.grid = [];
    
    // 随机选择一个位置作为特殊格子（4分）
    const specialIndex = Math.floor(Math.random() * 49);
    
    // 生成49个格子
    for (let i = 0; i < 49; i++) {
      // 随机代价值 1-6
      const cost = Math.floor(Math.random() * 6) + 1;
      
      const isSpecial = (i === specialIndex);
      
      this.grid.push({
        originalCost: cost,
        cost: cost,
        isSpecial: isSpecial, // 是否为4分特殊格子
        score: isSpecial ? 4 : 2, // 分数
        status: 'default', // default, wa, nec, ac
        partialScore: null, // 部分得分，初始为null
        previousStatus: null // 之前的状态
      });
    }
  }

  // 处理格子点击
  handleCellClick(row, col) {
    if (!this.gameActive) return;
    
    const index = row * 7 + col;
    const cellData = this.grid[index];
    
    // 检查是否还有点击次数
    if (this.clicksLeft <= 0) return;
    
    // 检查格子是否已经AC
    if (cellData.status === 'ac') return;
    
    // 减少点击次数
    this.clicksLeft--;
    
    // 记录点击前的分数
    const previousScore = this.currentScore;
    
    // 减少中心格子代价
    cellData.cost -= 2;
    
    // 更新中心格子状态
    this.updateCellStatus(index);
    
    // 更新UI
    this.updateAllCellDisplays();
    this.updateUI();
    
    // 延迟0.1秒后影响相邻格子（连锁机制）
    setTimeout(() => {
      if (this.gameActive) { // 确保游戏仍在进行中
        this.affectAdjacentCells(row, col);
        
        // 更新相邻格子的状态和UI
        this.updateAllCellDisplays();
        this.updateUI();
        
        // 检查游戏结束条件
        this.checkGameEnd();
      }
    }, 100); // 0.1秒延迟
    
    // 检查游戏结束条件（点击次数用完的检查仍需立即执行）
    if (this.clicksLeft <= 0) {
      this.checkGameEnd();
    }
  }

  // 影响相邻格子
  affectAdjacentCells(centerRow, centerCol) {
    // 定义所有8个方向的偏移量 (包括对角线)
    const allDirections = [
      [-1, 0], // 上
      [-1, 1], // 右上
      [0, 1],  // 右
      [1, 1],  // 右下
      [1, 0],  // 下
      [1, -1], // 左下
      [0, -1], // 左
      [-1, -1] // 左上
    ];
    
    // 随机选择2-4个方向
    const numDirections = Math.floor(Math.random() * 3) + 2; // 随机数 2, 3, 或 4
    const selectedDirections = [];
    
    // 随机打乱方向数组并选择前numDirections个
    const shuffledDirections = [...allDirections].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(numDirections, allDirections.length); i++) {
      selectedDirections.push(shuffledDirections[i]);
    }
    
    // 影响选中的方向
    for (const [dRow, dCol] of selectedDirections) {
      const newRow = centerRow + dRow;
      const newCol = centerCol + dCol;
      
      // 检查边界
      if (newRow >= 0 && newRow < 7 && newCol >= 0 && newCol < 7) {
        const adjacentIndex = newRow * 7 + newCol;
        const adjacentCell = this.grid[adjacentIndex];
        
        // 如果相邻格子未AC，减少其代价 (影响力度较小)
        if (adjacentCell.status !== 'ac') {
          adjacentCell.cost -= 1; // 相邻格子只减少1点代价
          // 更新受影响格子的状态
          this.updateCellStatus(adjacentIndex);
        }
      }
    }
  }

  // 更新所有格子显示
  updateAllCellDisplays() {
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const index = row * 7 + col;
        this.updateCellDisplay(row, col);
      }
    }
  }

  // 更新格子状态
  updateCellStatus(index) {
    const cellData = this.grid[index];
    
    // 保存之前的状态
    const previousStatus = cellData.status;
    const previousScore = cellData.partialScore || 0;
    
    // 计算代价消耗比例
    const halfOriginalCost = cellData.originalCost / 2;
    
    if (cellData.cost > halfOriginalCost) {
      // WA: 代价大于原代价的一半
      cellData.status = 'wa';
    } else if (cellData.cost > 0) {
      // NEC: 代价大于0但小于等于原代价的一半
      cellData.status = 'nec';
      
      // 计算部分得分 (1/3 到 2/3 之间的随机值)
      if (!cellData.partialScore) {
        const minScore = cellData.score * (1/3);
        const maxScore = cellData.score * (2/3);
        cellData.partialScore = parseFloat((Math.random() * (maxScore - minScore) + minScore).toFixed(2));
      }
      
      // 如果之前不是NEC状态，则添加部分得分
      if (previousStatus !== 'nec') {
        this.currentScore += cellData.partialScore;
      }
    } else {
      // AC: 代价小于等于0
      cellData.status = 'ac';
      
      // 如果之前不是AC状态，则移除之前的NEC部分得分（如果有的话），并添加满分
      if (previousStatus !== 'ac') {
        if (previousStatus === 'nec') {
          // 如果之前是NEC，先减去部分得分，再加上满分
          this.currentScore = this.currentScore - previousScore + parseFloat(cellData.score.toFixed(2));
        } else {
          // 如果之前不是NEC也不是AC，直接加满分
          this.currentScore += parseFloat(cellData.score.toFixed(2));
        }
        this.flippedCount++;
      }
    }
  }

  // 更新格子显示
  updateCellDisplay(row, col) {
    const index = row * 7 + col;
    const cellData = this.grid[index];
    const cellElement = document.querySelector(`.cell[data-index="${index}"]`);
    
    if (!cellElement) return;
    
    // 重置类名
    cellElement.className = 'cell';
    
    // 根据状态添加类名
    if (cellData.status === 'ac') {
      cellElement.classList.add('ac');
    } else if (cellData.status === 'wa') {
      cellElement.classList.add('wa');
    } else if (cellData.status === 'nec') {
      cellElement.classList.add('nec');
    }
    
    // 更新内容 - 不显示代价值
    const costElement = cellElement.querySelector('.cost');
    if (costElement) {
      costElement.textContent = '';
    }
    
    // 添加状态和分数显示
    let statusElement = cellElement.querySelector('.status');
    if (!statusElement) {
      statusElement = document.createElement('div');
      statusElement.className = 'status';
      cellElement.appendChild(statusElement);
    }
    
    let scoreElement = cellElement.querySelector('.score');
    if (!scoreElement) {
      scoreElement = document.createElement('div');
      scoreElement.className = 'score';
      cellElement.appendChild(scoreElement);
    }
    
    // 显示状态但不显示分值
    if (cellData.status === 'ac') {
      statusElement.textContent = 'AC';
      scoreElement.textContent = '';
    } else if (cellData.status === 'wa') {
      statusElement.textContent = 'WA';
      scoreElement.textContent = '';
    } else if (cellData.status === 'nec') {
      statusElement.textContent = 'NEC';
      scoreElement.textContent = '';
    } else {
      statusElement.textContent = '';
      scoreElement.textContent = '';
    }
  }

  // 更新UI显示
  updateUI() {
    const clicksLeftElement = document.getElementById('clicks-left');
    const timeLeftElement = document.getElementById('time-left');
    const currentScoreElement = document.getElementById('current-score');
    const flippedCountElement = document.getElementById('flipped-count');
    
    if (clicksLeftElement) clicksLeftElement.textContent = this.clicksLeft;
    if (timeLeftElement) timeLeftElement.textContent = this.timeLeft;
    if (currentScoreElement) currentScoreElement.textContent = this.currentScore.toFixed(2);
    if (flippedCountElement) flippedCountElement.textContent = `${this.flippedCount}/49`;
  }

  // 启动计时器
  startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    this.timer = setInterval(() => {
      if (!this.gameActive) {
        clearInterval(this.timer);
        return;
      }
      
      this.timeLeft--;
      const timeLeftElement = document.getElementById('time-left');
      if (timeLeftElement) timeLeftElement.textContent = this.timeLeft;
      
      if (this.timeLeft <= 0) {
        this.endGame('时间耗尽！');
      }
    }, 1000);
  }

  // 检查游戏结束条件
  checkGameEnd() {
    if (this.clicksLeft <= 0) {
      this.endGame('点击次数用完！策略性地使用有限的点击次数是关键！');
    } else if (this.flippedCount >= 49) {
      this.endGame('所有格子都已翻开！');
    }
  }

  // 结束游戏
  endGame(message) {
    this.gameActive = false;
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    const finalScoreElement = document.getElementById('final-score');
    const gameOverMessageElement = document.getElementById('game-over-message');
    const gameOverElement = document.getElementById('game-over');
    const performanceMessageElement = document.getElementById('performance-message');
    
    if (finalScoreElement) finalScoreElement.textContent = this.currentScore.toFixed(2);
    if (gameOverMessageElement) gameOverMessageElement.textContent = message;
    
    // 根据得分显示性能评价
    if (performanceMessageElement) {
      if (this.currentScore >= 80) {
        performanceMessageElement.textContent = `卓越表现！在仅${this.clickLimit}次点击的限制下达到高分，您是真正的策略大师！`;
      } else if (this.currentScore >= 70) {
        performanceMessageElement.textContent = '优秀成绩！在有限点击次数下策略运用得当！';
      } else if (this.currentScore >= 60) {
        performanceMessageElement.textContent = '良好表现！继续练习以优化点击策略！';
      } else {
        performanceMessageElement.textContent = `继续练习，在${this.clickLimit}次点击限制下掌握连锁影响策略可大幅提升分数！`;
      }
    }
    
    if (gameOverElement) gameOverElement.classList.remove('hidden');
  }

  // 显示考试结果
  showExamResults(score) {
    const examPanel = document.getElementById('exam-panel');
    const resultPanel = document.getElementById('result-panel');
    const resultTitle = document.getElementById('result-title');
    const resultContent = document.getElementById('result-content');
    const confirmBtn = resultPanel.querySelector('button');
    
    // 隐藏考试面板
    examPanel.style.display = 'none';
    
    // 检查是否有下一场考试
    const hasNextExam = this.hasNextExam();
    
    // 显示结果面板
    resultTitle.textContent = '考试结果';
    resultContent.innerHTML = `
      <div class="exam-result">
        <h3>${this.getSubjectName(this.currentExam.subject)} - ${this.getExamTypeName(this.currentExam.type)}</h3>
        <p>得分: <strong>${score}</strong></p>
        <p>满分: ${this.getSubjectFullScore(this.currentExam.subject)}</p>
        <p>等级: ${this.getGradeFromScore(score, this.currentExam.subject)}</p>
      </div>
    `;
    
    // 根据是否有下一场考试设置按钮文字
    if (confirmBtn) {
      confirmBtn.textContent = hasNextExam ? '下一场考试' : '确认';
    }
    
    resultPanel.style.display = 'block';
    
    // 设置事件为活跃状态，防止在成绩单显示时推进一天
    if (this.gameController) {
      this.gameController.isEventActive = true;
    }
    
    // 不要在这里清除currentExam，让endCurrentExam来处理
    // 这样可以确保多科目考试的正确处理
  }

  // 检查是否有下一场考试
  hasNextExam() {
    if (!this.gameController) return false;
    
    const { currentExamSubjects, currentExamIndex } = this.gameController;
    
    // 如果有考试科目列表和当前索引，检查是否还有剩余科目
    if (currentExamSubjects && currentExamIndex !== null) {
      return currentExamIndex + 1 < currentExamSubjects.length;
    }
    
    return false;
  }

  // 根据分数获取等级
  getGradeFromScore(score, subject) {
    const fullScore = this.getSubjectFullScore(subject);
    const percentage = (score / fullScore) * 100;
    
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'B+';
    if (percentage >= 80) return 'B';
    if (percentage >= 75) return 'C+';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  // 结束当前考试
  endCurrentExam() {
    // 停止游戏计时器
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    // 重置游戏状态
    this.gameActive = false;
    this.currentExam = null;
    
    // 隐藏考试面板
    const examPanel = document.getElementById('exam-panel');
    if (examPanel) {
      examPanel.style.display = 'none';
    }
    
    // 如果有游戏结束界面，也隐藏它
    const gameOverElement = document.getElementById('game-over');
    if (gameOverElement) {
      gameOverElement.classList.add('hidden');
    }
    
    // 通知游戏控制器考试已完成
    if (this.gameController && this.gameController.examCompleted) {
      this.gameController.examCompleted();
    }
  }

  // 检查是否在考试期间
  isExamPeriod() {
    return this.currentExam !== null;
  }

  // 获取当前考试信息
  getCurrentExam() {
    return this.currentExam;
  }
}

// 全局实例
let examSystem = null;

// 初始化考试系统
function initExamSystem(gameController) {
  examSystem = new ExamEmbedSystem(gameController);
  
  // 添加submitExam函数到全局作用域
  window.submitExam = function() {
    if (examSystem) {
      examSystem.submitExam();
    }
  };
  
  return examSystem;
}