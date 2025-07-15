import { AnalysisStrategy } from './base.js';
import { renderOriginalTable } from '../ui/table.js';
import { chartIt } from '../ui/chartDomo.js';
import { groupBy, zscoreArray } from './utils/stats.js';
import { UriageColumns } from '../defs/uriageColumns.js';

// Zスコア閾値・最小サンプル数
const ZSCORE_THRESHOLD = 2;
const MIN_SAMPLE_SIZE = 5;

// 共通: Zスコア異常値抽出
function extractZScoreAnomalies({ data, zscoreFunc, threshold = ZSCORE_THRESHOLD, minSample = MIN_SAMPLE_SIZE }) {
    if (!Array.isArray(data) || data.length < minSample) return { z: [], anomalies: [] };
    const z = zscoreFunc(data);
    const anomalies = [];
    for (let i = 0; i < data.length; i++) {
        if (Math.abs(z[i]) > threshold) anomalies.push(i);
    }
    return { z, anomalies };
}

export class ZScoreStrategy extends AnalysisStrategy {
    /**
     * @param {import('./base.js').AnalysisProps} props
     */

    async run(props, rawData) {
        console.log('Zスコア解析処理開始', props);
        const { columns, rows } = rawData;

        const colIdx = Object.fromEntries(columns.map((col, idx) => [col.name, idx]));

        // salesType等によるフィルタリング
        const filteredRows = AnalysisStrategy.filterRows(props, colIdx, rows);

        // グループ化キー生成
        const makeGroupKey = AnalysisStrategy.makeGroupKeyFactory(props, colIdx);
        const { compareByCustomer = false, compareByDepartment = false, compareByProduct = false } = props;

        // 1. 顧客・部署・商品での異常値テーブル
        this.renderDynamicAnomaly({ rows: filteredRows, colIdx, makeGroupKey, compareByCustomer, compareByDepartment, compareByProduct });

        // 2. 単価・原価異常値
        this.renderPriceFluctuation({ rows: filteredRows, colIdx });

        // 3. 利益率異常値（全体 or 商品単位）
        this.renderProfitAndCostScreening({ rows: filteredRows, colIdx });
    }

    /**
     * 部署・顧客・商品での任意組み合わせで異常値テーブルを生成
     */
    renderDynamicAnomaly({ rows, colIdx, makeGroupKey, compareByCustomer, compareByDepartment, compareByProduct }) {
        // グループ化
        const grouped = groupBy(rows, makeGroupKey);
        const resultRows = [];
        for (const [key, group] of Object.entries(grouped)) {
            if (group.length < MIN_SAMPLE_SIZE) continue;
            // 売上金額・数量
            const salesArray = group.map(row => row[colIdx[UriageColumns.SALES_AMOUNT]]);
            const quantityArray = group.map(row => row[colIdx[UriageColumns.QUANTITY]]);
            const { z: salesZ, anomalies: salesAnomIdx } = extractZScoreAnomalies({ data: salesArray, zscoreFunc: zscoreArray });
            const { z: qtyZ, anomalies: qtyAnomIdx } = extractZScoreAnomalies({ data: quantityArray, zscoreFunc: zscoreArray });
            const allIdx = Array.from(new Set([...salesAnomIdx, ...qtyAnomIdx]));
            for (const i of allIdx) {
                const row = group[i];
                const out = [];
                if (compareByDepartment) out.push(row[colIdx[UriageColumns.DEPARTMENT]]);
                if (compareByCustomer) out.push(row[colIdx[UriageColumns.CLIENT]]);
                if (compareByProduct) out.push(row[colIdx[UriageColumns.PRODUCT]]);
                out.push(row[colIdx[UriageColumns.SALES_DATE]]);
                out.push(Number(row[colIdx[UriageColumns.SALES_AMOUNT]]).toFixed(2));
                out.push(salesZ[i] !== undefined ? Number(salesZ[i]).toFixed(2) : '');
                out.push(Number(row[colIdx[UriageColumns.QUANTITY]]).toFixed(2));
                out.push(qtyZ[i] !== undefined ? Number(qtyZ[i]).toFixed(2) : '');
                resultRows.push(out);
            }
        }
        // カラム定義
        const columns = [];
        if (compareByDepartment) columns.push({ type: 'STRING', name: UriageColumns.DEPARTMENT });
        if (compareByCustomer) columns.push({ type: 'STRING', name: UriageColumns.CLIENT });
        if (compareByProduct) columns.push({ type: 'STRING', name: UriageColumns.PRODUCT });

        columns.push({ type: 'STRING', name: UriageColumns.SALES_DATE });
        columns.push({ type: 'DOUBLE', name: UriageColumns.SALES_AMOUNT });
        columns.push({ type: 'DOUBLE', name: UriageColumns.SALES_AMOUNT + '標準偏差' });
        columns.push({ type: 'DOUBLE', name: UriageColumns.QUANTITY });
        columns.push({ type: 'DOUBLE', name: UriageColumns.QUANTITY + '標準偏差' });

        const tableData = {
            columns,
            rows: resultRows
        };
        console.info('ZScoreStrategy: 動的異常値テーブル', tableData);
        renderOriginalTable({
            id: 'resultSection1',
            data: tableData,
            height: 420
        });
    }

