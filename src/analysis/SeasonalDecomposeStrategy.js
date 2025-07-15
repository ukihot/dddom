import { AnalysisStrategy } from './base.js';
import { chartIt } from '../ui/chartDomo.js';
import { groupBy } from './utils/stats.js';
import { UriageColumns } from '../defs/uriageColumns.js';

export class SeasonalDecomposeStrategy extends AnalysisStrategy {
    /**
     * @param {import('./base.js').AnalysisProps} props
     */
    async run(props, rawData) {
        console.log('季節性トレンド分解解析開始', props);
        const { columns, rows } = rawData;

        const colIdx = Object.fromEntries(columns.map((col, idx) => [col.name, idx]));
        // salesType等によるフィルタリング
        const filteredRows = this.constructor.filterRows(props, colIdx, rows);

        // 1. 季節パターン・トレンド変化（STL分解風: 移動平均+周期）
        this.renderSeasonalTrend({ rows: filteredRows, colIdx });

        // 2. 単価の周期的変動（週×月ヒートマップ）
        this.renderUnitPriceHeatmap({ rows: filteredRows, colIdx });

        // 3. 傾向変化点の検出（単純な差分で変化点を検出）
        this.renderTrendChangePoints({ rows: filteredRows, colIdx });
    }
    /**
     * 1. 季節パターン・トレンド変化
     * 原系列・トレンド（移動平均）・季節性（周期成分）・残差を重ね描き
     */
    renderSeasonalTrend({ rows, colIdx }) {
        // 商品ごとに日付昇順で売単価系列を作成
        const grouped = groupBy(rows, row => row[colIdx[UriageColumns.PRODUCT]]);
        let allRows = [];
        for (const [product, group] of Object.entries(grouped)) {
            if (group.length < 10) continue;
            const sorted = group.slice().sort((a, b) => new Date(a[colIdx[UriageColumns.SALES_DATE]]) - new Date(b[colIdx[UriageColumns.SALES_DATE]]));
            const dates = sorted.map(r => r[colIdx[UriageColumns.SALES_DATE]]);
            const values = sorted.map(r => r[colIdx[UriageColumns.SALES_UNIT_PRICE]]);
            // 移動平均（トレンド）
            const window = 7;
            const trend = values.map((_, i, arr) => {
                const s = Math.max(0, i - Math.floor(window / 2));
                const e = Math.min(arr.length, i + Math.ceil(window / 2));
                const sub = arr.slice(s, e);
                return sub.reduce((a, b) => a + b, 0) / sub.length;
            });
            // 季節性（周期成分: 7日周期）
            const period = 7;
            const seasonal = values.map((_, i, arr) => {
                let sum = 0, count = 0;
                for (let j = i % period; j < arr.length; j += period) {
                    sum += arr[j]; count++;
                }
                return count ? sum / count : 0;
            });
            // 残差
            const resid = values.map((v, i) => v - trend[i] - seasonal[i] + trend[0]);
            // 商品名を1列目に追加
            for (let i = 0; i < dates.length; i++) {
                allRows.push([
                    product,
                    dates[i],
                    values[i],
                    trend[i],
                    seasonal[i],
                    resid[i]
                ]);
            }
        }
        if (allRows.length > 0) {
            const chartData = {
                columns: [
                    { type: 'STRING', name: '商品', mapping: DomoPhoenix.MAPPING.SERIES },
                    { type: 'STRING', name: '日付', mapping: DomoPhoenix.MAPPING.ITEM },
                    { type: 'DOUBLE', name: '原系列', mapping: DomoPhoenix.MAPPING.VALUE },
                    { type: 'DOUBLE', name: 'トレンド', mapping: DomoPhoenix.MAPPING.VALUE },
                    { type: 'DOUBLE', name: '季節性', mapping: DomoPhoenix.MAPPING.VALUE },
                    { type: 'DOUBLE', name: '残差', mapping: DomoPhoenix.MAPPING.VALUE }
                ],
                rows: allRows
            };
            console.info('季節性トレンド分解チャートデータ', chartData);
            chartIt({
                id: 'resultSection1',
                chartType: 'LINE',
                data: chartData,
                height: 420
            });
        }
    }

