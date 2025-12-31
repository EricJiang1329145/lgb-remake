// 游戏状态变量
let grid = [];
let clicksLeft = 33;
let timeLeft = 240; // 4分钟 = 240秒
let currentScore = 0.00;
let flippedCount = 0;
let timer = null;
let gameActive = false;

// DOM元素
const gridElement = document.getElementById('grid');
const clicksLeftElement = document.getElementById('clicks-left');
const timeLeftElement = document.getElementById('time-left');
const currentScoreElement = document.getElementById('current-score');
const flippedCountElement = document.getElementById('flipped-count');
const gameOverElement = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const gameOverMessageElement = document.getElementById('game-over-message');
const resetButton = document.getElementById('reset-btn');

// 初始化游戏
function initGame() {
    // 重置游戏状态
    clicksLeft = 33;
    timeLeft = 240;
    currentScore = 0.00;
    flippedCount = 0;
    grid = [];
    gameActive = true;
    
    // 清空网格
    gridElement.innerHTML = '';
    
    // 隐藏游戏结束界面
    gameOverElement.classList.add('hidden');
    
    // 更新UI
    updateUI();
    
    // 创建7x7网格
    createGrid();
    
    // 启动计时器
    startTimer();
}

// 创建7x7网格
function createGrid() {
    // 生成随机的格子代价和类型
    generateGridData();
    
    // 创建网格元素
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
            const cellIndex = row * 7 + col;
            const cellData = grid[cellIndex];
            
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = cellIndex;
            
            // 不显示代价值
            const costElement = document.createElement('div');
            costElement.className = 'cost';
            costElement.textContent = '';
            cell.appendChild(costElement);
            
            // 添加点击事件
            cell.addEventListener('click', () => handleCellClick(row, col));
            
            gridElement.appendChild(cell);
        }
    }
}

// 生成网格数据
function generateGridData() {
    grid = [];
    
    // 随机选择一个位置作为特殊格子（4分）
    const specialIndex = Math.floor(Math.random() * 49);
    
    // 生成49个格子
    for (let i = 0; i < 49; i++) {
        // 随机代价值 1-6
        const cost = Math.floor(Math.random() * 6) + 1;
        
        const isSpecial = (i === specialIndex);
        
        grid.push({
            originalCost: cost,
            cost: cost,
            isSpecial: isSpecial, // 是否为4分特殊格子
            score: isSpecial ? 4 : 2, // 分数
            status: 'default', // default, wa, nec, ac
            partialScore: 0.00, // 部分得分
            previousStatus: null // 之前的状态
        });
    }
}

// 处理格子点击
function handleCellClick(row, col) {
    if (!gameActive) return;
    
    const index = row * 7 + col;
    const cellData = grid[index];
    
    // 检查是否还有点击次数
    if (clicksLeft <= 0) return;
    
    // 检查格子是否已经AC
    if (cellData.status === 'ac') return;
    
    // 减少点击次数
    clicksLeft--;
    
    // 记录点击前的分数
    const previousScore = currentScore;
    
    // 减少中心格子代价
    cellData.cost -= 2;
    
    // 更新中心格子状态
    updateCellStatus(index);
    
    // 更新UI
    updateAllCellDisplays();
    updateUI();
    
    // 延迟0.1秒后影响相邻格子（连锁机制）
    setTimeout(() => {
        if (gameActive) { // 确保游戏仍在进行中
            affectAdjacentCells(row, col);
            
            // 更新相邻格子的状态和UI
            updateAllCellDisplays();
            updateUI();
            
            // 检查游戏结束条件
            checkGameEnd();
        }
    }, 100); // 0.1秒延迟
    
    // 检查游戏结束条件（点击次数用完的检查仍需立即执行）
    if (clicksLeft <= 0) {
        checkGameEnd();
    }
}

// 影响相邻格子
function affectAdjacentCells(centerRow, centerCol) {
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
            const adjacentCell = grid[adjacentIndex];
            
            // 如果相邻格子未AC，减少其代价 (影响力度较小)
            if (adjacentCell.status !== 'ac') {
                adjacentCell.cost -= 1; // 相邻格子只减少1点代价
                // 更新受影响格子的状态
                updateCellStatus(adjacentIndex);
            }
        }
    }
}

// 更新所有格子显示
function updateAllCellDisplays() {
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
            const index = row * 7 + col;
            updateCellDisplay(row, col);
        }
    }
}

// 翻开格子
function flipCell(row, col) {
    const index = row * 7 + col;
    const cellData = grid[index];
    
    // 设置为AC状态
    cellData.status = 'ac';
    
    // 增加翻开格子数量
    if (cellData.previousStatus !== 'ac') {
        flippedCount++;
    }
    
    // 更新UI
    updateCellDisplay(row, col);
    updateUI();
}

// 更新格子状态
function updateCellStatus(index) {
    const cellData = grid[index];
    
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
            currentScore += cellData.partialScore;
        }
    } else {
        // AC: 代价小于等于0
        cellData.status = 'ac';
        
        // 如果之前不是AC状态，则移除之前的NEC部分得分（如果有的话），并添加满分
        if (previousStatus !== 'ac') {
            if (previousStatus === 'nec') {
                // 如果之前是NEC，先减去部分得分，再加上满分
                currentScore = currentScore - previousScore + parseFloat(cellData.score.toFixed(2));
            } else {
                // 如果之前不是NEC也不是AC，直接加满分
                currentScore += parseFloat(cellData.score.toFixed(2));
            }
            flippedCount++;
        }
    }
}

