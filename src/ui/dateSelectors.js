// 年・月・比較条件など日付系UIロジック
export function setupDateSelectors() {
    const yearSelector = document.getElementById('yearSelector');
    const monthSelector = document.getElementById('monthSelector');
    const includeRecentMonths = document.getElementById('includeRecentMonths');
    const recentMonthWindow = document.getElementById('recentMonthWindow');
    // 「直近xヵ月を比較対象に含める」チェックボックスの挙動
    if (includeRecentMonths && recentMonthWindow) {
        includeRecentMonths.addEventListener('change', () => {
            if (includeRecentMonths.checked) {
                recentMonthWindow.disabled = false;
                // 値が空なら3をセット
                if (!recentMonthWindow.value) {
                    recentMonthWindow.value = '3';
                }
            } else {
                recentMonthWindow.disabled = true;
                recentMonthWindow.value = '';
            }
        });
        // 初期状態
        if (!includeRecentMonths.checked) {
            recentMonthWindow.disabled = true;
            recentMonthWindow.value = '';
        } else {
            recentMonthWindow.disabled = false;
            if (!recentMonthWindow.value) {
                recentMonthWindow.value = '3';
            }
        }
    }

    const current = new Date();
    const currentYear = current.getFullYear();
    const currentMonth = current.getMonth() + 1; // JSは0-indexed

    // 年セレクタ初期化（2015〜現在）
    for (let y = currentYear; y >= 2015; y--) {
        const option = document.createElement('option');
        option.value = y;
        option.textContent = `${y}年`;
        yearSelector.appendChild(option);
    }

    // 月セレクタ初期化
    function populateMonthSelector(selectedYear) {
        monthSelector.innerHTML = '';
        for (let m = 1; m <= 12; m++) {
            const isFuture = selectedYear == currentYear && m > currentMonth;
            if (isFuture) continue;

            const option = document.createElement('option');
            option.value = String(m).padStart(2, '0');
            option.textContent = `${m}月`;
            monthSelector.appendChild(option);
        }
    }

    // 初期状態
    populateMonthSelector(currentYear);

    // 年セレクタ変更時の月セレクタ更新
    yearSelector.addEventListener('change', () => {
        populateMonthSelector(parseInt(yearSelector.value, 10));
    });

    // 初期選択状態の設定
    yearSelector.value = String(currentYear);
    monthSelector.value = String(currentMonth).padStart(2, '0');
}
