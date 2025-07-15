import { fetchUriageData } from './services/domoApi.js';
import { setupModeSelector } from './ui/modeSelector.js';
import { AnalysisMode } from './data/analysisMode.js';
import { setupDateSelectors } from './ui/uiHandlers.js';

let uriage = [];

window.addEventListener('DOMContentLoaded', async () => {
    // uriage = await fetchUriageData();
    // console.log('uriage data:', uriage);

    setupModeSelector();
    setupDateSelectors();

    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.addEventListener('click', () => {
        // バリデーション: チェックボックスいずれか1つはtrue
        const prevYear = document.getElementById('includePrevYearSameMonth');
        const recent = document.getElementById('includeRecentMonths');
        if (!(prevYear.checked || recent.checked)) {
            alert('チェックボックスのいずれか1つは選択してください。');
            return;
        }

        // 解析関数呼び出し
        const mode = document.getElementById('modeSelector').value;
        // 解析関数はuiHandlers.jsのswitchと同じ
        switch (mode) {
            case AnalysisMode.ZSCORE:
                window.runZScoreAnalysis && window.runZScoreAnalysis();
                break;
            case AnalysisMode.STL:
                window.runSeasonalDecompose && window.runSeasonalDecompose();
                break;
            case AnalysisMode.PCA:
                window.runPCAAnalysis && window.runPCAAnalysis();
                break;
            case AnalysisMode.ISOLATION_FOREST:
                window.runIsolationForest && window.runIsolationForest();
                break;
            case AnalysisMode.LOF:
                window.runLocalOutlierFactor && window.runLocalOutlierFactor();
                break;
            case AnalysisMode.SHAP:
                window.runSHAPAnalysis && window.runSHAPAnalysis();
                break;
            case AnalysisMode.AUTOENCODER:
                window.runAutoencoderAnalysis && window.runAutoencoderAnalysis();
                break;
            case AnalysisMode.CUSUM:
                window.runCUSUMAnalysis && window.runCUSUMAnalysis();
                break;
            case AnalysisMode.BOCPD:
                window.runBOCPDAnalysis && window.runBOCPDAnalysis();
                break;
            case AnalysisMode.BASKET:
                window.runBasketAnalysis && window.runBasketAnalysis();
                break;
            default:
                alert('不明な解析モードです');
        }
    });
});