// 更新格子显示
function updateCellDisplay(row, col) {
    const index = row * 7 + col;
    const cellData = grid[index];
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
function updateUI() {
    clicksLeftElement.textContent = clicksLeft;
    timeLeftElement.textContent = timeLeft;
    currentScoreElement.textContent = currentScore.toFixed(2);
    flippedCountElement.textContent = `${flippedCount}/49`;
}

// 启动计时器
function startTimer() {
    if (timer) {
        clearInterval(timer);
    }
    
    timer = setInterval(() => {
        if (!gameActive) {
            clearInterval(timer);
            return;
        }
        
        timeLeft--;
        timeLeftElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame('时间耗尽！');
        }
    }, 1000);
}

// 检查游戏结束条件
function checkGameEnd() {
    if (clicksLeft <= 0) {
        endGame('点击次数用完！策略性地使用有限的点击次数是关键！');
    } else if (flippedCount >= 49) {
        endGame('所有格子都已翻开！');
    }
}

// 结束游戏
function endGame(message) {
    gameActive = false;
    clearInterval(timer);
    
    finalScoreElement.textContent = currentScore.toFixed(2);
    gameOverMessageElement.textContent = message;
    
    // 根据得分显示性能评价
    const performanceMessageElement = document.getElementById('performance-message');
    if (currentScore >= 80) {
        performanceMessageElement.textContent = '卓越表现！在仅33次点击的限制下达到高分，您是真正的策略大师！';
    } else if (currentScore >= 70) {
        performanceMessageElement.textContent = '优秀成绩！在有限点击次数下策略运用得当！';
    } else if (currentScore >= 60) {
        performanceMessageElement.textContent = '良好表现！继续练习以优化点击策略！';
    } else {
        performanceMessageElement.textContent = '继续练习，在33次点击限制下掌握连锁影响策略可大幅提升分数！';
    }
    
    // 在显示游戏结束界面之前添加关闭按钮事件监听器
    const gameOverCloseBtn = document.getElementById('game-over-close-btn');
    if (gameOverCloseBtn) {
        gameOverCloseBtn.addEventListener('click', () => {
            // 重新开始游戏
            initGame();
        });
    }
    
    gameOverElement.classList.remove('hidden');
}

// 重置游戏
resetButton.addEventListener('click', initGame);

// 自动答题功能
const autoSolveButton = document.getElementById('auto-solve-btn');
let autoSolveInterval = null;

// 自动答题功能
autoSolveButton.addEventListener('click', () => {
    if (autoSolveInterval) {
        // 如果正在自动答题，则停止
        clearInterval(autoSolveInterval);
        autoSolveInterval = null;
        autoSolveButton.className = 'btn blue';
        autoSolveButton.textContent = '自动答题';
    } else {
        // 开始自动答题
        if (gameActive && clicksLeft > 0) {
            autoSolveButton.className = 'btn blue running';
            autoSolveButton.textContent = '停止自动答题';
            
            autoSolveInterval = setInterval(() => {
                if (!gameActive || clicksLeft <= 0) {
                    // 如果游戏结束或点击次数用完，停止自动答题
                    clearInterval(autoSolveInterval);
                    autoSolveInterval = null;
                    autoSolveButton.className = 'btn blue';
                    autoSolveButton.textContent = '自动答题';
                    return;
                }
                
                // 随机点击一个非AC的格子
                const nonACCells = [];
                for (let row = 0; row < 7; row++) {
                    for (let col = 0; col < 7; col++) {
                        const index = row * 7 + col;
                        if (grid[index].status !== 'ac') {
                            nonACCells.push({row, col});
                        }
                    }
                }
                
                if (nonACCells.length > 0) {
                    const randomIndex = Math.floor(Math.random() * nonACCells.length);
                    const cell = nonACCells[randomIndex];
                    handleCellClick(cell.row, cell.col);
                } else {
                    // 如果没有非AC格子，停止自动答题
                    clearInterval(autoSolveInterval);
                    autoSolveInterval = null;
                    autoSolveButton.className = 'btn blue';
                    autoSolveButton.textContent = '自动答题';
                }
            }, 300); // 每0.3秒点击一次
        }
    }
});

// 帮助模态框功能
const helpIcon = document.getElementById('help-icon');
const helpModal = document.getElementById('help-modal');
const closeHelp = document.getElementById('close-help');

// 打开帮助模态框
helpIcon.addEventListener('click', () => {
    helpModal.classList.remove('hidden');
});

// 关闭帮助模态框
closeHelp.addEventListener('click', () => {
    helpModal.classList.add('hidden');
});

// 点击模态框外部区域关闭
window.addEventListener('click', (event) => {
    if (event.target === helpModal) {
        helpModal.classList.add('hidden');
    }
});

// 初始化游戏
window.onload = initGame;