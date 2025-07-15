/**
 * 売上データを取得する（期間指定）
 * @returns {Promise<{columns: Array, rows: Array}>}
 */

import { UriageColumns } from '../defs/uriageColumns.js';

export async function fetchUriageData(monthsAgo = 3) {
    try {
        // columns定義（fetchSampleUriageDataと同じ構造）
        const columns = [
            { type: DomoPhoenix.DATA_TYPE.STRING, name: UriageColumns.CATEGORY, mapping: DomoPhoenix.MAPPING.SERIES },
            { type: DomoPhoenix.DATA_TYPE.STRING, name: UriageColumns.DEPARTMENT, mapping: DomoPhoenix.MAPPING.ITEM },
            { type: DomoPhoenix.DATA_TYPE.STRING, name: UriageColumns.PRODUCT, mapping: DomoPhoenix.MAPPING.ITEM },
            { type: DomoPhoenix.DATA_TYPE.STRING, name: UriageColumns.SPEC, mapping: DomoPhoenix.MAPPING.ITEM },
            { type: DomoPhoenix.DATA_TYPE.STRING, name: UriageColumns.SUPPLIER, mapping: DomoPhoenix.MAPPING.ITEM },
            { type: DomoPhoenix.DATA_TYPE.STRING, name: UriageColumns.SALES_DATE, mapping: DomoPhoenix.MAPPING.ITEM },
            { type: DomoPhoenix.DATA_TYPE.STRING, name: UriageColumns.TYPE, mapping: DomoPhoenix.MAPPING.ITEM },
            { type: DomoPhoenix.DATA_TYPE.STRING, name: UriageColumns.PERSON, mapping: DomoPhoenix.MAPPING.ITEM },
            { type: DomoPhoenix.DATA_TYPE.DOUBLE, name: UriageColumns.QUANTITY, mapping: DomoPhoenix.MAPPING.VALUE },
            { type: DomoPhoenix.DATA_TYPE.DOUBLE, name: UriageColumns.UNIT, mapping: DomoPhoenix.MAPPING.VALUE },
            { type: DomoPhoenix.DATA_TYPE.DOUBLE, name: UriageColumns.COST_UNIT_PRICE, mapping: DomoPhoenix.MAPPING.VALUE },
            { type: DomoPhoenix.DATA_TYPE.DOUBLE, name: UriageColumns.PURCHASE_UNIT_PRICE, mapping: DomoPhoenix.MAPPING.VALUE },
            { type: DomoPhoenix.DATA_TYPE.DOUBLE, name: UriageColumns.SALES_UNIT_PRICE, mapping: DomoPhoenix.MAPPING.VALUE },
            { type: DomoPhoenix.DATA_TYPE.DOUBLE, name: UriageColumns.COST_AMOUNT, mapping: DomoPhoenix.MAPPING.VALUE },
            { type: DomoPhoenix.DATA_TYPE.DOUBLE, name: UriageColumns.PURCHASE_AMOUNT, mapping: DomoPhoenix.MAPPING.VALUE },
            { type: DomoPhoenix.DATA_TYPE.DOUBLE, name: UriageColumns.SALES_AMOUNT, mapping: DomoPhoenix.MAPPING.VALUE },
            { type: DomoPhoenix.DATA_TYPE.DOUBLE, name: UriageColumns.GROSS_PROFIT, mapping: DomoPhoenix.MAPPING.VALUE },
            { type: DomoPhoenix.DATA_TYPE.DOUBLE, name: UriageColumns.CONFIRM_FLAG, mapping: DomoPhoenix.MAPPING.SERIES },
            { type: DomoPhoenix.DATA_TYPE.STRING, name: UriageColumns.BILLING_CUSTOMER, mapping: DomoPhoenix.MAPPING.ITEM },
            { type: DomoPhoenix.DATA_TYPE.STRING, name: UriageColumns.CLIENT, mapping: DomoPhoenix.MAPPING.ITEM },
            { type: DomoPhoenix.DATA_TYPE.STRING, name: UriageColumns.CLIENT_TYPE, mapping: DomoPhoenix.MAPPING.SERIES }
        ];

        // 取得したいカラム名リスト
        const select = columns.map(col => col.name);

        // 期間指定のフィルタ (manifest.json にて列エイリアスが必要)
        const where = [`uriageDate last ${monthsAgo} months`];

        // クエリ文字列を生成
        let query = `/data/v2/uriage?fields=${encodeURIComponent(select.join(','))}`;
        if (where.length > 0) {
            query += `&filter=${encodeURIComponent(where.join(' and '))}`;
        }
        query += `&limit=50000`;

        const data = await domo.get(query);
        // columns順に値を配列化
        const rows = Array.isArray(data)
            ? data.map(rowObj => columns.map(col => rowObj[col.name]))
            : [];

        return { columns, rows };
    } catch (err) {
        console.error('データ取得失敗', err);
        return { columns: [], rows: [] };
    }
}
