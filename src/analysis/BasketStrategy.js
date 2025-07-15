import { AnalysisStrategy } from './base.js';

export class BasketStrategy extends AnalysisStrategy {
    /**
     * @param {import('./base.js').AnalysisProps} props
     */
    async run(props) {
        console.log('Basket解析開始', props);
        // TODO: Basket解析の実装
    }
}
