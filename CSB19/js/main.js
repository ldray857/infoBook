/**
 * 全局核心交互逻辑
 */
const App = {
    // 视觉反馈：屏幕震动
    shakeScreen(duration = 200) {
        document.body.classList.add('shake-active'); // 需在 CSS 中定义 shake-active 动画
        setTimeout(() => {
            document.body.classList.remove('shake-active');
        }, duration);
    },

    // 视觉反馈：色彩闪烁（通常用于错误提示）
    flashError() {
        const originalBg = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#4a0000';
        setTimeout(() => {
            document.body.style.backgroundColor = originalBg;
        }, 150);
    },

    /**
     * Boss 战核心逻辑
     * @param {number} initialHp 初始血量
     * @param {Function} onWin 胜利回调
     */
    initBossFight(initialHp, onWin) {
        let currentHp = initialHp;
        const hpBar = document.getElementById('hp-bar');
        const hpText = document.getElementById('hp');
        const bossEl = document.getElementById('boss');

        return {
            attack(damage) {
                if (currentHp <= 0) return;

                currentHp -= damage;
                App.shakeScreen(100);
                
                // 更新 UI
                if (hpBar) hpBar.value = currentHp;
                if (hpText) hpText.innerText = Math.max(0, currentHp);

                if (currentHp <= 0) {
                    if (bossEl) bossEl.innerText = "💀";
                    setTimeout(onWin, 800);
                }
            }
        };
    }
};

// 导出供页面使用
window.App = App;