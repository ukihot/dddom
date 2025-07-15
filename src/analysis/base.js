import { UriageColumns } from '../defs/uriageColumns.js';

export class AnalysisStrategy {
    /**
     * 比較条件からグループキー生成関数を返す
     * @param {object} props - 比較条件（compareByDepartment, compareByCustomer, compareByProduct）
     * @param {object} colIdx - 列名→インデックスのマップ
     * @returns {(row: any[]) => string}
     */
    static makeGroupKeyFactory(props, colIdx) {
        const { compareByDepartment = false, compareByCustomer = false, compareByProduct = false, salesType } = props;
        return function (row) {
            let keys = [];
            if (compareByDepartment) keys.push(row[colIdx[UriageColumns.DEPARTMENT]]);
            if (compareByCustomer) keys.push(row[colIdx[UriageColumns.CLIENT]]);
            if (compareByProduct) keys.push(row[colIdx[UriageColumns.PRODUCT]]);
            // 日付は常に含める
            keys.push(row[colIdx[UriageColumns.SALES_DATE]]);
            return keys.join('__');
        };
    }

    /**
     * salesTypeによるCLIENT_TYPEフィルタを行う
     * @param {object} props - 比較条件（salesTypeなど）
     * @param {object} colIdx - 列名→インデックスのマップ
     * @param {any[][]} rows - データ行
     * @returns {any[][]} フィルタ済みrows
     */
    static filterRows(props, colIdx, rows) {
        const { salesType } = props;
        if (!salesType) return rows;
        if (!colIdx[UriageColumns.CLIENT_TYPE]) return rows;
        if (salesType === 'internal') {
            return rows.filter(row => row[colIdx[UriageColumns.CLIENT_TYPE]] === 9);
        } else if (salesType === 'external') {
            return rows.filter(row => row[colIdx[UriageColumns.CLIENT_TYPE]] !== 9);
        }
        return rows;
    }

    async run(props, data) {
        throw new Error('run(props, data) must be implemented');
    }
}
