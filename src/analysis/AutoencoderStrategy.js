import { AnalysisStrategy } from './base.js';

export class AutoencoderStrategy extends AnalysisStrategy {
    /**
     * @param {import('./base.js').AnalysisProps} props
     */
    async run(props) {
        console.log('AutoEncoder解析開始', props);
        // TODO: AutoEncoder解析の実装
    }
}
