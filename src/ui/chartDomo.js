export function chartIt({ data, id, chartType = 'BAR', width = 650, height = 400, }) {
    const container = document.getElementById(id);
    container.innerHTML = '';
    if (!data.rows || data.rows.length === 0) {
        // データが0件なら異常なし表示
        const msg = document.createElement('div');
        msg.textContent = '異常値はありません';
        msg.style.textAlign = 'center';
        msg.style.padding = '2em';
        msg.style.color = '#666';
        container.appendChild(msg);
        return;
    }

    const type = DomoPhoenix.CHART_TYPE[chartType.toUpperCase()];
    const options = { width, height };
    const chart = new DomoPhoenix.Chart(type, data, options);
    container.appendChild(chart.canvas);
    chart.render();
}
