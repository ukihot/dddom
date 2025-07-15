export class CompareConditions {
    constructor() {
        this.options = [
            {
                name: '直近Nヶ月',
                type: 'select',
                id: 'recentMonthWindow',
                min: 3,
                max: 36,
                default: 12
            },
            {
                name: '販売種別',
                type: 'select-sales',
                id: 'salesTypeSelector',
                options: [
                    { value: 'all', text: '全て' },
                    { value: 'external', text: '外部売りのみ' },
                    { value: 'internal', text: '内部売りのみ' }
                ]
            },
            {
                name: '部署別で比較',
                type: 'checkbox',
                id: 'compareByDepartment',
                checked: true
            },
            {
                name: '顧客別で比較',
                type: 'checkbox',
                id: 'compareByCustomer',
                checked: true
            },
            {
                name: '商品別で比較',
                type: 'checkbox',
                id: 'compareByProduct',
                checked: true
            },
        ];
    }

    setupUI() {
        const checkGroup = document.querySelector('.form-block.check-group');
        if (!checkGroup) return;
        checkGroup.innerHTML = '';

        // フィールドセット生成
        const fieldset = document.createElement('fieldset');
        fieldset.className = 'compare-options-group';
        const legend = document.createElement('legend');
        legend.textContent = '比較材料';
        fieldset.appendChild(legend);

        // グリッドラッパー
        const grid = document.createElement('div');
        grid.className = 'compare-options-grid';

        this.options.forEach(option => {
            const col = document.createElement('div');
            col.className = 'compare-col';
            let label = document.createElement('label');
            label.className = 'accent-label margin-top';

            if (option.type === 'checkbox') {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = option.id;
                checkbox.checked = option.checked;
                label.appendChild(checkbox);
                label.append(option.name);
                col.appendChild(label);
            } else if (option.type === 'select') {
                label.htmlFor = option.id;
                label.textContent = option.name + '：';
                const select = document.createElement('select');
                select.id = option.id;
                select.className = 'recent-month-window';
                for (let i = option.min; i <= option.max; i++) {
                    const opt = document.createElement('option');
                    opt.value = String(i);
                    opt.textContent = String(i);
                    if (i === option.default) opt.selected = true;
                    select.appendChild(opt);
                }
                label.appendChild(select);
                col.appendChild(label);
            } else if (option.type === 'select-sales') {
                label.htmlFor = option.id;
                label.textContent = option.name + '：';
                const select = document.createElement('select');
                select.id = option.id;
                select.className = 'sales-type-selector mode-dropdown';
                option.options.forEach(optInfo => {
                    const opt = document.createElement('option');
                    opt.value = optInfo.value;
                    opt.textContent = optInfo.text;
                    select.appendChild(opt);
                });
                label.appendChild(select);
                col.appendChild(label);
            }
            grid.appendChild(col);
        });

        fieldset.appendChild(grid);
        checkGroup.appendChild(fieldset);
    }

    createProps() {
        const year = document.getElementById('yearSelector').value;
        const month = document.getElementById('monthSelector').value;
        const targetYearMonth = `${year}-${month}`;
        const startDate = `${year}-${month}-01`;
        const endDate = (() => {
            const m = parseInt(month, 10);
            const y = parseInt(year, 10);
            const lastDay = new Date(y, m, 0).getDate();
            return `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
        })();
        const recentMonthWindow = document.getElementById('recentMonthWindow').value;
        const compareByCustomer = document.getElementById('compareByCustomer').checked;
        const compareByDepartment = document.getElementById('compareByDepartment').checked;
        const compareByProduct = document.getElementById('compareByProduct').checked;
        const salesType = document.getElementById('salesTypeSelector')?.value || 'all';

        return {
            startDate,
            endDate,
            targetYearMonth,
            recentMonthWindow,
            compareByCustomer,
            compareByDepartment,
            compareByProduct,
            salesType
        };
    }
}
