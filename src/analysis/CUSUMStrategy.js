import { AnalysisStrategy } from './base.js';

export class CUSUMStrategy extends AnalysisStrategy {
    /**
     * @param {import('./base.js').AnalysisProps} props
     */
    async run(props) {
        console.log('CUSUM解析開始', props);
        // TODO: CUSUM解析の実装
    }
}
