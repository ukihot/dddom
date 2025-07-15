import { AnalysisStrategy } from './base.js';

export class SHAPStrategy extends AnalysisStrategy {
    /**
     * @param {import('./base.js').AnalysisProps} props
     */
    async run(props) {
        console.log('SHAP解析開始', props);
        // TODO: SHAP解析の実装
    }
}
