/**
 * 终点站撒花特效逻辑 - 移动端增强版
 */
function launchCelebration() {
    // 安全检查：如果库没加载成功，直接退出不报错
    if (typeof confetti !== 'function') {
        console.warn('confetti library not loaded');
        return;
    }

    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    
    // 关键修复：显式增加 zIndex，防止在某些手机浏览器上遮挡 UI 或导致白屏
    const defaults = { 
        startVelocity: 30, 
        spread: 360, 
        ticks: 60, 
        zIndex: 100, // 确保在背景之上但在弹窗之下
        useWorker: true // 移动端开启 worker 减轻主线程压力
    };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        const colors = ['#EAB308', '#EC4899', '#3B82F6'];

        // 左侧喷射
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            colors
        });
        
        // 右侧喷射
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors
        });
    }, 250);
}

// 绑定到全局对象
window.launchCelebration = launchCelebration;