    /**
     * 2. 単価の周期的変動（週×月ヒートマップ）
     */
    renderUnitPriceHeatmap({ rows, colIdx }) {
        // 週番号・月ごとに平均単価を集計
        const weekMonthMap = {};
        for (const row of rows) {
            const date = row[colIdx[UriageColumns.SALES_DATE]];
            const unitPrice = row[colIdx[UriageColumns.SALES_UNIT_PRICE]];
            const d = new Date(date);
            const month = d.getMonth() + 1;
            const week = Math.ceil(d.getDate() / 7);
            const key = `${month}月${week}週`;
            if (!weekMonthMap[key]) weekMonthMap[key] = [];
            weekMonthMap[key].push(unitPrice);
        }
        const keys = Object.keys(weekMonthMap).sort();
        const values = keys.map(k => weekMonthMap[k].reduce((a, b) => a + b, 0) / weekMonthMap[k].length);
        // ヒートマップ用データ
        const chartData = {
            columns: [
                { type: 'STRING', name: '週', mapping: DomoPhoenix.MAPPING.ITEM },
                { type: 'DOUBLE', name: '平均単価', mapping: DomoPhoenix.MAPPING.VALUE }
            ],
            rows: keys.map((k, i) => [k, values[i]])
        };

        console.info('単価の周期的変動ヒートマップデータ', chartData);
        chartIt({
            id: 'resultSection2',
            chartType: 'HEATMAP',
            data: chartData,
            height: 420
        });
    }

    /**
     * 3. 傾向変化点の検出（単純な差分で大きな変化点を検出）
     */
    renderTrendChangePoints({ rows, colIdx }) {
        // 商品ごとに日付昇順で売単価系列を作成
        const grouped = groupBy(rows, row => row[colIdx[UriageColumns.PRODUCT]]);
        let allRows = [];
        for (const [product, group] of Object.entries(grouped)) {
            if (group.length < 10) continue;
            const sorted = group.slice().sort((a, b) => new Date(a[colIdx[UriageColumns.SALES_DATE]]) - new Date(b[colIdx[UriageColumns.SALES_DATE]]));
            const dates = sorted.map(r => r[colIdx[UriageColumns.SALES_DATE]]);
            const values = sorted.map(r => r[colIdx[UriageColumns.SALES_UNIT_PRICE]]);
            // 差分
            const diffs = values.map((v, i, arr) => i === 0 ? 0 : v - arr[i - 1]);
            // 変化点（差分が標準偏差の2倍超）
            const mean = diffs.reduce((a, b) => a + b, 0) / diffs.length;
            const std = Math.sqrt(diffs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / diffs.length);
            const changePoints = diffs.map((d, i) => Math.abs(d) > 2 * std ? 1 : 0);
            // 商品名を1列目に追加
            for (let i = 0; i < dates.length; i++) {
                allRows.push([
                    product,
                    dates[i],
                    values[i],
                    changePoints[i]
                ]);
            }
        }
        if (allRows.length > 0) {
            const chartData = {
                columns: [
                    { type: 'STRING', name: '商品', mapping: DomoPhoenix.MAPPING.SERIES },
                    { type: 'STRING', name: '日付', mapping: DomoPhoenix.MAPPING.ITEM },
                    { type: 'DOUBLE', name: '売単価', mapping: DomoPhoenix.MAPPING.VALUE },
                    { type: 'DOUBLE', name: '変化点', mapping: DomoPhoenix.MAPPING.SERIES }
                ],
                rows: allRows
            };
            console.info('傾向変化点検出チャートデータ', chartData);
            chartIt({
                id: 'resultSection3',
                chartType: 'CURVED_LINE',
                data: chartData,
                height: 420
            });
        }
    }
}
