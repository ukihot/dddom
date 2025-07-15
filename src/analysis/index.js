import { ZScoreStrategy } from './ZScoreStrategy.js';
import { SeasonalDecomposeStrategy } from './SeasonalDecomposeStrategy.js';
import { PCAStrategy } from './PCAStrategy.js';
import { IsolationForestStrategy } from './IsolationForestStrategy.js';
import { LOFStrategy } from './LOFStrategy.js';
import { SHAPStrategy } from './SHAPStrategy.js';
import { AutoencoderStrategy } from './AutoencoderStrategy.js';
import { CUSUMStrategy } from './CUSUMStrategy.js';
import { BOCPDStrategy } from './BOCPDStrategy.js';
import { BasketStrategy } from './BasketStrategy.js';
import { AnalysisMode } from '../defs/analysisMode.js';

export function getStrategy(mode) {
    switch (mode) {
        case AnalysisMode.ZSCORE: return new ZScoreStrategy();
        case AnalysisMode.STL: return new SeasonalDecomposeStrategy();
        case AnalysisMode.PCA: return new PCAStrategy();
        case AnalysisMode.ISOLATION_FOREST: return new IsolationForestStrategy();
        case AnalysisMode.LOF: return new LOFStrategy();
        case AnalysisMode.SHAP: return new SHAPStrategy();
        case AnalysisMode.AUTOENCODER: return new AutoencoderStrategy();
        case AnalysisMode.CUSUM: return new CUSUMStrategy();
        case AnalysisMode.BOCPD: return new BOCPDStrategy();
        case AnalysisMode.BASKET: return new BasketStrategy();
        default: throw new Error('不明な解析モードです');
    }
}
