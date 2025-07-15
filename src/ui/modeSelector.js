// 統計解析モードセレクタのUIロジック
import { AnalysisMode } from '../defs/analysisMode.js';
import { explanations } from '../defs/explanations.js';

const MODE_LABELS = [
    { value: AnalysisMode.ZSCORE, label: 'Zスコア' },
    { value: AnalysisMode.STL, label: '季節トレンド分解（STL）' },
    { value: AnalysisMode.PCA, label: '主成分分析（PCA）' },
    { value: AnalysisMode.ISOLATION_FOREST, label: 'Isolation Forest' },
    { value: AnalysisMode.LOF, label: 'LOF（局所外れ因子）' },
    { value: AnalysisMode.SHAP, label: 'SHAP（寄与要因分析）' },
    { value: AnalysisMode.AUTOENCODER, label: 'Autoencoder' },
    { value: AnalysisMode.CUSUM, label: 'CUSUM' },
    { value: AnalysisMode.BOCPD, label: 'BOCPD（ベイズ変化点検出）' },
    { value: AnalysisMode.BASKET, label: 'Basket分析（+異常スコア）' },
];

export function setupModeSelector() {
    const block = document.getElementById('modeSelectorBlock');
    if (!block) return;
    block.innerHTML = '';
    const label = document.createElement('label');
    label.setAttribute('for', 'modeSelector');
    label.textContent = '統計解析モード';
    const selector = document.createElement('select');
    selector.id = 'modeSelector';
    selector.className = 'mode-dropdown';
    MODE_LABELS.forEach(({ value, label }) => {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = label;
        selector.appendChild(opt);
    });
    block.appendChild(label);
    block.appendChild(selector);


    const sectionTitles = document.querySelectorAll('h2.section-title');
    const subTitles = document.querySelectorAll('h3.sub-title');
    const descElem = document.getElementById('modeDescription');

    selector.addEventListener('change', () => {
        const mode = selector.value;
        const info = explanations[mode];
        if (!info) return;

        sectionTitles.forEach((el, idx) => {
            el.textContent = info.sectionTitles[idx] || '';
        });
        subTitles.forEach((el, idx) => {
            el.textContent = info.subTitles[idx] || '';
        });
        descElem.textContent = info.description || '';
    });

    // 初期化時にイベント発火して内容をセット
    selector.dispatchEvent(new Event('change'));
}
