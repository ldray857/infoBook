let birthdayData = [];
let lastFilteredData = []; 
let selectedMonths = new Set();
let currentMode = 'nickname'; // 默认匹配 HTML 中带有 active 类的按钮

document.addEventListener('DOMContentLoaded', () => {
    initMonthGrid();
    loadData();

    // 模式切换监听
    document.querySelectorAll('.btn-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            toggleMode(e.target.dataset.mode);
        });
    });

    // 搜索触发
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    
    // 输入框回车支持
    document.getElementById('nameInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
});

async function loadData() {
    try {
        const response = await fetch('./data/friends.json');
        if (!response.ok) throw new Error();
        birthdayData = await response.json();
    } catch (error) {
        document.getElementById('resultsContainer').innerHTML = '<div class="empty-state">❌ 无法加载数据，请检查 data/friends.json</div>';
    }
}

function initMonthGrid() {
    const grid = document.getElementById('monthGrid');
    for (let i = 1; i <= 12; i++) {
        const val = i.toString().padStart(2, '0');
        const chip = document.createElement('div');
        chip.className = 'month-chip';
        chip.innerText = `${i}月`;
        chip.onclick = () => {
            chip.classList.toggle('selected');
            selectedMonths.has(val) ? selectedMonths.delete(val) : selectedMonths.add(val);
        };
        grid.appendChild(chip);
    }
}

function toggleMode(mode) {
    currentMode = mode;
    const nickOpt = document.getElementById('nicknameOptions');
    const monthOpt = document.getElementById('monthOptions');
    
    if (mode === 'nickname') {
        nickOpt.style.display = 'block';
        monthOpt.style.display = 'none';
        document.getElementById('nameInput').focus();
    } else {
        nickOpt.style.display = 'none';
        monthOpt.style.display = 'block';
    }
}

function performSearch() {
    if (birthdayData.length === 0) return;
    const selectedYear = document.getElementById('yearSelect').value;

    lastFilteredData = birthdayData.filter(item => {
        // 1. 年份过滤
        const yearMatch = (selectedYear === '全部' || item.year === selectedYear);
        if (!yearMatch) return false;

        if (currentMode === 'nickname') {
            const selectedDept = document.getElementById('deptSelect').value;
            const nameQuery = document.getElementById('nameInput').value.trim().toLowerCase();
            const deptMatch = (selectedDept === '全部' || item.part === selectedDept);
            const nameMatch = (nameQuery === '' || item.nickname.toLowerCase().includes(nameQuery));
            return deptMatch && nameMatch;
        } else {
            // 2. 月份模式过滤
            if (selectedMonths.size === 0) return true;
            return Array.from(selectedMonths).some(m => item.month.includes(m));
        }
    });

    renderResults(lastFilteredData);
}

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

function showDetail(index) {
    const person = lastFilteredData[index];
    const modal = document.getElementById('detailModal');
    const body = document.getElementById('modalBody');
    
    body.innerHTML = `
        <h2 style="color:var(--zju-blue); text-align:center; margin-bottom:20px;">${person.nickname} 的详细资料</h2>
        <div class="detail-item"><span class="detail-label">届别：</span>20${person.year}年</div>
        <div class="detail-item"><span class="detail-label">所属部门：</span>${person.part}</div>
        <div class="detail-item"><span class="detail-label">生日：</span>${person.month_day} ${person.moon === 1 ? '(农历)' : ''}</div>
        <p style="text-align:center; color:#999; font-size:13px; margin-top:30px;">✨ 既然相遇，就是缘分 ✨</p>
    `;
    modal.style.display = "block";
}

function closeModal() {
    document.getElementById('detailModal').style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    if (event.target == modal) closeModal();
}