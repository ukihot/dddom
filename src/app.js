import { fetchUriageData } from './queries/fetchUriageData.js';
import { setupModeSelector } from './ui/modeSelector.js';
import { setupDateSelectors } from './ui/uiHandlers.js';
import { CompareConditions } from './ui/compareOptions.js';
import { getStrategy } from './analysis/index.js';
import { showAllLoading } from './ui/loading.js';

/**
 * 初期化処理（イベント登録）
 */

let compareConditions;
function initializeUI() {
    setupModeSelector();
    setupDateSelectors();
    compareConditions = new CompareConditions();
    compareConditions.setupUI();

    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.addEventListener('click', handleAnalyzeClick);
}

/**
 * 分析ボタン押下時の処理
 */
async function handleAnalyzeClick() {
    showAllLoading(3); // section1〜3 ローディング表示

    const mode = document.getElementById('modeSelector').value;
    const props = compareConditions.createProps();
    fetchUriageData(props.recentMonthWindow)
        .then(rawData => {
            const strategy = getStrategy(mode);
            return strategy.run(props, rawData);
        })
        .catch(error => {
            console.error('解析エラー:', error);
            alert(error.message || '不明な解析モードまたは処理エラーが発生しました');
        });
}

/**
 * エントリーポイント
 */
async function main() {
    try {
        initializeUI();
    } catch (e) {
        console.error('初期化失敗:', e);
    }
}

window.addEventListener('DOMContentLoaded', main);
