import { AnalysisStrategy } from './base.js';

export class BOCPDStrategy extends AnalysisStrategy {
    /**
     * @param {import('./base.js').AnalysisProps} props
     */
    async run(props) {
        console.log('BOCPD解析開始', props);
        // TODO: BOCPD解析の実装
    }
}
