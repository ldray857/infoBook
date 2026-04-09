let birthdayData = [];
let lastFilteredData = []; 
let selectedMonths = new Set();
let selectedYear = '全部'; // 默认届别为全部

document.addEventListener('DOMContentLoaded', () => {
    initMonthGrid();
    loadData();

    // 1. 届别按钮切换监听
    const yearBtns = document.querySelectorAll('#yearBtnGroup .btn-toggle');
    yearBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // 移除所有按钮的高亮状态
            yearBtns.forEach(b => b.classList.remove('active'));
            // 给当前点击的按钮添加高亮
            e.target.classList.add('active');
            // 更新选中的年份
            selectedYear = e.target.dataset.year;
        });
    });

    // 2. 搜索触发
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    
    // 3. 输入框回车支持
    document.getElementById('nameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
});

// 加载本地 JSON 数据
async function loadData() {
    try {
        const response = await fetch('./data/friends.json');
        if (!response.ok) throw new Error('网络响应错误');
        birthdayData = await response.json();
    } catch (error) {
        document.getElementById('resultsContainer').innerHTML = '<div class="empty-state">❌ 无法加载数据，请检查 data/friends.json 路径是否正确</div>';
    }
}

// 初始化 1-12 月份的点击网格
function initMonthGrid() {
    const grid = document.getElementById('monthGrid');
    for (let i = 1; i <= 12; i++) {
        const val = i.toString().padStart(2, '0');
        const chip = document.createElement('div');
        chip.className = 'month-chip';
        chip.innerText = `${i}月`;
        
        chip.onclick = () => {
            chip.classList.toggle('selected');
            // 如果 Set 里已经有这个月份就删除，没有就添加
            selectedMonths.has(val) ? selectedMonths.delete(val) : selectedMonths.add(val);
        };
        grid.appendChild(chip);
    }
}

// 核心查询逻辑（组合过滤）
function performSearch() {
    if (birthdayData.length === 0) return;

    const selectedDept = document.getElementById('deptSelect').value;
    const nameQuery = document.getElementById('nameInput').value.trim().toLowerCase();

    lastFilteredData = birthdayData.filter(item => {
        // 1. 年份匹配（选了全部就直接 pass，否则对比年份）
        const yearMatch = (selectedYear === '全部' || item.year === selectedYear);
        
        // 2. 部门匹配
        const deptMatch = (selectedDept === '全部' || item.part === selectedDept);
        
        // 3. 昵称匹配（模糊搜索）
        const nameMatch = (nameQuery === '' || item.nickname.toLowerCase().includes(nameQuery));
        
        // 4. 月份匹配（如果没有选任何月份，默认显示全年；如果选了，则看数据是否包含在选中集合里）
        const monthMatch = (selectedMonths.size === 0 || Array.from(selectedMonths).some(m => item.month.includes(m)));

        // 必须同时满足四个条件才会被筛选出来
        return yearMatch && deptMatch && nameMatch && monthMatch;
    });

    renderResults(lastFilteredData);
}

// 渲染卡片结果
function renderResults(data) {
    const container = document.getElementById('resultsContainer');
    const stats = document.getElementById('resultStats');
    const today = new Date();
    const todayStr = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    stats.innerText = `💡 检索完成，共找到 ${data.length} 位小伙伴`;

    if (data.length === 0) {
        container.innerHTML = '<div class="empty-state">没有找到匹配的小伙伴哦 😅</div>';
        return;
    }

    container.innerHTML = data.map((item, index) => {
        // 判断是否是今天生日（公历）
        const isToday = (item.moon === 0 && item.month_day === todayStr);
        return `
        <div class="result-card ${isToday ? 'today-highlight' : ''}" onclick="showDetail(${index})">
            ${isToday ? '<div class="today-badge">Today!</div>' : ''}
            <div class="name">${item.nickname}</div>
            <div class="date">
                🎂 ${item.month_day}
                ${item.moon === 1 ? '<span class="lunar-tag">农历</span>' : ''}
            </div>
            <div class="part-info">📍 ${item.year}届 · ${item.part}</div>
        </div>
    `}).join('');
}

// 显示详情弹窗
function showDetail(index) {
    const person = lastFilteredData[index];
    const modal = document.getElementById('detailModal');
    const body = document.getElementById('modalBody');
    
    // 专属文案
    const footerText = (person.nickname === '芝士条') 
        ? "🧡初见心欢，久处仍怦然🧡" 
        : "✨ 既然相遇，就是缘分 ✨";

    body.innerHTML = `
        <h2 style="color:var(--zju-blue); text-align:center; margin-bottom:20px; word-break: break-all;">${person.nickname}</h2>
        <div class="detail-item"><span class="detail-label">届别：</span>20${person.year}年</div>
        <div class="detail-item"><span class="detail-label">所属部门：</span>${person.part}</div>
        <div class="detail-item"><span class="detail-label">生日：</span>${person.month_day} ${person.moon === 1 ? '<span class="lunar-tag">农历</span>' : ''}</div>
        <p style="text-align:center; color:#999; font-size:14px; margin-top:30px; font-weight: 500;">${footerText}</p>
    `;
    modal.style.display = "block";
}

// 关闭弹窗
function closeModal() {
    document.getElementById('detailModal').style.display = "none";
}

// 点击弹窗外部区域自动关闭
window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    if (event.target == modal) {
        closeModal();
    }
}