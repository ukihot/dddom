// グループ化ユーティリティ
export function groupBy(array, keyFn) {
    return array.reduce((result, item) => {
        const key = keyFn(item);
        if (!result[key]) result[key] = [];
        result[key].push(item);
        return result;
    }, {});
}

// Zスコア配列計算ユーティリティ
export function zscoreArray(arr) {
    const n = arr.length;
    if (n === 0) return [];
    const mean = arr.reduce((a, b) => a + b, 0) / n;
    const std = Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n);
    if (std === 0) return arr.map(() => 0);
    return arr.map(v => (v - mean) / std);
}
