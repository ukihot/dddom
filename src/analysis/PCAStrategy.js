import { AnalysisStrategy } from './base.js';

export class PCAStrategy extends AnalysisStrategy {
    /**
     * @param {import('./base.js').AnalysisProps} props
     */
    async run(props) {
        console.log('PCA解析処理開始', props);
        // TODO: PCA解析の実装
    }
}
