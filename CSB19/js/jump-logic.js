/**
 * 按钮瞬移与挑战逻辑
 */
document.addEventListener('DOMContentLoaded', () => {
    const fixBtn = document.getElementById('fixBtn');
    let hoverCount = 0;
    const MAX_HOVER = 5; // 闪躲 5 次后“认输”

    if (!fixBtn) return;

    const moveButton = () => {
        if (hoverCount >= MAX_HOVER) {
            // 达到上限，按钮不再躲避
            fixBtn.innerText = "算了看你可怜，点吧";
            fixBtn.style.position = 'static';
            fixBtn.classList.replace('bg-white', 'bg-green-500');
            fixBtn.classList.replace('text-[#0078D7]', 'text-white');
            
            // 点击后执行跳转（该函数在 index.html 中定义）
            fixBtn.onclick = () => {
                if (typeof onSuccessfulClick === 'function') {
                    onSuccessfulClick();
                }
            };
            return;
        }

        // 计算随机坐标，确保按钮不超出视口
        const padding = 50;
        const x = Math.random() * (window.innerWidth - fixBtn.offsetWidth - padding);
        const y = Math.random() * (window.innerHeight - fixBtn.offsetHeight - padding);

        fixBtn.style.left = `${Math.max(padding, x)}px`;
        fixBtn.style.top = `${Math.max(padding, y)}px`;
        
        hoverCount++;
    };

    // 适配鼠标悬停与移动端触摸
    fixBtn.addEventListener('mouseenter', moveButton);
    fixBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        moveButton();
    });
});