import { AnalysisStrategy } from './base.js';

export class IsolationForestStrategy extends AnalysisStrategy {
    /**
     * @param {import('./base.js').AnalysisProps} props
     */
    async run(props) {
        console.log('Isolation Forest解析開始', props);
        // TODO: Isolation Forest解析の実装
    }
}
