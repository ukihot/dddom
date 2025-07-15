// ローディング表示・非表示のユーティリティ
export function showLoading(sectionId) {
    const area = document.getElementById(sectionId);
    if (area) {
        // 既存のローディングオーバーレイを除去
        const oldOverlay = area.querySelector('.loading-overlay');
        if (oldOverlay) oldOverlay.remove();

        // オーバーレイ生成
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-spinner loading-center"></div>
            <div class="loading-message">解析中...</div>
        `;
        area.style.position = 'relative';
        area.appendChild(overlay);
    }
}

export function hideLoading(sectionId) {
    const area = document.getElementById(sectionId);
    if (area) {
        const overlay = area.querySelector('.loading-overlay');
        if (overlay) overlay.remove();
    }
}

export function showAllLoading(sectionCount = 3) {
    for (let i = 1; i <= sectionCount; i++) {
        showLoading(`resultSection${i}`);
    }
}

export function hideAllLoading(sectionCount = 3) {
    for (let i = 1; i <= sectionCount; i++) {
        hideLoading(`resultSection${i}`);
    }
}
