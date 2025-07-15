/**
 * 表を描画
 * @param {Object} params
 * @param {string} params.id - 表示先のDOM要素のID
 * @param {Object} params.data - 表データオブジェクト（columns, rows）
 * @param {number} [params.height=400] - 表の高さ（px）
 * @param {Object} [params.sort] - ソート指定 { column: 列名, order: 'asc'|'desc' }
 */
export function renderOriginalTable({ id, data, height = 400, sort }) {
    const container = document.getElementById(id);
    if (!container) return;


    const { columns, rows } = data;
    let displayRows = rows;
    // ソート指定があればrowsをソート
    if (sort && sort.column) {
        const colIdx = columns.findIndex(col => col.name === sort.column);
        if (colIdx !== -1) {
            displayRows = [...rows].sort((a, b) => {
                // 日付文字列ならDate比較、それ以外は数値/文字列比較
                const aVal = a[colIdx];
                const bVal = b[colIdx];
                // 日付判定: YYYY-MM-DD
                const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                if (typeof aVal === 'string' && typeof bVal === 'string' && dateRegex.test(aVal) && dateRegex.test(bVal)) {
                    const aDate = new Date(aVal);
                    const bDate = new Date(bVal);
                    return sort.order === 'desc' ? bDate - aDate : aDate - bDate;
                }
                // 数値比較
                if (!isNaN(aVal) && !isNaN(bVal)) {
                    return sort.order === 'desc' ? bVal - aVal : aVal - bVal;
                }
                // 文字列比較
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return sort.order === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
                }
                return 0;
            });
        }
    }

    container.innerHTML = '';
    if (!displayRows || displayRows.length === 0) {
        // データが0件なら異常なし表示
        const msg = document.createElement('div');
        msg.textContent = '異常値はありません';
        msg.style.textAlign = 'center';
        msg.style.padding = '2em';
        msg.style.color = '#666';
        container.appendChild(msg);
        return;
    }

    // ラッパー div（スクロール用）
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    wrapper.style.maxHeight = `${height}px`;

    // テーブル作成
    const table = document.createElement('table');
    table.className = 'original-table';

    // ヘッダー
    const thead = table.createTHead();
    const headRow = thead.insertRow();
    columns.forEach(col => {
        const th = document.createElement('th');
        th.innerText = col.name || '';
        headRow.appendChild(th);
    });

    // ボディ
    const tbody = table.createTBody();
    displayRows.forEach((rowData, rowIndex) => {
        const row = tbody.insertRow();
        row.className = rowIndex % 2 === 0 ? 'row-even' : 'row-odd';
        rowData.forEach(cell => {
            const td = row.insertCell();
            td.innerText = cell;
        });
    });

    // DOM描画
    wrapper.appendChild(table);
    container.appendChild(wrapper);
}
