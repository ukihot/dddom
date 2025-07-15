import { AnalysisStrategy } from './base.js';

export class LOFStrategy extends AnalysisStrategy {
    /**
     * @param {import('./base.js').AnalysisProps} props
     */
    async run(props) {
        console.log('LOF解析開始', props);
        // TODO: LOF解析の実装
    }
}