    renderPriceFluctuation({ rows, colIdx }) {
        // 商品単位で単価・原価のZスコア異常値を抽出
        const grouped = groupBy(rows, row => row[colIdx[UriageColumns.PRODUCT]]);
        const timeSeries = [];
        for (const [productId, group] of Object.entries(grouped)) {
            if (group.length < MIN_SAMPLE_SIZE) continue;
            // 日付でソート
            const sorted = group.slice().sort((a, b) => new Date(a[colIdx[UriageColumns.SALES_DATE]]) - new Date(b[colIdx[UriageColumns.SALES_DATE]]));
            const prices = sorted.map(r => r[colIdx[UriageColumns.SALES_UNIT_PRICE]]);
            const costs = sorted.map(r => r[colIdx[UriageColumns.COST_UNIT_PRICE]]);
            const { anomalies: priceAnomIdx } = extractZScoreAnomalies({ data: prices, zscoreFunc: zscoreArray });
            const { anomalies: costAnomIdx } = extractZScoreAnomalies({ data: costs, zscoreFunc: zscoreArray });
            const allIdx = Array.from(new Set([...priceAnomIdx, ...costAnomIdx]));
            for (const i of allIdx) {
                timeSeries.push([
                    sorted[i][colIdx[UriageColumns.SALES_DATE]],
                    Number(sorted[i][colIdx[UriageColumns.SALES_UNIT_PRICE]]).toFixed(2),
                    Number(sorted[i][colIdx[UriageColumns.COST_UNIT_PRICE]]).toFixed(2),
                    productId
                ]);
            }
        }
        const chartData = {
            columns: [
                { type: 'STRING', name: UriageColumns.SALES_DATE, mapping: DomoPhoenix.MAPPING.ITEM },
                { type: 'DOUBLE', name: UriageColumns.SALES_UNIT_PRICE, mapping: DomoPhoenix.MAPPING.VALUE },
                { type: 'DOUBLE', name: UriageColumns.COST_UNIT_PRICE, mapping: DomoPhoenix.MAPPING.VALUE },
                { type: 'STRING', name: UriageColumns.PRODUCT, mapping: DomoPhoenix.MAPPING.SERIES }
            ],
            rows: timeSeries
        };
        console.info('ZScoreStrategy: 単価・原価異常値チャートデータ', chartData);
        chartIt({
            id: 'resultSection2',
            chartType: 'LINE',
            data: chartData,
            width: 750,
            height: 420
        });
    }

    renderProfitAndCostScreening({ rows, colIdx }) {
        // 利益率 = (売単価 - 原単価) / 売単価 のZスコア異常値を抽出
        const profitRates = [];
        const validIdx = [];
        for (let i = 0; i < rows.length; i++) {
            const unitPrice = rows[i][colIdx[UriageColumns.SALES_UNIT_PRICE]];
            const costPrice = rows[i][colIdx[UriageColumns.COST_UNIT_PRICE]];
            // 0除算や異常値を除外
            if (typeof unitPrice !== 'number' || typeof costPrice !== 'number' || unitPrice === 0 || !isFinite(unitPrice) || !isFinite(costPrice)) continue;
            const rate = (unitPrice - costPrice) / unitPrice;
            if (!isFinite(rate)) continue;
            profitRates.push(rate);
            validIdx.push(i);
        }
        const { z: zRates, anomalies: anomIdx } = extractZScoreAnomalies({ data: profitRates, zscoreFunc: zscoreArray });
        const result = [];
        for (const idx of anomIdx) {
            const i = validIdx[idx];
            result.push([
                rows[i][colIdx[UriageColumns.CLIENT]],
                rows[i][colIdx[UriageColumns.SALES_DATE]],
                rows[i][colIdx[UriageColumns.PRODUCT]],
                Number(rows[i][colIdx[UriageColumns.SALES_UNIT_PRICE]]).toFixed(2),
                Number(rows[i][colIdx[UriageColumns.COST_UNIT_PRICE]]).toFixed(2),
                Number(profitRates[idx]).toFixed(2),
                Number(zRates[idx]).toFixed(2)
            ]);
        }
        const tableData = {
            columns: [
                { type: 'STRING', name: UriageColumns.CLIENT },
                { type: 'STRING', name: UriageColumns.SALES_DATE },
                { type: 'STRING', name: UriageColumns.PRODUCT },
                { type: 'DOUBLE', name: UriageColumns.SALES_UNIT_PRICE },
                { type: 'DOUBLE', name: UriageColumns.COST_UNIT_PRICE },
                { type: 'DOUBLE', name: '利益率' },
                { type: 'DOUBLE', name: '利益率標準偏差' }
            ],
            rows: result
        };
        console.info('ZScoreStrategy: 利益率異常値テーブル', tableData);
        renderOriginalTable({
            id: 'resultSection3',
            data: tableData,
            height: 420,
            sort: { column: UriageColumns.SALES_DATE, order: 'asc' }
        });
    }
}
